#include "flutter_window.h"

#include <commctrl.h>
#include <flutter/standard_method_codec.h>
#include <flutter_windows.h>
#include <shellapi.h>
#include <windowsx.h>

#include <optional>

#include "flutter/generated_plugin_registrant.h"
#include "resource.h"

namespace {

// Callback message and id of the tray icon.
constexpr UINT kTrayMessage = WM_APP + 1;
constexpr UINT kTrayId = 1;

// Sent to top-level windows when Explorer restarts; tray icons must be re-added.
const UINT kTaskbarCreated = RegisterWindowMessage(L"TaskbarCreated");

std::wstring Utf16FromUtf8(const std::string& s) {
  if (s.empty()) return std::wstring();
  const int n = MultiByteToWideChar(CP_UTF8, 0, s.data(),
                                    static_cast<int>(s.size()), nullptr, 0);
  std::wstring out(n, L'\0');
  MultiByteToWideChar(CP_UTF8, 0, s.data(), static_cast<int>(s.size()),
                      out.data(), n);
  return out;
}

const flutter::EncodableValue* Lookup(const flutter::EncodableMap& map,
                                      const char* key) {
  auto it = map.find(flutter::EncodableValue(key));
  return it == map.end() ? nullptr : &it->second;
}

// Thickness of the resize frame, in physical pixels. With the title bar
// removed the window keeps this frame on the left, right and bottom; along the
// top it's emulated in WM_NCHITTEST.
int FrameThickness(HWND hwnd) {
  const UINT dpi = GetDpiForWindow(hwnd);
  return GetSystemMetricsForDpi(SM_CYFRAME, dpi) +
         GetSystemMetricsForDpi(SM_CXPADDEDBORDER, dpi);
}

// The Flutter view covers the whole client area, so it gets hit tests first.
// Along the top edge it passes them through to the top-level window, which
// answers HTTOP and friends so the edge resizes like a normal title bar.
LRESULT CALLBACK ViewProc(HWND hwnd, UINT message, WPARAM wparam,
                          LPARAM lparam, UINT_PTR, DWORD_PTR) {
  if (message == WM_NCHITTEST) {
    HWND top = GetAncestor(hwnd, GA_ROOT);
    if (!IsZoomed(top)) {
      POINT pt{GET_X_LPARAM(lparam), GET_Y_LPARAM(lparam)};
      ScreenToClient(top, &pt);
      if (pt.y < FrameThickness(top)) return HTTRANSPARENT;
    }
  }
  return DefSubclassProc(hwnd, message, wparam, lparam);
}

}  // namespace

FlutterWindow::FlutterWindow(const flutter::DartProject& project)
    : project_(project) {}

FlutterWindow::~FlutterWindow() {}

bool FlutterWindow::OnCreate() {
  if (!Win32Window::OnCreate()) {
    return false;
  }

  RECT frame = GetClientArea();

  // The size here must match the window dimensions to avoid unnecessary surface
  // creation / destruction in the startup path.
  flutter_controller_ = std::make_unique<flutter::FlutterViewController>(
      frame.right - frame.left, frame.bottom - frame.top, project_);
  // Ensure that basic setup of the controller was successful.
  if (!flutter_controller_->engine() || !flutter_controller_->view()) {
    return false;
  }
  RegisterPlugins(flutter_controller_->engine());
  HWND view = flutter_controller_->view()->GetNativeWindow();
  SetChildContent(view);
  SetWindowSubclass(view, ViewProc, 1, 0);
  media_session_ = std::make_unique<WindowsMediaSession>(
      GetHandle(), flutter_controller_->engine()->messenger());

  window_channel_ =
      std::make_unique<flutter::MethodChannel<flutter::EncodableValue>>(
          flutter_controller_->engine()->messenger(), "yesplaymusic/window",
          &flutter::StandardMethodCodec::GetInstance());
  window_channel_->SetMethodCallHandler(
      [this](const flutter::MethodCall<flutter::EncodableValue>& call,
             std::unique_ptr<flutter::MethodResult<flutter::EncodableValue>>
                 result) {
        HWND hwnd = GetHandle();
        const std::string& method = call.method_name();
        if (method == "startDrag") {
          // Hands the drag to Windows, which also does Aero Snap.
          ReleaseCapture();
          SendMessage(hwnd, WM_SYSCOMMAND, SC_MOVE | HTCAPTION, 0);
        } else if (method == "zoom") {
          ShowWindow(hwnd, IsZoomed(hwnd) ? SW_RESTORE : SW_MAXIMIZE);
        } else if (method == "minimize") {
          ShowWindow(hwnd, SW_MINIMIZE);
        } else if (method == "close") {
          // Same path as Alt+F4, so minimize-to-tray etc. still apply.
          PostMessage(hwnd, WM_CLOSE, 0, 0);
        } else if (method == "prefs") {
          if (const auto* args =
                  std::get_if<flutter::EncodableMap>(call.arguments())) {
            if (const auto* v = Lookup(*args, "show")) {
              if (const auto* str = std::get_if<std::string>(v)) {
                tray_show_label_ = Utf16FromUtf8(*str);
              }
            }
            if (const auto* v = Lookup(*args, "quit")) {
              if (const auto* str = std::get_if<std::string>(v)) {
                tray_quit_label_ = Utf16FromUtf8(*str);
              }
            }
            const auto* keep = Lookup(*args, "keepRunning");
            const auto* on = keep ? std::get_if<bool>(keep) : nullptr;
            SetKeepRunning(on && *on);
          }
        } else if (method == "state") {
          result->Success(flutter::EncodableValue(flutter::EncodableMap{
              {flutter::EncodableValue("maximized"),
               flutter::EncodableValue(maximized_)},
              {flutter::EncodableValue("active"),
               flutter::EncodableValue(active_)},
          }));
          return;
        } else {
          result->NotImplemented();
          return;
        }
        result->Success();
      });

  // Recalculate the frame now that WM_NCCALCSIZE drops the title bar.
  SetWindowPos(GetHandle(), nullptr, 0, 0, 0, 0,
               SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED);

  flutter_controller_->engine()->SetNextFrameCallback([&]() {
    this->Show();
  });

  // Flutter can complete the first frame before the "show window" callback is
  // registered. The following call ensures a frame is pending to ensure the
  // window is shown. It is a no-op if the first frame hasn't completed yet.
  flutter_controller_->ForceRedraw();

  return true;
}

