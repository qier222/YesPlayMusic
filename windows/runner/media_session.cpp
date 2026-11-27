#include "media_session.h"

#include <SystemMediaTransportControlsInterop.h>
#include <flutter/method_channel.h>
#include <flutter/standard_method_codec.h>
#include <shcore.h>
#include <shlwapi.h>
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Media.h>
#include <winrt/Windows.Storage.Streams.h>

#include <algorithm>
#include <chrono>
#include <cmath>
#include <deque>
#include <exception>
#include <mutex>

namespace {

using namespace winrt::Windows::Media;
using Value = flutter::EncodableValue;
using Map = flutter::EncodableMap;
using TimeSpan = winrt::Windows::Foundation::TimeSpan;

template <typename T>
const T* Read(const Map& args, const char* key) {
  const auto it = args.find(Value(key));
  return it == args.end() ? nullptr : std::get_if<T>(&it->second);
}

bool ReadBool(const Map& args, const char* key, bool fallback = false) {
  const auto* value = Read<bool>(args, key);
  return value ? *value : fallback;
}

winrt::hstring Text(const Map& args, const char* key) {
  const auto* text = Read<std::string>(args, key);
  return text ? winrt::to_hstring(*text) : winrt::hstring{};
}

TimeSpan ReadTime(const Map& args, const char* key) {
  const auto* seconds = Read<double>(args, key);
  constexpr double kMaxSeconds = static_cast<double>(INT32_MAX);
  if (!seconds || !std::isfinite(*seconds) || *seconds < 0 ||
      *seconds > kMaxSeconds) {
    throw winrt::hresult_invalid_argument(L"Invalid media timeline time");
  }
  return std::chrono::duration_cast<TimeSpan>(
      std::chrono::duration<double>(*seconds));
}

const char* ButtonMethod(SystemMediaTransportControlsButton button) {
  switch (button) {
    case SystemMediaTransportControlsButton::Play: return "play";
    case SystemMediaTransportControlsButton::Pause: return "pause";
    case SystemMediaTransportControlsButton::Stop: return "stop";
    case SystemMediaTransportControlsButton::Next: return "next";
    case SystemMediaTransportControlsButton::Previous: return "previous";
    default: return nullptr;
  }
}

struct PendingCommand {
  enum class Kind { kButton, kSeek, kShuffle, kRepeat };
  Kind kind;
  SystemMediaTransportControlsButton button =
      SystemMediaTransportControlsButton::Play;
  int64_t seek_ticks = 0;
  bool shuffle = false;
  MediaPlaybackAutoRepeatMode repeat_mode = MediaPlaybackAutoRepeatMode::None;
};

struct CommandQueue {
  std::mutex mutex;
  std::deque<PendingCommand> items;
};

void PostCommand(HWND window, const std::shared_ptr<CommandQueue>& queue,
                 PendingCommand cmd) {
  {
    std::lock_guard<std::mutex> lock(queue->mutex);
    queue->items.push_back(cmd);
  }
  PostMessage(window, WindowsMediaSession::kCommandMessage, 0, 0);
}

}  // namespace

class WindowsMediaSession::Impl {
 public:
  Impl(HWND window, flutter::BinaryMessenger* messenger,
       StateCallback on_state_changed)
      : window_(window),
        channel_(messenger, "yesplaymusic/media",
                 &flutter::StandardMethodCodec::GetInstance()),
        on_state_changed_(std::move(on_state_changed)),
        queue_(std::make_shared<CommandQueue>()) {
    channel_.SetMethodCallHandler([this](const auto& call, auto result) {
      try {
        if (call.method_name() == "clear") {
          Clear();
        } else if (call.method_name() == "update") {
          const auto* args = call.arguments();
          if (!args || !std::holds_alternative<Map>(*args)) {
            result->Error("smtc_arguments", "Expected media properties");
            return;
          }
          Update(std::get<Map>(*args));
        } else if (call.method_name() == "artwork") {
          const auto* args = call.arguments();
          const auto* bytes = args ? std::get_if<std::vector<uint8_t>>(args) : nullptr;
          if (!active_ || !bytes || bytes->empty() || bytes->size() > UINT_MAX) {
            result->Error("smtc_arguments", "Expected artwork for an active session");
            return;
          }
          UpdateArtwork(*bytes);
        } else {
          result->NotImplemented();
          return;
        }
        result->Success();
      } catch (const winrt::hresult_error& error) {
        result->Error("smtc", winrt::to_string(error.message()),
                      Value(static_cast<int32_t>(error.code())));
      } catch (const std::exception& error) {
        result->Error("smtc", error.what());
      }
    });
  }

