#ifndef RUNNER_TASKBAR_CONTROLS_H_
#define RUNNER_TASKBAR_CONTROLS_H_

#include <windows.h>

#include <memory>
#include <string>

#include "media_session.h"

struct TaskbarLabels {
  std::wstring prev = L"Previous";
  std::wstring play = L"Play";
  std::wstring pause = L"Pause";
  std::wstring next = L"Next";
  std::wstring like = L"Like";
  std::wstring unlike = L"Unlike";

  bool operator==(const TaskbarLabels& other) const {
    return prev == other.prev && play == other.play && pause == other.pause &&
           next == other.next && like == other.like && unlike == other.unlike;
  }

  bool operator!=(const TaskbarLabels& other) const {
    return !(*this == other);
  }
};

// Manages the Windows taskbar thumbnail toolbar buttons (previous, play/pause,
// next, like) via ITaskbarList3.
class TaskbarControls {
 public:
  explicit TaskbarControls(HWND window);
  ~TaskbarControls();

  UINT TaskbarButtonCreatedMessage() const;

  void OnTaskbarButtonCreated();
  void OnThemeOrDpiChanged(UINT dpi = 0);
  void UpdateState(const MediaPlaybackState& state);
  void UpdateLabels(const TaskbarLabels& labels);
  const char* HandleCommand(WPARAM wparam) const;

 private:
  class Impl;
  std::unique_ptr<Impl> impl_;
};

#endif  // RUNNER_TASKBAR_CONTROLS_H_
