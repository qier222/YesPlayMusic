#ifndef RUNNER_MEDIA_SESSION_H_
#define RUNNER_MEDIA_SESSION_H_

#include <flutter/binary_messenger.h>
#include <windows.h>

#include <memory>

class WindowsMediaSession {
 public:
  static constexpr UINT kCommandMessage = WM_APP + 2;

  WindowsMediaSession(HWND window, flutter::BinaryMessenger* messenger);
  ~WindowsMediaSession();

  void DispatchCommand(WPARAM command, LPARAM position);

 private:
  class Impl;
  std::unique_ptr<Impl> impl_;
};

#endif  // RUNNER_MEDIA_SESSION_H_
