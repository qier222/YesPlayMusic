// YPM 插件运行时的 C 层：在 QuickJS 之上包一层只用 C 字符串和整数的接口，
// 让 Dart FFI 不必处理 JSValue（按值传递的结构体）。
//
// 能力全在 Dart：JS 里只有一个原生函数 __host(op, json)，同步回调 Dart，
// Dart 用 qjs_reply 写回结果。fetch、定时器、存储都建在它上面（见 Dart 侧的 prelude）。
// 模块加载同样回调 Dart（op = "module"），由 Dart 决定能读哪些文件。
//
// 一个 qjs_t 只能在一个线程上同时使用；每次进入 JS 前更新栈顶，
// 因为 Dart isolate 可能在不同的 OS 线程上运行。

#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include "quickjs/quickjs.h"

#if defined(_WIN32)
#define QJS_API __declspec(dllexport)
#else
#define QJS_API __attribute__((visibility("default")))
#endif

// Dart 提供的回调。op/json 只在回调期间有效。
typedef void (*qjs_host_fn)(int64_t id, const char *op, const char *json,
                            size_t json_len);

typedef struct qjs {
  JSRuntime *rt;
  JSContext *ctx;
  qjs_host_fn host;
  int64_t id;
  int64_t deadline_ms; // 单调时钟毫秒；0 表示不限
  // 回调里 Dart 写回的结果
  char *reply;
  size_t reply_len;
  int reply_error;
  // 最近一次失败的说明，qjs_error 取
  char *error;
} qjs_t;

static int64_t now_ms(void) {
#if defined(_WIN32)
  return (int64_t)clock() * 1000 / CLOCKS_PER_SEC;
#else
  struct timespec ts;
  clock_gettime(CLOCK_MONOTONIC, &ts);
  return (int64_t)ts.tv_sec * 1000 + ts.tv_nsec / 1000000;
#endif
}

static int interrupt(JSContext *ctx, void *opaque) {
  qjs_t *q = opaque;
  return q->deadline_ms > 0 && now_ms() > q->deadline_ms;
}

static void set_error(qjs_t *q, const char *msg, size_t len) {
  free(q->error);
  q->error = malloc(len + 1);
  if (!q->error)
    return;
  memcpy(q->error, msg, len);
  q->error[len] = 0;
}

// 取出并清掉当前异常，转成 "名字: 消息\n栈" 存进 q->error。
static void take_exception(qjs_t *q) {
  JSContext *ctx = q->ctx;
  JSValue e = JS_GetException(ctx);
  size_t len;
  const char *s = JS_ToCStringLen(ctx, &len, e);
  char *buf = NULL;
  size_t n = 0;
  if (s) {
    buf = malloc(len + 1);
    if (buf) {
      memcpy(buf, s, len);
      n = len;
    }
    JS_FreeCString(ctx, s);
  }
  if (JS_IsError(e)) {
    JSValue st = JS_GetPropertyStr(ctx, e, "stack");
    size_t sl;
    const char *ss = JS_IsString(st) ? JS_ToCStringLen(ctx, &sl, st) : NULL;
    if (ss && buf) {
      char *b2 = realloc(buf, n + 1 + sl + 1);
      if (b2) {
        buf = b2;
        buf[n] = '\n';
        memcpy(buf + n + 1, ss, sl);
        n += 1 + sl;
      }
    }
    if (ss)
      JS_FreeCString(ctx, ss);
    JS_FreeValue(ctx, st);
  }
  JS_FreeValue(ctx, e);
  if (buf) {
    buf[n] = 0;
    free(q->error);
    q->error = buf;
  } else {
    set_error(q, "unknown error", 13);
  }
}

static void clear_reply(qjs_t *q) {
  free(q->reply);
  q->reply = NULL;
  q->reply_len = 0;
  q->reply_error = 0;
}

// 调 Dart；返回 0 成功（结果在 q->reply），1 失败（说明在 q->reply）。
static int call_host(qjs_t *q, const char *op, const char *json, size_t len) {
  clear_reply(q);
  q->host(q->id, op, json, len);
  return q->reply_error;
}

// JS: __host(op: string, json: string) -> string | undefined
static JSValue js_host(JSContext *ctx, JSValueConst this_val, int argc,
                       JSValueConst *argv) {
  qjs_t *q = JS_GetContextOpaque(ctx);
  if (argc < 2)
    return JS_ThrowTypeError(ctx, "__host(op, json)");
  const char *op = JS_ToCString(ctx, argv[0]);
  if (!op)
    return JS_EXCEPTION;
  size_t len;
  const char *json = JS_ToCStringLen(ctx, &len, argv[1]);
  if (!json) {
    JS_FreeCString(ctx, op);
    return JS_EXCEPTION;
  }
  int bad = call_host(q, op, json, len);
  JS_FreeCString(ctx, op);
  JS_FreeCString(ctx, json);
  // Dart 回调时可能换过线程栈，回到 JS 前再更新一次。
  JS_UpdateStackTop(q->rt);
  if (bad) {
    JSValue r = JS_ThrowPlainError(ctx, "%.*s", (int)q->reply_len,
                                   q->reply ? q->reply : "");
    clear_reply(q);
    return r;
  }
  if (!q->reply)
    return JS_UNDEFINED;
  JSValue r = JS_NewStringLen(ctx, q->reply, q->reply_len);
  clear_reply(q);
  return r;
}