  ~Impl() {
    on_state_changed_ = nullptr;
    channel_.SetMethodCallHandler(nullptr);
    if (controls_) {
      controls_.ButtonPressed(button_);
      controls_.PlaybackPositionChangeRequested(seek_);
      controls_.ShuffleEnabledChangeRequested(shuffle_);
      controls_.AutoRepeatModeChangeRequested(repeat_);
      try {
        Clear();
      } catch (const winrt::hresult_error& error) {
        OutputDebugStringW(error.message().c_str());
      }
    }
  }

  void DispatchCommand() {
    std::deque<PendingCommand> pending;
    {
      std::lock_guard<std::mutex> lock(queue_->mutex);
      pending.swap(queue_->items);
    }
    if (!active_) return;
    for (const auto& cmd : pending) {
      switch (cmd.kind) {
        case PendingCommand::Kind::kButton:
          if (const char* method = ButtonMethod(cmd.button)) {
            channel_.InvokeMethod(method, nullptr);
          }
          break;
        case PendingCommand::Kind::kSeek: {
          const auto seconds =
              std::chrono::duration<double>(TimeSpan(cmd.seek_ticks));
          channel_.InvokeMethod("seek", std::make_unique<Value>(seconds.count()));
          break;
        }
        case PendingCommand::Kind::kShuffle:
          channel_.InvokeMethod("shuffle", std::make_unique<Value>(cmd.shuffle));
          break;
        case PendingCommand::Kind::kRepeat: {
          // AppState supports list repeat on/off; map Track requests as a toggle
          // so cycling through repeat modes never gets stuck.
          const bool target =
              cmd.repeat_mode == MediaPlaybackAutoRepeatMode::None
                  ? false
                  : (cmd.repeat_mode == MediaPlaybackAutoRepeatMode::List
                         ? true
                         : !state_.repeat);
          channel_.InvokeMethod("repeat", std::make_unique<Value>(target));
          break;
        }
      }
    }
  }

  void SendCommand(const char* method) {
    if (!active_ || !method) return;
    channel_.InvokeMethod(method, nullptr);
  }

 private:
  void Initialize() {
    const auto interop = winrt::get_activation_factory<
        SystemMediaTransportControls, ISystemMediaTransportControlsInterop>();
    SystemMediaTransportControls controls{nullptr};
    winrt::check_hresult(interop->GetForWindow(
        window_, winrt::guid_of<ISystemMediaTransportControls>(),
        winrt::put_abi(controls)));
    controls.IsPlayEnabled(true);
    controls.IsPauseEnabled(true);
    controls.IsStopEnabled(true);
    controls.IsNextEnabled(true);
    controls.IsPreviousEnabled(true);

    // WinRT handlers can run off the platform thread. Capture only value handles
    // and marshal commands back to the window thread before invoking Dart.
    const HWND window = window_;
    const auto queue = queue_;
    const auto button = controls.ButtonPressed(
        [window, queue](const auto&, const auto& args) {
          PendingCommand cmd;
          cmd.kind = PendingCommand::Kind::kButton;
          cmd.button = args.Button();
          PostCommand(window, queue, cmd);
        });
    winrt::event_token seek{}, shuffle{}, repeat{};
    try {
      seek = controls.PlaybackPositionChangeRequested(
          [window, queue](const auto&, const auto& args) {
            PendingCommand cmd;
            cmd.kind = PendingCommand::Kind::kSeek;
            cmd.seek_ticks = args.RequestedPlaybackPosition().count();
            PostCommand(window, queue, cmd);
          });
      shuffle = controls.ShuffleEnabledChangeRequested(
          [window, queue](const auto&, const auto& args) {
            PendingCommand cmd;
            cmd.kind = PendingCommand::Kind::kShuffle;
            cmd.shuffle = args.RequestedShuffleEnabled();
            PostCommand(window, queue, cmd);
          });
      repeat = controls.AutoRepeatModeChangeRequested(
          [window, queue](const auto&, const auto& args) {
            PendingCommand cmd;
            cmd.kind = PendingCommand::Kind::kRepeat;
            cmd.repeat_mode = args.RequestedAutoRepeatMode();
            PostCommand(window, queue, cmd);
          });
    } catch (...) {
      if (repeat.value) controls.AutoRepeatModeChangeRequested(repeat);
      if (shuffle.value) controls.ShuffleEnabledChangeRequested(shuffle);
      if (seek.value) controls.PlaybackPositionChangeRequested(seek);
      controls.ButtonPressed(button);
      throw;
    }
    button_ = button;
    seek_ = seek;
    shuffle_ = shuffle;
    repeat_ = repeat;
    controls_ = controls;
  }

