#include <flutter/dart_project.h>
#include <flutter/flutter_view_controller.h>
#include <shobjidl.h>
#include <windows.h>

#include <string>

#include "flutter_window.h"
#include "utils.h"

namespace {

constexpr wchar_t kAppUserModelId[] = L"0xTangerine.YesPlayMusic";
constexpr wchar_t kAppDisplayName[] = L"YesPlayMusic";

std::wstring ExecutableDir() {
  std::wstring path(MAX_PATH, L'\0');
  for (;;) {
    const DWORD len =
        ::GetModuleFileNameW(nullptr, path.data(), static_cast<DWORD>(path.size()));
    if (len == 0) return {};
    if (len < path.size()) {
      path.resize(len);
      break;
    }
    if (path.size() >= 32768) return {};
    path.resize(path.size() * 2);
  }
  const size_t slash = path.find_last_of(L"\\/");
  return slash == std::wstring::npos ? std::wstring{} : path.substr(0, slash);
}

void WriteRegString(HKEY key, const wchar_t* name, const std::wstring& value) {
  const DWORD bytes = static_cast<DWORD>((value.size() + 1) * sizeof(wchar_t));
  ::RegSetValueExW(key, name, 0, REG_SZ,
                   reinterpret_cast<const BYTE*>(value.c_str()), bytes);
}

// Gives unpackaged Win32 launches a stable AUMID so Windows 11 SMTC resolves
// the app name and icon instead of showing "Unknown app".
void RegisterAppIdentity() {
  ::SetCurrentProcessExplicitAppUserModelID(kAppUserModelId);
  const std::wstring subkey =
      std::wstring(L"Software\\Classes\\AppUserModelId\\") + kAppUserModelId;
  HKEY key = nullptr;
  if (::RegCreateKeyExW(HKEY_CURRENT_USER, subkey.c_str(), 0, nullptr,
                        REG_OPTION_NON_VOLATILE, KEY_SET_VALUE, nullptr, &key,
                        nullptr) != ERROR_SUCCESS) {
    return;
  }
  WriteRegString(key, L"DisplayName", kAppDisplayName);
  const std::wstring dir = ExecutableDir();
  if (!dir.empty()) {
    const std::wstring icon_png =
        dir + L"\\data\\flutter_assets\\assets\\app_icon.png";
    if (::GetFileAttributesW(icon_png.c_str()) != INVALID_FILE_ATTRIBUTES) {
      WriteRegString(key, L"IconUri", icon_png);
    }
  }
  ::RegCloseKey(key);
}

}  // namespace

int APIENTRY wWinMain(_In_ HINSTANCE instance, _In_opt_ HINSTANCE prev,
                      _In_ wchar_t *command_line, _In_ int show_command) {
  // Attach to console when present (e.g., 'flutter run') or create a
  // new console when running with a debugger.
  if (!::AttachConsole(ATTACH_PARENT_PROCESS) && ::IsDebuggerPresent()) {
    CreateAndAttachConsole();
  }

  RegisterAppIdentity();

  // Initialize COM, so that it is available for use in the library and/or
  // plugins.
  ::CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);

  flutter::DartProject project(L"data");

  std::vector<std::string> command_line_arguments =
      GetCommandLineArguments();

  project.set_dart_entrypoint_arguments(std::move(command_line_arguments));

  FlutterWindow window(project);
  Win32Window::Point origin(10, 10);
  // 界面按 1440 × 900 设计，最小尺寸见 FlutterWindow::MessageHandler
  Win32Window::Size size(1440, 900);
  if (!window.Create(L"YesPlayMusic", origin, size)) {
    return EXIT_FAILURE;
  }
  window.SetQuitOnClose(true);

  ::MSG msg;
  while (::GetMessage(&msg, nullptr, 0, 0)) {
    ::TranslateMessage(&msg);
    ::DispatchMessage(&msg);
  }

  ::CoUninitialize();
  return EXIT_SUCCESS;
}