static JSModuleDef *load_module(JSContext *ctx, const char *name, void *opaque,
                                JSValueConst attributes) {
  qjs_t *q = opaque;
  if (call_host(q, "module", name, strlen(name)) || !q->reply) {
    JS_ThrowReferenceError(ctx, "could not load module '%s': %.*s", name,
                           (int)q->reply_len, q->reply ? q->reply : "");
    clear_reply(q);
    return NULL;
  }
  JSValue fn = JS_Eval(ctx, q->reply, q->reply_len, name,
                       JS_EVAL_TYPE_MODULE | JS_EVAL_FLAG_COMPILE_ONLY);
  clear_reply(q);
  if (JS_IsException(fn))
    return NULL;
  JSModuleDef *m = JS_VALUE_GET_PTR(fn);
  JS_FreeValue(ctx, fn);
  return m;
}

QJS_API qjs_t *qjs_new(int64_t id, size_t memory_limit, size_t stack_size,
                       qjs_host_fn host) {
  qjs_t *q = calloc(1, sizeof(qjs_t));
  if (!q)
    return NULL;
  q->id = id;
  q->host = host;
  q->rt = JS_NewRuntime();
  if (!q->rt) {
    free(q);
    return NULL;
  }
  if (memory_limit)
    JS_SetMemoryLimit(q->rt, memory_limit);
  if (stack_size)
    JS_SetMaxStackSize(q->rt, stack_size);
  JS_SetInterruptHandler(q->rt, interrupt, q);
  JS_SetModuleLoaderFunc2(q->rt, NULL, load_module, NULL, q);
  q->ctx = JS_NewContext(q->rt);
  if (!q->ctx) {
    JS_FreeRuntime(q->rt);
    free(q);
    return NULL;
  }
  JS_SetContextOpaque(q->ctx, q);
  JSValue g = JS_GetGlobalObject(q->ctx);
  JS_SetPropertyStr(q->ctx, g, "__host",
                    JS_NewCFunction(q->ctx, js_host, "__host", 2));
  JS_FreeValue(q->ctx, g);
  return q;
}

QJS_API void qjs_free(qjs_t *q) {
  if (!q)
    return;
  JS_FreeContext(q->ctx);
  JS_FreeRuntime(q->rt);
  clear_reply(q);
  free(q->error);
  free(q);
}

/// 从现在起最多再跑 [ms] 毫秒，超过就中断（不可捕获）。0 为不限。
QJS_API void qjs_set_budget(qjs_t *q, int64_t ms) {
  q->deadline_ms = ms > 0 ? now_ms() + ms : 0;
}

/// Dart 在回调里写回结果。[error] 非 0 时 JS 里抛出 [s] 作为消息。
QJS_API void qjs_reply(qjs_t *q, const char *s, size_t len, int error) {
  clear_reply(q);
  q->reply_error = error;
  if (!s)
    return;
  q->reply = malloc(len + 1);
  if (!q->reply)
    return;
  memcpy(q->reply, s, len);
  q->reply[len] = 0;
  q->reply_len = len;
}

/// 作为全局脚本执行，结果丢弃。0 成功，1 抛异常（说明用 qjs_error 取）。
QJS_API int qjs_eval(qjs_t *q, const char *src, size_t len, const char *name) {
  JS_UpdateStackTop(q->rt);
  JSValue v = JS_Eval(q->ctx, src, len, name, JS_EVAL_TYPE_GLOBAL);
  if (JS_IsException(v)) {
    take_exception(q);
    return 1;
  }
  JS_FreeValue(q->ctx, v);
  return 0;
}

/// 跑完所有待执行的 Promise 任务。0 成功，1 某个任务以不可捕获的错误结束
/// （超时、内存不足）。
QJS_API int qjs_pump(qjs_t *q) {
  JS_UpdateStackTop(q->rt);
  for (;;) {
    JSContext *c;
    int r = JS_ExecutePendingJob(q->rt, &c);
    if (r == 0)
      return 0;
    if (r < 0) {
      take_exception(q);
      return 1;
    }
  }
}

QJS_API const char *qjs_error(qjs_t *q) { return q->error ? q->error : ""; }

/// 运行时当前占用的内存（字节）。
QJS_API int64_t qjs_memory(qjs_t *q) {
  JSMemoryUsage u;
  JS_ComputeMemoryUsage(q->rt, &u);
  return u.malloc_size;
}