void FlutterWindow::SendWindowState(bool active) {
  HWND hwnd = GetHandle();
  if (!window_channel_ || !hwnd) return;
  const bool maximized = IsZoomed(hwnd) != 0;
  if (maximized == maximized_ && active == active_) return;
  maximized_ = maximized;
  active_ = active;
  window_channel_->InvokeMethod(
      "state", std::make_unique<flutter::EncodableValue>(flutter::EncodableMap{
                   {flutter::EncodableValue("maximized"),
                    flutter::EncodableValue(maximized_)},
                   {flutter::EncodableValue("active"),
                    flutter::EncodableValue(active_)},
               }));
}

void FlutterWindow::SetKeepRunning(bool keep_running) {
  const bool was = keep_running_;
  keep_running_ = keep_running;
  if (keep_running_) {
    AddTrayIcon();
  } else if (was) {
    RemoveTrayIcon();
    // The tray icon was the only way back to a hidden window.
    HWND hwnd = GetHandle();
    if (hwnd && !IsWindowVisible(hwnd)) RestoreWindow();
  }
}

void FlutterWindow::AddTrayIcon() {
  HWND hwnd = GetHandle();
  if (tray_added_ || !hwnd) return;
  NOTIFYICONDATA nid = {sizeof(nid)};
  nid.hWnd = hwnd;
  nid.uID = kTrayId;
  nid.uFlags = NIF_ICON | NIF_MESSAGE | NIF_TIP | NIF_SHOWTIP;
  nid.uCallbackMessage = kTrayMessage;
  nid.hIcon = static_cast<HICON>(
      LoadImage(GetModuleHandle(nullptr), MAKEINTRESOURCE(IDI_APP_ICON),
                IMAGE_ICON, GetSystemMetrics(SM_CXSMICON),
                GetSystemMetrics(SM_CYSMICON), LR_SHARED));
  wcscpy_s(nid.szTip, L"YesPlayMusic");
  if (!Shell_NotifyIcon(NIM_ADD, &nid)) return;
  nid.uVersion = NOTIFYICON_VERSION_4;
  Shell_NotifyIcon(NIM_SETVERSION, &nid);
  tray_added_ = true;
}

void FlutterWindow::RemoveTrayIcon() {
  HWND hwnd = GetHandle();
  if (!tray_added_ || !hwnd) return;
  NOTIFYICONDATA nid = {sizeof(nid)};
  nid.hWnd = hwnd;
  nid.uID = kTrayId;
  Shell_NotifyIcon(NIM_DELETE, &nid);
  tray_added_ = false;
}

void FlutterWindow::RestoreWindow() {
  HWND hwnd = GetHandle();
  if (!hwnd) return;
  if (!IsWindowVisible(hwnd)) ShowWindow(hwnd, SW_SHOW);
  if (IsIconic(hwnd)) ShowWindow(hwnd, SW_RESTORE);
  SetForegroundWindow(hwnd);
}

