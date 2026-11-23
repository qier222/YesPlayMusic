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
  // Open the log first so errors during later initialization are recorded too
  AppLog.init(p.join(AppState.supportDir(), 'logs'));
  AppLog.captureErrors();
  AppLog.write(
    'I',
    'YesPlayMusic $appVersion starting (${Platform.operatingSystem} '
        '${Platform.operatingSystemVersion}）',
  );
  // Network covers etc. also use the system proxy (HttpClient doesn't read macOS proxy settings itself).
  HttpOverrides.global = _AppHttpOverrides(systemProxy());
  AudioEngine.init();
  // The home page date line is formatted with DateFormat for the UI language, so load date data for all locales first
  await initializeDateFormatting();
  // Precompute the dominant color of every cover (48×48 thumbnails, tens of ms) so pages get colors synchronously without flicker
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

  // Some image hosts reject requests with "Dart" in the UA and return 403. Adding
  // User-Agent in the headers only appends to the default value, so replace the client's userAgent instead.
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
    // Refetch the library when the window comes back to the front (a song may have just been liked in the official client)
    _lifecycle = AppLifecycleListener(onResume: state.onAppResume);
    state.loadLibrary();
    state.loadPlugins();
    state.startMcpIfEnabled();
    Updater.instance.start();
    Analytics.instance.start(snapshot: state.analyticsSnapshot);
  }

  /// Theme colors are globals; const widgets don't rebuild on their own.
  /// We used to remount the whole tree with a key, which replayed the pages' entrance animations;
  /// now every element is marked for rebuild in place, keeping state and animations.
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
