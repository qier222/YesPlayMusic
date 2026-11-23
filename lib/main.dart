import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:path/path.dart' as p;

import 'analytics.dart';
import 'binding.dart';
import 'cover_color.dart';
import 'l10n/l10n.dart';
import 'log.dart';
import 'music/player.dart';
import 'media_session.dart';
import 'net/proxy.dart';
import 'shell.dart';
import 'shortcuts.dart';
import 'state.dart';
import 'updater.dart';
import 'version.dart';
import 'theme.dart';

Future<void> main() async {
  AppBinding.init();
  // 先开日志，后面初始化出的错也能记下
  AppLog.init(p.join(AppState.supportDir(), 'logs'));
  AppLog.captureErrors();
  AppLog.write(
    'I',
    'YesPlayMusic $appVersion 启动（${Platform.operatingSystem} '
        '${Platform.operatingSystemVersion}）',
  );
  // 网络封面等也走系统代理（HttpClient 自己不读 macOS 的代理设置）。
  HttpOverrides.global = _AppHttpOverrides(systemProxy());
  AudioEngine.init();
  // 首页日期行用 DateFormat 按界面语言格式化，要先载入各语言的日期数据
  await initializeDateFormatting();
  // 预先算好所有封面的主色（48×48 缩略图，几十毫秒），页面里就能同步取色、不闪
  final manifest = await AssetManifest.loadFromAssetBundle(rootBundle);
  await CoverColors.instance.preload(
    manifest
        .listAssets()
        .where((a) => a.startsWith('assets/covers/') && a.endsWith('.jpg'))
        .map((a) => a.substring('assets/covers/'.length, a.length - 4)),
  );
  runApp(const YesPlayMusic());
}

class _AppHttpOverrides extends HttpOverrides {
  _AppHttpOverrides(this.proxy);
  final HttpProxy? proxy;

  // 有的图床拒绝 UA 里带 "Dart" 的请求，返回 403。在请求头里
  // add User-Agent 只会追加在默认值后面，所以直接换掉客户端的 userAgent。
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    final c = super.createHttpClient(context)..userAgent = 'YesPlayMusic';
    if (proxy != null) c.findProxy = proxy!.findProxy;
    return c;
  }
}

class YesPlayMusic extends StatefulWidget {
  const YesPlayMusic({super.key});

  @override
  State<YesPlayMusic> createState() => _YesPlayMusicState();
}

class _YesPlayMusicState extends State<YesPlayMusic> {
  final state = AppState();
  late int _swatch = state.swatch;
  late String _lang = state.lang;
  late final _keys = ShortcutHandler(state);
  late final _media = MediaSession(state);
  late final AppLifecycleListener _lifecycle;

  @override
  void initState() {
    super.initState();
    state.addListener(_onState);
    _keys.attach();
    _media.attach();
    // 窗口回到前台时重取音乐库（可能在官方客户端里刚喜欢了歌）
    _lifecycle = AppLifecycleListener(onResume: state.onAppResume);
    state.loadLibrary();
    state.loadPlugins();
    state.startMcpIfEnabled();
    Updater.instance.start();
    Analytics.instance.start(snapshot: state.analyticsSnapshot);
  }

  /// 主题色是全局变量，const 组件不会自己重建。
  /// 以前用 key 让整棵树重新挂载，会让页面的入场动画重播；
  /// 现在原地把所有元素标记为需要重建，状态和动画都保留。
  void _onState() {
    final swatchChanged = state.swatch != _swatch;
    final langChanged = state.lang != _lang;
    if (!swatchChanged && !langChanged) return;
    _swatch = state.swatch;
    _lang = state.lang;
    if (swatchChanged) state.applyTheme();
    if (langChanged) setState(() {});
    void mark(Element e) {
      e.markNeedsBuild();
      e.visitChildren(mark);
    }

    (context as Element).visitChildren(mark);
  }

  @override
  void dispose() {
    state.removeListener(_onState);
    _keys.detach();
    _media.detach();
    _lifecycle.dispose();
    state.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WidgetsApp(
      title: 'YesPlayMusic',
      color: const Color(0xFF0B0B0D),
      debugShowCheckedModeBanner: false,
      locale: state.locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localeListResolutionCallback: resolveAppLocale,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ],
      builder: (context, _) {
        syncGlobalL10n(context);
        return ListenableBuilder(
          listenable: state,
          builder: (context, _) {
            state.applyTheme();
            return KeyedSubtree(
              child: AppScope(
                state: state,
                child: DefaultTextStyle(
                  style: ts(14),
                  child: AppMenuBar(
                    app: state,
                    child: Overlay(
                      initialEntries: [
                        OverlayEntry(builder: (_) => const Shell()),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
