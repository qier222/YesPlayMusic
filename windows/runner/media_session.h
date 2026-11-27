#ifndef RUNNER_MEDIA_SESSION_H_
#define RUNNER_MEDIA_SESSION_H_

#include <flutter/binary_messenger.h>
#include <windows.h>

#include <functional>
#include <memory>
#include <string>

struct MediaPlaybackState {
  bool active = false;
  bool playing = false;
  bool shuffle = false;
  bool repeat = false;
  bool liked = false;
  std::wstring title;
  std::wstring artist;

  bool operator==(const MediaPlaybackState& other) const {
    return active == other.active && playing == other.playing &&
           shuffle == other.shuffle && repeat == other.repeat &&
           liked == other.liked && title == other.title &&
           artist == other.artist;
  }

  bool operator!=(const MediaPlaybackState& other) const {
    return !(*this == other);
  }
};

class WindowsMediaSession {
 public:
  static constexpr UINT kCommandMessage = WM_APP + 2;
  using StateCallback = std::function<void(const MediaPlaybackState&)>;

  WindowsMediaSession(HWND window, flutter::BinaryMessenger* messenger,
                      StateCallback on_state_changed = nullptr);
  ~WindowsMediaSession();

  void DispatchCommand();
  void SendCommand(const char* method);

 private:
  class Impl;
  std::unique_ptr<Impl> impl_;
};

#endif  // RUNNER_MEDIA_SESSION_H_