void FlutterWindow::ShowTrayMenu(POINT at) {
  HWND hwnd = GetHandle();
  HMENU menu = CreatePopupMenu();
  if (!menu) return;
  enum : UINT { kShow = 1, kQuit = 2 };
  AppendMenu(menu, MF_STRING, kShow, tray_show_label_.c_str());
  AppendMenu(menu, MF_SEPARATOR, 0, nullptr);
  AppendMenu(menu, MF_STRING, kQuit, tray_quit_label_.c_str());
  SetMenuDefaultItem(menu, kShow, FALSE);
  // Without this the menu doesn't close when clicking elsewhere.
  SetForegroundWindow(hwnd);
  const UINT cmd = TrackPopupMenu(
      menu, TPM_RETURNCMD | TPM_RIGHTBUTTON | TPM_NONOTIFY, at.x, at.y, 0,
      hwnd, nullptr);
  DestroyMenu(menu);
  PostMessage(hwnd, WM_NULL, 0, 0);
  if (cmd == kShow) {
    RestoreWindow();
  } else if (cmd == kQuit) {
    DestroyWindow(hwnd);
  }
}

void FlutterWindow::OnDestroy() {
  media_session_.reset();
  window_channel_ = nullptr;
  if (flutter_controller_) {
    flutter_controller_ = nullptr;
  }

  Win32Window::OnDestroy();
}

LRESULT
FlutterWindow::MessageHandler(HWND hwnd, UINT const message,
                              WPARAM const wparam,
                              LPARAM const lparam) noexcept {
  if (message == WindowsMediaSession::kCommandMessage) {
    if (media_session_) media_session_->DispatchCommand(wparam, lparam);
    return 0;
  }

  // Flutter may request an application exit when its last window receives
  // WM_CLOSE. Intercept it first when the tray owns the window lifetime.
  if (message == WM_CLOSE && keep_running_ && tray_added_) {
    ShowWindow(hwnd, SW_HIDE);
    return 0;
  }

  // Give Flutter, including plugins, an opportunity to handle window messages.
  if (flutter_controller_) {
    std::optional<LRESULT> result =
        flutter_controller_->HandleTopLevelWindowProc(hwnd, message, wparam,
                                                      lparam);
    if (result) {
      return *result;
    }
  }

  if (message == kTaskbarCreated && tray_added_) {
    tray_added_ = false;
    AddTrayIcon();
    return 0;
  }

  switch (message) {
    case kTrayMessage:
      switch (LOWORD(lparam)) {
        case NIN_SELECT:
        case NIN_KEYSELECT:
          RestoreWindow();
          break;
        case WM_CONTEXTMENU:
          ShowTrayMenu({GET_X_LPARAM(wparam), GET_Y_LPARAM(wparam)});
          break;
      }
      return 0;
    case WM_DESTROY:
      RemoveTrayIcon();
      break;
    case WM_NCCALCSIZE: {
      // Drop the title bar but keep the frame on the other three sides, so the
      // window keeps its resize edges, shadow and rounded corners.
      if (!wparam) break;
      auto* params = reinterpret_cast<NCCALCSIZE_PARAMS*>(lparam);
      const LONG top = params->rgrc[0].top;
      DefWindowProc(hwnd, message, wparam, lparam);
      params->rgrc[0].top = top;
      // A maximized window hangs over the screen edge by its frame.
      if (IsZoomed(hwnd)) params->rgrc[0].top += FrameThickness(hwnd);
      return 0;
    }
    case WM_NCHITTEST: {
      LRESULT hit = DefWindowProc(hwnd, message, wparam, lparam);
      if (hit != HTCLIENT || IsZoomed(hwnd)) return hit;
      POINT pt{GET_X_LPARAM(lparam), GET_Y_LPARAM(lparam)};
      ScreenToClient(hwnd, &pt);
      const int frame = FrameThickness(hwnd);
      if (pt.y >= frame) return hit;
      RECT rc;
      GetClientRect(hwnd, &rc);
      if (pt.x < frame) return HTTOPLEFT;
      if (pt.x >= rc.right - frame) return HTTOPRIGHT;
      return HTTOP;
    }
    case WM_SIZE:
      SendWindowState(active_);
      break;
    case WM_ACTIVATE:
      SendWindowState(LOWORD(wparam) != WA_INACTIVE);
      break;
    case WM_FONTCHANGE:
      flutter_controller_->engine()->ReloadSystemFonts();
      break;
    case WM_GETMINMAXINFO: {
      // 界面至少要 1280 × 800（逻辑像素），按窗口所在屏幕的缩放换算
      const UINT dpi = FlutterDesktopGetDpiForMonitor(
          MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST));
      auto* info = reinterpret_cast<MINMAXINFO*>(lparam);
      info->ptMinTrackSize.x = MulDiv(1280, dpi, 96);
      info->ptMinTrackSize.y = MulDiv(800, dpi, 96);
      return 0;
    }
  }

  return Win32Window::MessageHandler(hwnd, message, wparam, lparam);
}
