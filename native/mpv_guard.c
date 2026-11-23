// 热重启保护（只在 debug 用）：isolate 销毁时，把 media_kit 记下的所有 mpv
// 实例的唤醒回调清掉。
//
// 旧 isolate 一死，它的 FFI 回调跳板随即被回收；mpv 的核心线程如果这时还在
// 发事件（播放中每秒好几次进度变化），就会跳进野指针崩溃（SIGSEGV/SIGBUS，
// 栈在 mp_client_send_property_changes / send_event）。Dart 层在新 isolate
// 里补救已经晚了，中间有空窗。Dart VM 关 isolate 时先跑 NativeFinalizer，
// 后回收回调跳板，所以挂在 finalizer 上同步清掉就没有空窗。
//
// token 是 media_kit NativeReferenceHolder 的缓冲区：512 个 mpv_handle* 槽位。

#if defined(_WIN32)
__declspec(dllexport) void ypm_mpv_detach_all(void *token) { (void)token; }
#else
#include <dlfcn.h>
#include <stdint.h>

typedef void (*set_wakeup_fn)(void *ctx, void (*cb)(void *), void *d);

__attribute__((visibility("default"))) void ypm_mpv_detach_all(void *token) {
  if (token == 0) return;
  set_wakeup_fn set_wakeup =
      (set_wakeup_fn)dlsym(RTLD_DEFAULT, "mpv_set_wakeup_callback");
  if (set_wakeup == 0) return;
  intptr_t *slots = (intptr_t *)token;
  for (int i = 0; i < 512; i++) {
    if (slots[i] != 0) set_wakeup((void *)slots[i], 0, 0);
  }
}
#endif
