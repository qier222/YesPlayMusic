#ifndef RUNNER_FLUTTER_WINDOW_H_
#define RUNNER_FLUTTER_WINDOW_H_

#include <flutter/dart_project.h>
#include <flutter/encodable_value.h>
#include <flutter/flutter_view_controller.h>
#include <flutter/method_channel.h>

#include <memory>
#include <string>

#include "media_session.h"
#include "taskbar_controls.h"
#include "win32_window.h"

// A window that does nothing but host a Flutter view.
class FlutterWindow : public Win32Window {
 public:
  // Creates a new FlutterWindow hosting a Flutter view running |project|.
  explicit FlutterWindow(const flutter::DartProject& project);
  virtual ~FlutterWindow();

 protected:
  // Win32Window:
  bool OnCreate() override;
  void OnDestroy() override;
  LRESULT MessageHandler(HWND window, UINT const message, WPARAM const wparam,
                         LPARAM const lparam) noexcept override;

 private:
  // The project to run.
  flutter::DartProject project_;

  // The Flutter instance hosted by this window.
  std::unique_ptr<flutter::FlutterViewController> flutter_controller_;
  std::unique_ptr<TaskbarControls> taskbar_controls_;
  std::unique_ptr<WindowsMediaSession> media_session_;

  // "yesplaymusic/window": drag, caption buttons and their state. The title
  // bar is drawn by Flutter; see WindowButtons in lib/shell.dart.
  std::unique_ptr<flutter::MethodChannel<flutter::EncodableValue>> window_channel_;

  // Last state sent over |window_channel_|, so it's only sent on change.
  bool maximized_ = false;
  bool active_ = true;

  void SendWindowState(bool active);
  void OnPlaybackStateChanged(const MediaPlaybackState& state);

  // Settings → "keep running after closing the window" (sent by Dart as
  // "prefs"). While on, a tray icon is shown and closing only hides the window.
  bool keep_running_ = false;
  bool tray_added_ = false;
  MediaPlaybackState playback_state_;
  std::wstring tray_tip_ = L"YesPlayMusic";
  std::wstring tray_show_label_ = L"Show window";
  std::wstring tray_quit_label_ = L"Quit";
  std::wstring tray_play_label_ = L"Play";
  std::wstring tray_pause_label_ = L"Pause";
  std::wstring tray_prev_label_ = L"Previous";
  std::wstring tray_next_label_ = L"Next";
  std::wstring tray_like_label_ = L"Like";
  std::wstring tray_unlike_label_ = L"Unlike";
  std::wstring tray_shuffle_label_ = L"Shuffle";
  std::wstring tray_repeat_label_ = L"Repeat All";
  std::wstring tray_repeat_one_label_;

  void SetKeepRunning(bool keep_running);
  void AddTrayIcon();
  void RemoveTrayIcon();
  void UpdateTrayTooltip();
  void ShowTrayMenu(POINT at);
  void RestoreWindow();
};

#endif  // RUNNER_FLUTTER_WINDOW_H_