  void Update(const Map& args) {
    const auto* playing = Read<bool>(args, "playing");
    if (!playing) throw winrt::hresult_invalid_argument(L"Missing playback state");
    const auto duration = ReadTime(args, "duration");
    const auto position = std::min(ReadTime(args, "position"), duration);
    const bool shuffle = ReadBool(args, "shuffle");
    const bool repeat = ReadBool(args, "repeat");
    const bool liked = ReadBool(args, "liked");
    const winrt::hstring title = Text(args, "title");
    const winrt::hstring artist = Text(args, "artist");
    const winrt::hstring album = Text(args, "album");
    if (!controls_) Initialize();

    const auto* artwork_changed = Read<bool>(args, "artworkChanged");
    const bool reset_artwork = !active_ || (artwork_changed && *artwork_changed);
    const bool text_changed =
        title != state_.title || artist != state_.artist;
    if (reset_artwork || text_changed) {
      UpdateMetadata(title, artist, album, reset_artwork);
    }

    SystemMediaTransportControlsTimelineProperties timeline;
    timeline.StartTime(TimeSpan(0));
    timeline.MinSeekTime(TimeSpan(0));
    timeline.EndTime(duration);
    timeline.MaxSeekTime(duration);
    timeline.Position(position);
    controls_.UpdateTimelineProperties(timeline);
    controls_.PlaybackStatus(*playing ? MediaPlaybackStatus::Playing
                                      : MediaPlaybackStatus::Paused);
    controls_.PlaybackRate(*playing ? 1.0 : 0.0);
    controls_.ShuffleEnabled(shuffle);
    controls_.AutoRepeatMode(repeat ? MediaPlaybackAutoRepeatMode::List
                                    : MediaPlaybackAutoRepeatMode::None);
    if (!active_) {
      controls_.IsEnabled(true);
      active_ = true;
    }

    MediaPlaybackState next_state{
        true, *playing, shuffle, repeat, liked,
        std::wstring(title), std::wstring(artist),
    };
    if (next_state != state_) {
      state_ = std::move(next_state);
      if (on_state_changed_) on_state_changed_(state_);
    }
  }

  void UpdateMetadata(const winrt::hstring& title, const winrt::hstring& artist,
                      const winrt::hstring& album, bool clear_thumbnail) {
    auto updater = controls_.DisplayUpdater();
    updater.Type(MediaPlaybackType::Music);
    const auto music = updater.MusicProperties();
    music.Title(title);
    music.Artist(artist);
    music.AlbumTitle(album);
    if (clear_thumbnail) updater.Thumbnail(nullptr);
    updater.Update();
  }

  void UpdateArtwork(const std::vector<uint8_t>& bytes) {
    using namespace winrt::Windows::Storage::Streams;
    winrt::com_ptr<IStream> memory;
    memory.attach(SHCreateMemStream(bytes.data(), static_cast<UINT>(bytes.size())));
    if (!memory) throw winrt::hresult_error(E_OUTOFMEMORY);
    IRandomAccessStream stream{nullptr};
    winrt::check_hresult(CreateRandomAccessStreamOverStream(
        memory.get(), BSOS_DEFAULT, winrt::guid_of<IRandomAccessStream>(),
        winrt::put_abi(stream)));
    const auto updater = controls_.DisplayUpdater();
    updater.Thumbnail(RandomAccessStreamReference::CreateFromStream(stream));
    updater.Update();
  }

  void Clear() {
    if (controls_) {
      controls_.IsEnabled(false);
      controls_.PlaybackStatus(MediaPlaybackStatus::Closed);
      const auto updater = controls_.DisplayUpdater();
      updater.ClearAll();
      updater.Update();
    }
    const bool was_active = active_ || state_.active;
    active_ = false;
    state_ = MediaPlaybackState{};
    if (was_active && on_state_changed_) {
      on_state_changed_(state_);
    }
  }

  const HWND window_;
  flutter::MethodChannel<Value> channel_;
  StateCallback on_state_changed_;
  std::shared_ptr<CommandQueue> queue_;
  SystemMediaTransportControls controls_{nullptr};
  winrt::event_token button_{}, seek_{}, shuffle_{}, repeat_{};
  bool active_ = false;
  MediaPlaybackState state_;
};

WindowsMediaSession::WindowsMediaSession(HWND window,
                                         flutter::BinaryMessenger* messenger,
                                         StateCallback on_state_changed)
    : impl_(std::make_unique<Impl>(window, messenger,
                                   std::move(on_state_changed))) {}

WindowsMediaSession::~WindowsMediaSession() = default;

void WindowsMediaSession::DispatchCommand() {
  impl_->DispatchCommand();
}

void WindowsMediaSession::SendCommand(const char* method) {
  impl_->SendCommand(method);
}
