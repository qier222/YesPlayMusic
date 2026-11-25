#include "media_session.h"

#include <SystemMediaTransportControlsInterop.h>
#include <shcore.h>
#include <shlwapi.h>
#include <flutter/method_channel.h>
#include <flutter/standard_method_codec.h>
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Media.h>
#include <winrt/Windows.Storage.Streams.h>

#include <algorithm>
#include <chrono>
#include <cmath>

namespace {

using namespace winrt::Windows::Media;
using Value = flutter::EncodableValue;
using Map = flutter::EncodableMap;
using TimeSpan = winrt::Windows::Foundation::TimeSpan;
constexpr WPARAM kSeek = 0x100;

template <typename T>
const T* Read(const Map& args, const char* key) {
  const auto it = args.find(Value(key));
  return it == args.end() ? nullptr : std::get_if<T>(&it->second);
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
    case SystemMediaTransportControlsButton::Next: return "next";
    case SystemMediaTransportControlsButton::Previous: return "previous";
    default: return nullptr;
  }
}

}  // namespace

class WindowsMediaSession::Impl {
 public:
  Impl(HWND window, flutter::BinaryMessenger* messenger)
      : window_(window), channel_(messenger, "yesplaymusic/media",
                                 &flutter::StandardMethodCodec::GetInstance()) {
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
      }
    });
  }

  ~Impl() {
    channel_.SetMethodCallHandler(nullptr);
    if (controls_) {
      controls_.ButtonPressed(button_);
      controls_.PlaybackPositionChangeRequested(seek_);
      try {
        Clear();
      } catch (const winrt::hresult_error& error) {
        OutputDebugStringW(error.message().c_str());
      }
    }
  }

  void DispatchCommand(WPARAM command, LPARAM position) {
    if (!active_) return;
    if (command == kSeek) {
      const auto seconds = std::chrono::duration<double>(TimeSpan(position));
      channel_.InvokeMethod("seek", std::make_unique<Value>(seconds.count()));
    } else if (const char* method =
                   ButtonMethod(static_cast<SystemMediaTransportControlsButton>(command))) {
      channel_.InvokeMethod(method, nullptr);
    }
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
    controls.IsNextEnabled(true);
    controls.IsPreviousEnabled(true);
    // WinRT handlers can run off the platform thread. Only the window thread
    // may invoke the Flutter method channel.
    const auto button = controls.ButtonPressed([window = window_](const auto&, const auto& args) {
      PostMessage(window, kCommandMessage, static_cast<WPARAM>(args.Button()), 0);
    });
    try {
      seek_ = controls.PlaybackPositionChangeRequested(
          [window = window_](const auto&, const auto& args) {
            PostMessage(window, kCommandMessage, kSeek,
                        static_cast<LPARAM>(args.RequestedPlaybackPosition().count()));
          });
    } catch (...) {
      controls.ButtonPressed(button);
      throw;
    }
    button_ = button;
    controls_ = controls;
  }

  void Update(const Map& args) {
    const auto* playing = Read<bool>(args, "playing");
    if (!playing) throw winrt::hresult_invalid_argument(L"Missing playback state");
    const auto duration = ReadTime(args, "duration");
    const auto position = std::min(ReadTime(args, "position"), duration);
    if (!controls_) Initialize();

    const auto* artwork_changed = Read<bool>(args, "artworkChanged");
    if (!active_ || (artwork_changed && *artwork_changed)) UpdateMetadata(args);
    SystemMediaTransportControlsTimelineProperties timeline;
    timeline.EndTime(duration);
    timeline.MaxSeekTime(duration);
    timeline.Position(position);
    controls_.UpdateTimelineProperties(timeline);
    controls_.PlaybackStatus(*playing ? MediaPlaybackStatus::Playing
                                      : MediaPlaybackStatus::Paused);
    if (!active_) {
      controls_.IsEnabled(true);
      active_ = true;
    }
  }

  void UpdateMetadata(const Map& args) {
    auto updater = controls_.DisplayUpdater();
    updater.Type(MediaPlaybackType::Music);
    const auto music = updater.MusicProperties();
    music.Title(Text(args, "title"));
    music.Artist(Text(args, "artist"));
    music.AlbumTitle(Text(args, "album"));
    updater.Thumbnail(nullptr);
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
    if (!controls_) return;
    controls_.IsEnabled(false);
    active_ = false;
    controls_.PlaybackStatus(MediaPlaybackStatus::Closed);
    const auto updater = controls_.DisplayUpdater();
    updater.ClearAll();
    updater.Update();
  }

  const HWND window_;
  flutter::MethodChannel<Value> channel_;
  SystemMediaTransportControls controls_{nullptr};
  winrt::event_token button_{}, seek_{};
  bool active_ = false;
};

WindowsMediaSession::WindowsMediaSession(HWND window,
                                         flutter::BinaryMessenger* messenger)
    : impl_(std::make_unique<Impl>(window, messenger)) {}

WindowsMediaSession::~WindowsMediaSession() = default;

void WindowsMediaSession::DispatchCommand(WPARAM command, LPARAM position) {
  impl_->DispatchCommand(command, position);
}
