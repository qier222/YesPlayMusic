import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_de.dart';
import 'app_localizations_en.dart';
import 'app_localizations_es.dart';
import 'app_localizations_fr.dart';
import 'app_localizations_ja.dart';
import 'app_localizations_ko.dart';
import 'app_localizations_ru.dart';
import 'app_localizations_zh.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('de'),
    Locale('en'),
    Locale('es'),
    Locale('fr'),
    Locale('ja'),
    Locale('ko'),
    Locale('ru'),
    Locale('zh'),
    Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hant'),
  ];

  /// No description provided for @navHome.
  ///
  /// In zh, this message translates to:
  /// **'首页'**
  String get navHome;

  /// No description provided for @navDiscover.
  ///
  /// In zh, this message translates to:
  /// **'发现'**
  String get navDiscover;

  /// No description provided for @navLibrary.
  ///
  /// In zh, this message translates to:
  /// **'音乐库'**
  String get navLibrary;

  /// No description provided for @navSearch.
  ///
  /// In zh, this message translates to:
  /// **'搜索'**
  String get navSearch;

  /// No description provided for @navSearchPage.
  ///
  /// In zh, this message translates to:
  /// **'搜索页'**
  String get navSearchPage;

  /// No description provided for @navSettings.
  ///
  /// In zh, this message translates to:
  /// **'设置'**
  String get navSettings;

  /// No description provided for @navProfile.
  ///
  /// In zh, this message translates to:
  /// **'个人主页'**
  String get navProfile;

  /// No description provided for @actionPlay.
  ///
  /// In zh, this message translates to:
  /// **'播放'**
  String get actionPlay;

  /// No description provided for @actionPause.
  ///
  /// In zh, this message translates to:
  /// **'暂停'**
  String get actionPause;

  /// No description provided for @actionPlayAll.
  ///
  /// In zh, this message translates to:
  /// **'播放全部'**
  String get actionPlayAll;

  /// No description provided for @actionShuffle.
  ///
  /// In zh, this message translates to:
  /// **'随机播放'**
  String get actionShuffle;

  /// No description provided for @actionNext.
  ///
  /// In zh, this message translates to:
  /// **'下一首'**
  String get actionNext;

  /// No description provided for @actionPrev.
  ///
  /// In zh, this message translates to:
  /// **'上一首'**
  String get actionPrev;

  /// No description provided for @actionLike.
  ///
  /// In zh, this message translates to:
  /// **'喜欢'**
  String get actionLike;

  /// No description provided for @actionUnlike.
  ///
  /// In zh, this message translates to:
  /// **'取消喜欢'**
  String get actionUnlike;

  /// No description provided for @actionSaveAlbum.
  ///
  /// In zh, this message translates to:
  /// **'收藏专辑'**
  String get actionSaveAlbum;

  /// No description provided for @actionUnsave.
  ///
  /// In zh, this message translates to:
  /// **'取消收藏'**
  String get actionUnsave;

  /// No description provided for @actionFollow.
  ///
  /// In zh, this message translates to:
  /// **'关注'**
  String get actionFollow;

  /// No description provided for @actionFollowing.
  ///
  /// In zh, this message translates to:
  /// **'已关注'**
  String get actionFollowing;

  /// No description provided for @actionMore.
  ///
  /// In zh, this message translates to:
  /// **'更多'**
  String get actionMore;

  /// No description provided for @actionBack.
  ///
  /// In zh, this message translates to:
  /// **'返回'**
  String get actionBack;

  /// No description provided for @actionClose.
  ///
  /// In zh, this message translates to:
  /// **'关闭'**
  String get actionClose;

  /// No description provided for @actionCancel.
  ///
  /// In zh, this message translates to:
  /// **'取消'**
  String get actionCancel;

  /// No description provided for @actionConfirm.
  ///
  /// In zh, this message translates to:
  /// **'确定'**
  String get actionConfirm;

  /// No description provided for @actionClear.
  ///
  /// In zh, this message translates to:
  /// **'清除'**
  String get actionClear;

  /// No description provided for @actionClearShort.
  ///
  /// In zh, this message translates to:
  /// **'清空'**
  String get actionClearShort;

  /// No description provided for @actionRetry.
  ///
  /// In zh, this message translates to:
  /// **'重试'**
  String get actionRetry;

  /// No description provided for @actionOpen.
  ///
  /// In zh, this message translates to:
  /// **'打开'**
  String get actionOpen;

  /// No description provided for @actionSave.
  ///
  /// In zh, this message translates to:
  /// **'保存'**
  String get actionSave;

  /// No description provided for @actionSaving.
  ///
  /// In zh, this message translates to:
  /// **'保存中…'**
  String get actionSaving;

  /// No description provided for @actionDone.
  ///
  /// In zh, this message translates to:
  /// **'完成'**
  String get actionDone;

  /// No description provided for @actionApply.
  ///
  /// In zh, this message translates to:
  /// **'应用'**
  String get actionApply;

  /// No description provided for @actionCopy.
  ///
  /// In zh, this message translates to:
  /// **'复制'**
  String get actionCopy;

  /// No description provided for @actionReset.
  ///
  /// In zh, this message translates to:
  /// **'重置'**
  String get actionReset;

  /// No description provided for @actionAdd.
  ///
  /// In zh, this message translates to:
  /// **'添加'**
  String get actionAdd;

  /// No description provided for @actionSelect.
  ///
  /// In zh, this message translates to:
  /// **'选择'**
  String get actionSelect;

  /// No description provided for @actionAll.
  ///
  /// In zh, this message translates to:
  /// **'全部'**
  String get actionAll;

  /// No description provided for @actionCollapse.
  ///
  /// In zh, this message translates to:
  /// **'收起'**
  String get actionCollapse;

  /// No description provided for @actionExpandAllCategories.
  ///
  /// In zh, this message translates to:
  /// **'全部分类'**
  String get actionExpandAllCategories;

  /// No description provided for @actionPrevPage.
  ///
  /// In zh, this message translates to:
  /// **'上一页'**
  String get actionPrevPage;

  /// No description provided for @actionNextPage.
  ///
  /// In zh, this message translates to:
  /// **'下一页'**
  String get actionNextPage;

  /// No description provided for @actionViewFullText.
  ///
  /// In zh, this message translates to:
  /// **'查看全文'**
  String get actionViewFullText;

  /// No description provided for @actionShow.
  ///
  /// In zh, this message translates to:
  /// **'显示'**
  String get actionShow;

  /// No description provided for @actionHide.
  ///
  /// In zh, this message translates to:
  /// **'隐藏'**
  String get actionHide;

  /// No description provided for @actionReload.
  ///
  /// In zh, this message translates to:
  /// **'重新加载'**
  String get actionReload;

  /// No description provided for @actionInstall.
  ///
  /// In zh, this message translates to:
  /// **'安装'**
  String get actionInstall;

  /// No description provided for @actionUpdate.
  ///
  /// In zh, this message translates to:
  /// **'更新'**
  String get actionUpdate;

  /// No description provided for @actionUninstall.
  ///
  /// In zh, this message translates to:
  /// **'卸载'**
  String get actionUninstall;

  /// No description provided for @actionEnable.
  ///
  /// In zh, this message translates to:
  /// **'启用'**
  String get actionEnable;

  /// No description provided for @actionSignIn.
  ///
  /// In zh, this message translates to:
  /// **'登录'**
  String get actionSignIn;

  /// No description provided for @actionSignOut.
  ///
  /// In zh, this message translates to:
  /// **'退出登录'**
  String get actionSignOut;

  /// No description provided for @actionManageSources.
  ///
  /// In zh, this message translates to:
  /// **'管理音乐源'**
  String get actionManageSources;

  /// No description provided for @actionManagePlugins.
  ///
  /// In zh, this message translates to:
  /// **'管理插件'**
  String get actionManagePlugins;

  /// No description provided for @actionGoSearch.
  ///
  /// In zh, this message translates to:
  /// **'去搜索'**
  String get actionGoSearch;

  /// No description provided for @actionLoadMore.
  ///
  /// In zh, this message translates to:
  /// **'加载更多'**
  String get actionLoadMore;

  /// No description provided for @stateLoading.
  ///
  /// In zh, this message translates to:
  /// **'正在加载…'**
  String get stateLoading;

  /// No description provided for @stateLoadingShort.
  ///
  /// In zh, this message translates to:
  /// **'加载中…'**
  String get stateLoadingShort;

  /// No description provided for @stateLoadFailed.
  ///
  /// In zh, this message translates to:
  /// **'加载失败'**
  String get stateLoadFailed;

  /// No description provided for @stateCouldNotLoad.
  ///
  /// In zh, this message translates to:
  /// **'没能加载'**
  String get stateCouldNotLoad;

  /// No description provided for @stateSigningIn.
  ///
  /// In zh, this message translates to:
  /// **'正在登录…'**
  String get stateSigningIn;

  /// No description provided for @stateSigningInShort.
  ///
  /// In zh, this message translates to:
  /// **'登录中…'**
  String get stateSigningInShort;

  /// No description provided for @stateSignedIn.
  ///
  /// In zh, this message translates to:
  /// **'已登录'**
  String get stateSignedIn;

  /// No description provided for @stateNotSignedIn.
  ///
  /// In zh, this message translates to:
  /// **'未登录'**
  String get stateNotSignedIn;

  /// No description provided for @stateNone.
  ///
  /// In zh, this message translates to:
  /// **'无'**
  String get stateNone;

  /// No description provided for @statePleaseSelect.
  ///
  /// In zh, this message translates to:
  /// **'请选择'**
  String get statePleaseSelect;

  /// No description provided for @stateCopied.
  ///
  /// In zh, this message translates to:
  /// **'已复制'**
  String get stateCopied;

  /// No description provided for @stateSaved.
  ///
  /// In zh, this message translates to:
  /// **'已保存'**
  String get stateSaved;

  /// No description provided for @stateSaveFailed.
  ///
  /// In zh, this message translates to:
  /// **'保存失败：{error}'**
  String stateSaveFailed(String error);

  /// No description provided for @miniShuffleOn.
  ///
  /// In zh, this message translates to:
  /// **'随机播放：开'**
  String get miniShuffleOn;

  /// No description provided for @miniRepeatOn.
  ///
  /// In zh, this message translates to:
  /// **'列表循环'**
  String get miniRepeatOn;

  /// No description provided for @miniRepeatOff.
  ///
  /// In zh, this message translates to:
  /// **'不循环'**
  String get miniRepeatOff;

  /// No description provided for @miniQueue.
  ///
  /// In zh, this message translates to:
  /// **'播放队列'**
  String get miniQueue;

  /// No description provided for @miniOpenNowPlaying.
  ///
  /// In zh, this message translates to:
  /// **'打开正在播放'**
  String get miniOpenNowPlaying;

  /// No description provided for @miniMute.
  ///
  /// In zh, this message translates to:
  /// **'静音'**
  String get miniMute;

  /// No description provided for @npTitle.
  ///
  /// In zh, this message translates to:
  /// **'正在播放'**
  String get npTitle;

  /// No description provided for @npComments.
  ///
  /// In zh, this message translates to:
  /// **'评论'**
  String get npComments;

  /// No description provided for @npSimilar.
  ///
  /// In zh, this message translates to:
  /// **'相似歌曲'**
  String get npSimilar;

  /// No description provided for @npSimilarTo.
  ///
  /// In zh, this message translates to:
  /// **'和 {title} 相似'**
  String npSimilarTo(String title);

  /// No description provided for @npNoSimilar.
  ///
  /// In zh, this message translates to:
  /// **'没有找到相似的歌曲'**
  String get npNoSimilar;

  /// No description provided for @npUpNext.
  ///
  /// In zh, this message translates to:
  /// **'接下来'**
  String get npUpNext;

  /// No description provided for @npQueueEmpty.
  ///
  /// In zh, this message translates to:
  /// **'队列里没有更多歌曲了'**
  String get npQueueEmpty;

  /// No description provided for @npFromPrefix.
  ///
  /// In zh, this message translates to:
  /// **'来自 '**
  String get npFromPrefix;

  /// No description provided for @npViewAlbum.
  ///
  /// In zh, this message translates to:
  /// **'查看专辑'**
  String get npViewAlbum;

  /// No description provided for @npViewArtist.
  ///
  /// In zh, this message translates to:
  /// **'查看艺人'**
  String get npViewArtist;

  /// No description provided for @menuPlayNext.
  ///
  /// In zh, this message translates to:
  /// **'下一首播放'**
  String get menuPlayNext;

  /// No description provided for @menuAddedNext.
  ///
  /// In zh, this message translates to:
  /// **'将在下一首播放'**
  String get menuAddedNext;

  /// No description provided for @menuAddToQueue.
  ///
  /// In zh, this message translates to:
  /// **'加入播放队列'**
  String get menuAddToQueue;

  /// No description provided for @menuAddedToQueue.
  ///
  /// In zh, this message translates to:
  /// **'已加入播放队列'**
  String get menuAddedToQueue;

  /// No description provided for @menuAddToPlaylist.
  ///
  /// In zh, this message translates to:
  /// **'添加到歌单'**
  String get menuAddToPlaylist;

  /// No description provided for @menuCreatePlaylist.
  ///
  /// In zh, this message translates to:
  /// **'新建歌单'**
  String get menuCreatePlaylist;

  /// No description provided for @menuPlaylistNamePlaceholder.
  ///
  /// In zh, this message translates to:
  /// **'歌单名字'**
  String get menuPlaylistNamePlaceholder;

  /// No description provided for @menuCreateAndAdd.
  ///
  /// In zh, this message translates to:
  /// **'新建并添加'**
  String get menuCreateAndAdd;

  /// No description provided for @menuPlaySimilar.
  ///
  /// In zh, this message translates to:
  /// **'播放相似歌曲'**
  String get menuPlaySimilar;

  /// No description provided for @menuDislike.
  ///
  /// In zh, this message translates to:
  /// **'不喜欢'**
  String get menuDislike;

  /// No description provided for @menuRemoveFromPlaylist.
  ///
  /// In zh, this message translates to:
  /// **'从歌单中删除'**
  String get menuRemoveFromPlaylist;

  /// No description provided for @shortcutGroupPlayback.
  ///
  /// In zh, this message translates to:
  /// **'播放'**
  String get shortcutGroupPlayback;

  /// No description provided for @shortcutGroupUi.
  ///
  /// In zh, this message translates to:
  /// **'界面'**
  String get shortcutGroupUi;

  /// No description provided for @shortcutGroupMediaKeys.
  ///
  /// In zh, this message translates to:
  /// **'媒体键'**
  String get shortcutGroupMediaKeys;

  /// No description provided for @shortcutPlayPause.
  ///
  /// In zh, this message translates to:
  /// **'播放 / 暂停'**
  String get shortcutPlayPause;

  /// No description provided for @shortcutSpaceKey.
  ///
  /// In zh, this message translates to:
  /// **'空格'**
  String get shortcutSpaceKey;

  /// No description provided for @shortcutSeekForward.
  ///
  /// In zh, this message translates to:
  /// **'快进 5 秒'**
  String get shortcutSeekForward;

  /// No description provided for @shortcutSeekBackward.
  ///
  /// In zh, this message translates to:
  /// **'快退 5 秒'**
  String get shortcutSeekBackward;

  /// No description provided for @shortcutVolumeUp.
  ///
  /// In zh, this message translates to:
  /// **'音量加'**
  String get shortcutVolumeUp;

  /// No description provided for @shortcutVolumeDown.
  ///
  /// In zh, this message translates to:
  /// **'音量减'**
  String get shortcutVolumeDown;

  /// No description provided for @shortcutMute.
  ///
  /// In zh, this message translates to:
  /// **'静音'**
  String get shortcutMute;

  /// No description provided for @shortcutRepeat.
  ///
  /// In zh, this message translates to:
  /// **'循环模式'**
  String get shortcutRepeat;

  /// No description provided for @shortcutLikeCurrent.
  ///
  /// In zh, this message translates to:
  /// **'喜欢当前歌曲'**
  String get shortcutLikeCurrent;

  /// No description provided for @shortcutDismissOverlay.
  ///
  /// In zh, this message translates to:
  /// **'收起正在播放，关闭弹窗'**
  String get shortcutDismissOverlay;

  /// No description provided for @shortcutBack.
  ///
  /// In zh, this message translates to:
  /// **'后退'**
  String get shortcutBack;

  /// No description provided for @shortcutForward.
  ///
  /// In zh, this message translates to:
  /// **'前进'**
  String get shortcutForward;

  /// No description provided for @shortcutSwitchTab.
  ///
  /// In zh, this message translates to:
  /// **'切换侧边栏页面'**
  String get shortcutSwitchTab;

  /// No description provided for @shortcutKeyRangeTo.
  ///
  /// In zh, this message translates to:
  /// **'到'**
  String get shortcutKeyRangeTo;

  /// No description provided for @shortcutMediaKeysLabel.
  ///
  /// In zh, this message translates to:
  /// **'键盘媒体键和耳机按键'**
  String get shortcutMediaKeysLabel;

  /// No description provided for @shortcutTypingHintMac.
  ///
  /// In zh, this message translates to:
  /// **'正在输入文字时，只有 ⌘F 和 Esc 生效'**
  String get shortcutTypingHintMac;

  /// No description provided for @shortcutTypingHintOther.
  ///
  /// In zh, this message translates to:
  /// **'正在输入文字时，只有 Ctrl+F 和 Esc 生效'**
  String get shortcutTypingHintOther;

  /// No description provided for @menuBarSettings.
  ///
  /// In zh, this message translates to:
  /// **'设置…'**
  String get menuBarSettings;

  /// No description provided for @menuBarView.
  ///
  /// In zh, this message translates to:
  /// **'显示'**
  String get menuBarView;

  /// No description provided for @menuBarWindow.
  ///
  /// In zh, this message translates to:
  /// **'窗口'**
  String get menuBarWindow;

  /// No description provided for @swatchLilac.
  ///
  /// In zh, this message translates to:
  /// **'丁香紫'**
  String get swatchLilac;

  /// No description provided for @swatchSky.
  ///
  /// In zh, this message translates to:
  /// **'天蓝'**
  String get swatchSky;

  /// No description provided for @swatchMint.
  ///
  /// In zh, this message translates to:
  /// **'薄荷'**
  String get swatchMint;

  /// No description provided for @swatchSun.
  ///
  /// In zh, this message translates to:
  /// **'日光'**
  String get swatchSun;

  /// No description provided for @swatchRose.
  ///
  /// In zh, this message translates to:
  /// **'玫瑰'**
  String get swatchRose;

  /// No description provided for @swatchFlame.
  ///
  /// In zh, this message translates to:
  /// **'橙焰'**
  String get swatchFlame;

  /// No description provided for @settingsGeneral.
  ///
  /// In zh, this message translates to:
  /// **'通用'**
  String get settingsGeneral;

  /// No description provided for @settingsShortcuts.
  ///
  /// In zh, this message translates to:
  /// **'快捷键'**
  String get settingsShortcuts;

  /// No description provided for @settingsPlugins.
  ///
  /// In zh, this message translates to:
  /// **'插件'**
  String get settingsPlugins;

  /// No description provided for @settingsAbout.
  ///
  /// In zh, this message translates to:
  /// **'关于'**
  String get settingsAbout;

  /// No description provided for @settingsAppearance.
  ///
  /// In zh, this message translates to:
  /// **'外观'**
  String get settingsAppearance;

  /// No description provided for @settingsLyrics.
  ///
  /// In zh, this message translates to:
  /// **'歌词'**
  String get settingsLyrics;

  /// No description provided for @settingsPlayback.
  ///
  /// In zh, this message translates to:
  /// **'播放'**
  String get settingsPlayback;

  /// No description provided for @settingsStorage.
  ///
  /// In zh, this message translates to:
  /// **'存储'**
  String get settingsStorage;

  /// No description provided for @settingsAccentColor.
  ///
  /// In zh, this message translates to:
  /// **'主题色'**
  String get settingsAccentColor;

  /// No description provided for @settingsLanguage.
  ///
  /// In zh, this message translates to:
  /// **'语言'**
  String get settingsLanguage;

  /// No description provided for @langSystem.
  ///
  /// In zh, this message translates to:
  /// **'跟随系统'**
  String get langSystem;

  /// Settings toggle: on, the mini player always shows the current lyric; off, only while hovering its progress bar
  ///
  /// In zh, this message translates to:
  /// **'迷你播放器始终显示歌词'**
  String get settingsMiniLyric;

  /// Settings toggle: closing the window hides it and the app keeps running (macOS: reopen from the Dock; Windows: from the tray icon; Linux: the window is minimized)
  ///
  /// In zh, this message translates to:
  /// **'关闭窗口后继续在后台运行'**
  String get settingsKeepRunning;

  /// Windows tray icon menu item that brings the hidden window back
  ///
  /// In zh, this message translates to:
  /// **'显示窗口'**
  String get trayShowWindow;

  /// Windows tray icon menu item that quits the app
  ///
  /// In zh, this message translates to:
  /// **'退出'**
  String get trayQuit;

  /// No description provided for @aboutDownloadVersion.
  ///
  /// In zh, this message translates to:
  /// **'下载 {version}'**
  String aboutDownloadVersion(String version);

  /// No description provided for @aboutChecking.
  ///
  /// In zh, this message translates to:
  /// **'正在检查…'**
  String get aboutChecking;

  /// No description provided for @aboutCheckUpdate.
  ///
  /// In zh, this message translates to:
  /// **'检查更新'**
  String get aboutCheckUpdate;

  /// No description provided for @aboutAutoCheck.
  ///
  /// In zh, this message translates to:
  /// **'自动检查更新'**
  String get aboutAutoCheck;

  /// No description provided for @aboutAnalytics.
  ///
  /// In zh, this message translates to:
  /// **'发送匿名使用统计'**
  String get aboutAnalytics;

  /// No description provided for @aboutSourceAndFeedback.
  ///
  /// In zh, this message translates to:
  /// **'源代码与问题反馈'**
  String get aboutSourceAndFeedback;

  /// No description provided for @aboutVersion.
  ///
  /// In zh, this message translates to:
  /// **'版本 {version}'**
  String aboutVersion(String version);

  /// No description provided for @aboutLogs.
  ///
  /// In zh, this message translates to:
  /// **'日志文件'**
  String get aboutLogs;

  /// No description provided for @aboutLogsHint.
  ///
  /// In zh, this message translates to:
  /// **'反馈问题时附上'**
  String get aboutLogsHint;

  /// No description provided for @aboutOpenFolder.
  ///
  /// In zh, this message translates to:
  /// **'打开文件夹'**
  String get aboutOpenFolder;

  /// No description provided for @aboutOpen.
  ///
  /// In zh, this message translates to:
  /// **'打开'**
  String get aboutOpen;

  /// No description provided for @updaterNewVersion.
  ///
  /// In zh, this message translates to:
  /// **'发现新版本 {version}'**
  String updaterNewVersion(String version);

  /// No description provided for @updaterUpToDate.
  ///
  /// In zh, this message translates to:
  /// **'已经是最新版本'**
  String get updaterUpToDate;

  /// No description provided for @updaterCheckFailed.
  ///
  /// In zh, this message translates to:
  /// **'检查更新失败'**
  String get updaterCheckFailed;

  /// No description provided for @storageClearTitle.
  ///
  /// In zh, this message translates to:
  /// **'清除 {size} 缓存？'**
  String storageClearTitle(String size);

  /// No description provided for @storageClearMessage.
  ///
  /// In zh, this message translates to:
  /// **'API、音频和图片的缓存都会清除，\n之后用到时再重新获取。'**
  String get storageClearMessage;

  /// No description provided for @storageCleared.
  ///
  /// In zh, this message translates to:
  /// **'已清除 {size} 缓存'**
  String storageCleared(String size);

  /// No description provided for @storageLimit.
  ///
  /// In zh, this message translates to:
  /// **'/ {size} 缓存上限'**
  String storageLimit(String size);

  /// No description provided for @storageApi.
  ///
  /// In zh, this message translates to:
  /// **'API {size}'**
  String storageApi(String size);

  /// No description provided for @storageAudio.
  ///
  /// In zh, this message translates to:
  /// **'音频 {size}'**
  String storageAudio(String size);

  /// No description provided for @storageImage.
  ///
  /// In zh, this message translates to:
  /// **'图片 {size}'**
  String storageImage(String size);

  /// No description provided for @storageClearing.
  ///
  /// In zh, this message translates to:
  /// **'正在清除…'**
  String get storageClearing;

  /// No description provided for @storageClearCache.
  ///
  /// In zh, this message translates to:
  /// **'清除缓存'**
  String get storageClearCache;

  /// No description provided for @sourceMusicSource.
  ///
  /// In zh, this message translates to:
  /// **'音乐来源'**
  String get sourceMusicSource;

  /// No description provided for @sourceLocal.
  ///
  /// In zh, this message translates to:
  /// **'本地音乐'**
  String get sourceLocal;

  /// No description provided for @sourceLocalDesc.
  ///
  /// In zh, this message translates to:
  /// **'播放电脑上的音乐文件'**
  String get sourceLocalDesc;

  /// No description provided for @sourceBuiltIn.
  ///
  /// In zh, this message translates to:
  /// **'内置'**
  String get sourceBuiltIn;

  /// No description provided for @sourceInUse.
  ///
  /// In zh, this message translates to:
  /// **'正在使用'**
  String get sourceInUse;

  /// No description provided for @sourceScanning.
  ///
  /// In zh, this message translates to:
  /// **'正在扫描…'**
  String get sourceScanning;

  /// No description provided for @sourceNoFolders.
  ///
  /// In zh, this message translates to:
  /// **'未添加文件夹'**
  String get sourceNoFolders;

  /// No description provided for @sourceFolderAlbums.
  ///
  /// In zh, this message translates to:
  /// **'{folders} 个文件夹，{albums} 张专辑'**
  String sourceFolderAlbums(int folders, int albums);

  /// No description provided for @sourceAddFolderEllipsis.
  ///
  /// In zh, this message translates to:
  /// **'添加音乐文件夹…'**
  String get sourceAddFolderEllipsis;

  /// No description provided for @sourceAddFolder.
  ///
  /// In zh, this message translates to:
  /// **'添加文件夹'**
  String get sourceAddFolder;

  /// No description provided for @sourceAddMusicFolder.
  ///
  /// In zh, this message translates to:
  /// **'添加音乐文件夹'**
  String get sourceAddMusicFolder;

  /// No description provided for @sourceRescan.
  ///
  /// In zh, this message translates to:
  /// **'重新扫描'**
  String get sourceRescan;

  /// No description provided for @sourceMusicFolders.
  ///
  /// In zh, this message translates to:
  /// **'音乐文件夹'**
  String get sourceMusicFolders;

  /// No description provided for @sourceNoFoldersAdded.
  ///
  /// In zh, this message translates to:
  /// **'还没有添加音乐文件夹'**
  String get sourceNoFoldersAdded;

  /// No description provided for @sourceOpenInFileManager.
  ///
  /// In zh, this message translates to:
  /// **'在文件管理器中打开'**
  String get sourceOpenInFileManager;

  /// No description provided for @sourceShowInFileManager.
  ///
  /// In zh, this message translates to:
  /// **'在文件管理器中显示'**
  String get sourceShowInFileManager;

  /// No description provided for @sourceStopScanningFolder.
  ///
  /// In zh, this message translates to:
  /// **'不再扫描这个文件夹'**
  String get sourceStopScanningFolder;

  /// No description provided for @sourceSwitchedTo.
  ///
  /// In zh, this message translates to:
  /// **'已切换到「{name}」'**
  String sourceSwitchedTo(String name);

  /// No description provided for @sourceFolderAlreadyScanned.
  ///
  /// In zh, this message translates to:
  /// **'这个文件夹已经在扫描范围里了'**
  String get sourceFolderAlreadyScanned;

  /// No description provided for @sourceNoMusicFound.
  ///
  /// In zh, this message translates to:
  /// **'没有找到音乐'**
  String get sourceNoMusicFound;

  /// Scan progress: number of audio files read so far
  ///
  /// In zh, this message translates to:
  /// **'正在扫描… 已读取 {count} 首'**
  String sourceScanningCount(int count);

  /// Toast after a scan: music folders that failed or stopped responding were skipped
  ///
  /// In zh, this message translates to:
  /// **'{count} 个文件夹无法读取，已跳过'**
  String sourceFoldersUnreadable(int count);

  /// Shown under a music folder the last scan skipped
  ///
  /// In zh, this message translates to:
  /// **'无法读取，已跳过'**
  String get sourceFolderUnreadable;

  /// Button that stops a running local music scan
  ///
  /// In zh, this message translates to:
  /// **'取消扫描'**
  String get sourceCancelScan;

  /// No description provided for @sourceNotFound.
  ///
  /// In zh, this message translates to:
  /// **'没有找到这个音乐源'**
  String get sourceNotFound;

  /// No description provided for @pluginsLoadedToast.
  ///
  /// In zh, this message translates to:
  /// **'已加载 {count} 个插件'**
  String pluginsLoadedToast(int count);

  /// No description provided for @pluginFind.
  ///
  /// In zh, this message translates to:
  /// **'查找插件'**
  String get pluginFind;

  /// No description provided for @pluginInstallTitle.
  ///
  /// In zh, this message translates to:
  /// **'安装插件'**
  String get pluginInstallTitle;

  /// No description provided for @pluginTabInstalled.
  ///
  /// In zh, this message translates to:
  /// **'已安装'**
  String get pluginTabInstalled;

  /// No description provided for @pluginTabOfficial.
  ///
  /// In zh, this message translates to:
  /// **'官方插件'**
  String get pluginTabOfficial;

  /// No description provided for @pluginOpenDir.
  ///
  /// In zh, this message translates to:
  /// **'打开插件目录'**
  String get pluginOpenDir;

  /// No description provided for @pluginThirdPartyHint.
  ///
  /// In zh, this message translates to:
  /// **'官方之外的插件由各自作者维护'**
  String get pluginThirdPartyHint;

  /// No description provided for @pluginDevDocs.
  ///
  /// In zh, this message translates to:
  /// **'插件开发文档 ›'**
  String get pluginDevDocs;

  /// No description provided for @pluginComingSoon.
  ///
  /// In zh, this message translates to:
  /// **'即将上线'**
  String get pluginComingSoon;

  /// No description provided for @pluginInstallFromLink.
  ///
  /// In zh, this message translates to:
  /// **'从链接安装'**
  String get pluginInstallFromLink;

  /// No description provided for @pluginInstallFromLinkHint.
  ///
  /// In zh, this message translates to:
  /// **'GitHub 仓库、Release 或 .zip'**
  String get pluginInstallFromLinkHint;

  /// No description provided for @pluginUninstallTitle.
  ///
  /// In zh, this message translates to:
  /// **'卸载「{name}」？'**
  String pluginUninstallTitle(String name);

  /// No description provided for @pluginUninstallMessage.
  ///
  /// In zh, this message translates to:
  /// **'插件的设置和登录状态会一起删除'**
  String get pluginUninstallMessage;

  /// No description provided for @pluginUninstalled.
  ///
  /// In zh, this message translates to:
  /// **'已卸载「{name}」'**
  String pluginUninstalled(String name);

  /// No description provided for @pluginUpdateAvailable.
  ///
  /// In zh, this message translates to:
  /// **'可更新到 {version}'**
  String pluginUpdateAvailable(String version);

  /// No description provided for @pluginNeedSetting.
  ///
  /// In zh, this message translates to:
  /// **'需要填写{field}'**
  String pluginNeedSetting(String field);

  /// No description provided for @pluginSignedInAs.
  ///
  /// In zh, this message translates to:
  /// **'已登录 {name}'**
  String pluginSignedInAs(String name);

  /// No description provided for @pluginDisabledToast.
  ///
  /// In zh, this message translates to:
  /// **'已停用「{name}」'**
  String pluginDisabledToast(String name);

  /// No description provided for @pluginEnabledToast.
  ///
  /// In zh, this message translates to:
  /// **'已启用「{name}」'**
  String pluginEnabledToast(String name);

  /// No description provided for @pluginHasUpdate.
  ///
  /// In zh, this message translates to:
  /// **'有更新'**
  String get pluginHasUpdate;

  /// No description provided for @pluginSignInAccount.
  ///
  /// In zh, this message translates to:
  /// **'登录账号'**
  String get pluginSignInAccount;

  /// No description provided for @pluginSettingsEllipsis.
  ///
  /// In zh, this message translates to:
  /// **'插件设置…'**
  String get pluginSettingsEllipsis;

  /// No description provided for @pluginDisable.
  ///
  /// In zh, this message translates to:
  /// **'停用插件'**
  String get pluginDisable;

  /// No description provided for @pluginReload.
  ///
  /// In zh, this message translates to:
  /// **'重新加载插件'**
  String get pluginReload;

  /// No description provided for @pluginUninstallEllipsis.
  ///
  /// In zh, this message translates to:
  /// **'卸载插件…'**
  String get pluginUninstallEllipsis;

  /// No description provided for @pluginDeleteEllipsis.
  ///
  /// In zh, this message translates to:
  /// **'删除插件…'**
  String get pluginDeleteEllipsis;

  /// No description provided for @pluginDisabledBadge.
  ///
  /// In zh, this message translates to:
  /// **'已停用'**
  String get pluginDisabledBadge;

  /// No description provided for @pluginNotLoadedBadge.
  ///
  /// In zh, this message translates to:
  /// **'未加载'**
  String get pluginNotLoadedBadge;

  /// No description provided for @pluginNotLoadedStatus.
  ///
  /// In zh, this message translates to:
  /// **'插件没有加载'**
  String get pluginNotLoadedStatus;

  /// No description provided for @pluginEmptyTitle.
  ///
  /// In zh, this message translates to:
  /// **'还没有安装插件'**
  String get pluginEmptyTitle;

  /// No description provided for @pluginEmptyHint.
  ///
  /// In zh, this message translates to:
  /// **'支持 GitHub 链接'**
  String get pluginEmptyHint;

  /// No description provided for @pluginSettingsTitle.
  ///
  /// In zh, this message translates to:
  /// **'插件设置'**
  String get pluginSettingsTitle;

  /// No description provided for @pluginSectionAccount.
  ///
  /// In zh, this message translates to:
  /// **'账号'**
  String get pluginSectionAccount;

  /// No description provided for @pluginSectionCapabilities.
  ///
  /// In zh, this message translates to:
  /// **'能力'**
  String get pluginSectionCapabilities;

  /// No description provided for @pluginSectionPermissions.
  ///
  /// In zh, this message translates to:
  /// **'权限'**
  String get pluginSectionPermissions;

  /// No description provided for @pluginDisabledHint.
  ///
  /// In zh, this message translates to:
  /// **'插件已停用，启用后生效'**
  String get pluginDisabledHint;

  /// No description provided for @pluginUninstallBtn.
  ///
  /// In zh, this message translates to:
  /// **'卸载插件'**
  String get pluginUninstallBtn;

  /// No description provided for @pluginSignInSyncHint.
  ///
  /// In zh, this message translates to:
  /// **'登录后同步收藏和歌单'**
  String get pluginSignInSyncHint;

  /// No description provided for @pluginGetIt.
  ///
  /// In zh, this message translates to:
  /// **'去获取 ›'**
  String get pluginGetIt;

  /// No description provided for @pluginUpdatedToast.
  ///
  /// In zh, this message translates to:
  /// **'已更新「{name}」'**
  String pluginUpdatedToast(String name);

  /// No description provided for @pluginInstalledToast.
  ///
  /// In zh, this message translates to:
  /// **'已安装「{name}」'**
  String pluginInstalledToast(String name);

  /// No description provided for @pluginInstallFailed.
  ///
  /// In zh, this message translates to:
  /// **'安装失败：{error}'**
  String pluginInstallFailed(String error);

  /// No description provided for @pluginInstallPrompt.
  ///
  /// In zh, this message translates to:
  /// **'粘贴 GitHub 仓库地址，\n或者插件的下载链接'**
  String get pluginInstallPrompt;

  /// No description provided for @pluginInstallPlaceholder.
  ///
  /// In zh, this message translates to:
  /// **'github.com/作者/仓库'**
  String get pluginInstallPlaceholder;

  /// No description provided for @pluginInstallSupportHint.
  ///
  /// In zh, this message translates to:
  /// **'支持 GitHub 仓库、Release，以及 plugin.json 和 .zip 链接'**
  String get pluginInstallSupportHint;

  /// No description provided for @pluginReading.
  ///
  /// In zh, this message translates to:
  /// **'读取中…'**
  String get pluginReading;

  /// No description provided for @pluginNextStep.
  ///
  /// In zh, this message translates to:
  /// **'下一步'**
  String get pluginNextStep;

  /// No description provided for @pluginInstallFromLocal.
  ///
  /// In zh, this message translates to:
  /// **'从本地文件夹安装…'**
  String get pluginInstallFromLocal;

  /// No description provided for @pluginPublishedAgo.
  ///
  /// In zh, this message translates to:
  /// **'，{ago}发布'**
  String pluginPublishedAgo(String ago);

  /// No description provided for @pluginLocalFolder.
  ///
  /// In zh, this message translates to:
  /// **'本地文件夹'**
  String get pluginLocalFolder;

  /// No description provided for @pluginLatestCode.
  ///
  /// In zh, this message translates to:
  /// **'最新代码'**
  String get pluginLatestCode;

  /// No description provided for @pluginInstalledVersion.
  ///
  /// In zh, this message translates to:
  /// **'已安装 {version}'**
  String pluginInstalledVersion(String version);

  /// No description provided for @pluginPermissionsNeeded.
  ///
  /// In zh, this message translates to:
  /// **'需要这些权限'**
  String get pluginPermissionsNeeded;

  /// No description provided for @pluginPermNoNetwork.
  ///
  /// In zh, this message translates to:
  /// **'不访问网络'**
  String get pluginPermNoNetwork;

  /// No description provided for @pluginPermNoNetworkDetail.
  ///
  /// In zh, this message translates to:
  /// **'不连接任何网站'**
  String get pluginPermNoNetworkDetail;

  /// No description provided for @pluginPermAnyWebsite.
  ///
  /// In zh, this message translates to:
  /// **'访问任意网站'**
  String get pluginPermAnyWebsite;

  /// No description provided for @pluginPermAnyWebsiteDetail.
  ///
  /// In zh, this message translates to:
  /// **'可连接任意网站'**
  String get pluginPermAnyWebsiteDetail;

  /// No description provided for @pluginPermAnyWebsiteFull.
  ///
  /// In zh, this message translates to:
  /// **'可以访问任意网站'**
  String get pluginPermAnyWebsiteFull;

  /// No description provided for @pluginPermNetwork.
  ///
  /// In zh, this message translates to:
  /// **'访问网络'**
  String get pluginPermNetwork;

  /// No description provided for @pluginPermSignInDetail.
  ///
  /// In zh, this message translates to:
  /// **'打开登录页，读取登录后的 Cookie'**
  String get pluginPermSignInDetail;

  /// No description provided for @pluginPermProcess.
  ///
  /// In zh, this message translates to:
  /// **'运行本机程序'**
  String get pluginPermProcess;

  /// No description provided for @pluginPermProcessBadge.
  ///
  /// In zh, this message translates to:
  /// **'需要单独允许'**
  String get pluginPermProcessBadge;

  /// No description provided for @pluginPermProcessDetail.
  ///
  /// In zh, this message translates to:
  /// **'{programs}，默认关闭，可在插件设置中开启'**
  String pluginPermProcessDetail(String programs);

  /// No description provided for @pluginPermStorage.
  ///
  /// In zh, this message translates to:
  /// **'保存数据'**
  String get pluginPermStorage;

  /// No description provided for @pluginPermStorageDetail.
  ///
  /// In zh, this message translates to:
  /// **'保存设置、登录状态和缓存'**
  String get pluginPermStorageDetail;

  /// No description provided for @pluginCapabilitiesProvided.
  ///
  /// In zh, this message translates to:
  /// **'提供这些能力'**
  String get pluginCapabilitiesProvided;

  /// No description provided for @pluginNavIconHint.
  ///
  /// In zh, this message translates to:
  /// **'带图标的会加到侧边栏'**
  String get pluginNavIconHint;

  /// No description provided for @pluginTrustHint.
  ///
  /// In zh, this message translates to:
  /// **'请只安装可信来源的插件'**
  String get pluginTrustHint;

  /// No description provided for @pluginInstalling.
  ///
  /// In zh, this message translates to:
  /// **'安装中…'**
  String get pluginInstalling;

  /// No description provided for @pluginYourServer.
  ///
  /// In zh, this message translates to:
  /// **'你填写的服务器'**
  String get pluginYourServer;

  /// No description provided for @pluginCanAccessHosts.
  ///
  /// In zh, this message translates to:
  /// **'可访问 {hosts}'**
  String pluginCanAccessHosts(String hosts);

  /// No description provided for @pluginCanAccessHostsMore.
  ///
  /// In zh, this message translates to:
  /// **'可访问 {hosts} 等 {count} 个'**
  String pluginCanAccessHostsMore(String hosts, int count);

  /// No description provided for @pluginOnlyYourServer.
  ///
  /// In zh, this message translates to:
  /// **'只访问你在设置里填写的服务器'**
  String get pluginOnlyYourServer;

  /// No description provided for @pluginAndYourServer.
  ///
  /// In zh, this message translates to:
  /// **'{hosts}，以及你在设置里填写的服务器'**
  String pluginAndYourServer(String hosts);

  /// No description provided for @pluginAnyProgram.
  ///
  /// In zh, this message translates to:
  /// **'任意本机程序'**
  String get pluginAnyProgram;

  /// No description provided for @officialJellyfinDesc.
  ///
  /// In zh, this message translates to:
  /// **'连接 Jellyfin 服务器'**
  String get officialJellyfinDesc;

  /// No description provided for @officialPlexDesc.
  ///
  /// In zh, this message translates to:
  /// **'连接 Plex Media Server'**
  String get officialPlexDesc;

  /// No description provided for @officialSubsonicDesc.
  ///
  /// In zh, this message translates to:
  /// **'连接 Navidrome 等 Subsonic 服务器'**
  String get officialSubsonicDesc;

  /// No description provided for @officialEmbyDesc.
  ///
  /// In zh, this message translates to:
  /// **'连接 Emby 服务器'**
  String get officialEmbyDesc;

  /// No description provided for @capSuggest.
  ///
  /// In zh, this message translates to:
  /// **'搜索建议'**
  String get capSuggest;

  /// No description provided for @capLyrics.
  ///
  /// In zh, this message translates to:
  /// **'歌词'**
  String get capLyrics;

  /// No description provided for @capPlaylist.
  ///
  /// In zh, this message translates to:
  /// **'歌单'**
  String get capPlaylist;

  /// No description provided for @capEditPlaylist.
  ///
  /// In zh, this message translates to:
  /// **'编辑歌单'**
  String get capEditPlaylist;

  /// No description provided for @capFavorites.
  ///
  /// In zh, this message translates to:
  /// **'收藏'**
  String get capFavorites;

  /// No description provided for @capAlbum.
  ///
  /// In zh, this message translates to:
  /// **'专辑'**
  String get capAlbum;

  /// No description provided for @capArtist.
  ///
  /// In zh, this message translates to:
  /// **'艺人'**
  String get capArtist;

  /// No description provided for @capRadio.
  ///
  /// In zh, this message translates to:
  /// **'电台'**
  String get capRadio;

  /// No description provided for @capSimilar.
  ///
  /// In zh, this message translates to:
  /// **'相似推荐'**
  String get capSimilar;

  /// No description provided for @capHistory.
  ///
  /// In zh, this message translates to:
  /// **'播放记录'**
  String get capHistory;

  /// No description provided for @capDislike.
  ///
  /// In zh, this message translates to:
  /// **'不感兴趣'**
  String get capDislike;

  /// No description provided for @capTrackMenu.
  ///
  /// In zh, this message translates to:
  /// **'歌曲菜单'**
  String get capTrackMenu;

  /// No description provided for @mcpPortRangeError.
  ///
  /// In zh, this message translates to:
  /// **'端口号需在 1024 ~ 65535 之间'**
  String get mcpPortRangeError;

  /// No description provided for @mcpPortUpdated.
  ///
  /// In zh, this message translates to:
  /// **'已更新端口为 {port}'**
  String mcpPortUpdated(int port);

  /// No description provided for @mcpCopiedLabel.
  ///
  /// In zh, this message translates to:
  /// **'已复制 {label}'**
  String mcpCopiedLabel(String label);

  /// No description provided for @mcpRunning.
  ///
  /// In zh, this message translates to:
  /// **'运行中 · {url}'**
  String mcpRunning(String url);

  /// No description provided for @mcpStopped.
  ///
  /// In zh, this message translates to:
  /// **'已停止'**
  String get mcpStopped;

  /// No description provided for @mcpEnableLocal.
  ///
  /// In zh, this message translates to:
  /// **'启用本地 MCP 服务'**
  String get mcpEnableLocal;

  /// No description provided for @mcpEnableHint.
  ///
  /// In zh, this message translates to:
  /// **'仅监听 127.0.0.1，供外部 AI 客户端控制播放与搜索'**
  String get mcpEnableHint;

  /// No description provided for @mcpSessions.
  ///
  /// In zh, this message translates to:
  /// **'{count} 会话'**
  String mcpSessions(int count);

  /// No description provided for @mcpListenPort.
  ///
  /// In zh, this message translates to:
  /// **'监听端口'**
  String get mcpListenPort;

  /// No description provided for @mcpPortHint.
  ///
  /// In zh, this message translates to:
  /// **'默认 18888（Streamable HTTP）'**
  String get mcpPortHint;

  /// No description provided for @mcpLazyMode.
  ///
  /// In zh, this message translates to:
  /// **'MCP 懒加载模式'**
  String get mcpLazyMode;

  /// No description provided for @mcpLazyHintOn.
  ///
  /// In zh, this message translates to:
  /// **'初始仅暴露 {core} 个核心工具 + 按需发现 {lazy} 个扩展工具'**
  String mcpLazyHintOn(int core, int lazy);

  /// No description provided for @mcpLazyHintOff.
  ///
  /// In zh, this message translates to:
  /// **'全量暴露当前音乐来源支持的全部 {total} 个工具'**
  String mcpLazyHintOff(int total);

  /// No description provided for @mcpReadOnly.
  ///
  /// In zh, this message translates to:
  /// **'只读安全模式'**
  String get mcpReadOnly;

  /// No description provided for @mcpReadOnlyHint.
  ///
  /// In zh, this message translates to:
  /// **'屏蔽删改歌单、发评论、喜欢/不喜欢等写操作'**
  String get mcpReadOnlyHint;

  /// No description provided for @mcpAuthSection.
  ///
  /// In zh, this message translates to:
  /// **'安全认证'**
  String get mcpAuthSection;

  /// No description provided for @mcpRequireToken.
  ///
  /// In zh, this message translates to:
  /// **'要求 Bearer Token'**
  String get mcpRequireToken;

  /// No description provided for @mcpRequireTokenHint.
  ///
  /// In zh, this message translates to:
  /// **'开启后客户端请求头需携带 Authorization: Bearer <token>'**
  String get mcpRequireTokenHint;

  /// No description provided for @mcpHttpConfigTitle.
  ///
  /// In zh, this message translates to:
  /// **'客户端配置（Streamable HTTP）'**
  String get mcpHttpConfigTitle;

  /// No description provided for @mcpHttpConfigDesc.
  ///
  /// In zh, this message translates to:
  /// **'适用于 Antigravity、Cursor、Claude 等支持 HTTP MCP 的客户端：'**
  String get mcpHttpConfigDesc;

  /// No description provided for @mcpCopyHttpConfig.
  ///
  /// In zh, this message translates to:
  /// **'复制 HTTP 配置'**
  String get mcpCopyHttpConfig;

  /// No description provided for @mcpHttpConfigLabel.
  ///
  /// In zh, this message translates to:
  /// **'Streamable HTTP 配置'**
  String get mcpHttpConfigLabel;

  /// No description provided for @mcpStdioConfigTitle.
  ///
  /// In zh, this message translates to:
  /// **'Stdio 桥接配置（支持自动唤醒）'**
  String get mcpStdioConfigTitle;

  /// No description provided for @mcpStdioConfigDesc.
  ///
  /// In zh, this message translates to:
  /// **'适用于仅支持 stdio 的客户端；请求到达时若应用未运行会自动后台唤醒：'**
  String get mcpStdioConfigDesc;

  /// No description provided for @mcpCopyStdioConfig.
  ///
  /// In zh, this message translates to:
  /// **'复制 Stdio 桥接配置'**
  String get mcpCopyStdioConfig;

  /// No description provided for @mcpStdioConfigLabel.
  ///
  /// In zh, this message translates to:
  /// **'Stdio 桥接配置'**
  String get mcpStdioConfigLabel;

  /// No description provided for @mcpPortStartFailed.
  ///
  /// In zh, this message translates to:
  /// **'端口 {port} 启动失败：{error}'**
  String mcpPortStartFailed(int port, String error);

  /// No description provided for @tabSongs.
  ///
  /// In zh, this message translates to:
  /// **'歌曲'**
  String get tabSongs;

  /// No description provided for @tabAlbums.
  ///
  /// In zh, this message translates to:
  /// **'专辑'**
  String get tabAlbums;

  /// No description provided for @tabPlaylists.
  ///
  /// In zh, this message translates to:
  /// **'歌单'**
  String get tabPlaylists;

  /// No description provided for @tabArtists.
  ///
  /// In zh, this message translates to:
  /// **'艺人'**
  String get tabArtists;

  /// No description provided for @tabArtistSearch.
  ///
  /// In zh, this message translates to:
  /// **'歌手'**
  String get tabArtistSearch;

  /// No description provided for @sortTitleAZ.
  ///
  /// In zh, this message translates to:
  /// **'标题 A-Z'**
  String get sortTitleAZ;

  /// No description provided for @sortReleaseDate.
  ///
  /// In zh, this message translates to:
  /// **'发行时间'**
  String get sortReleaseDate;

  /// No description provided for @sortDefault.
  ///
  /// In zh, this message translates to:
  /// **'默认'**
  String get sortDefault;

  /// No description provided for @sortAlbumAZ.
  ///
  /// In zh, this message translates to:
  /// **'专辑 A-Z'**
  String get sortAlbumAZ;

  /// No description provided for @libraryEmptyTitle.
  ///
  /// In zh, this message translates to:
  /// **'音乐库还是空的'**
  String get libraryEmptyTitle;

  /// No description provided for @libraryAddSource.
  ///
  /// In zh, this message translates to:
  /// **'添加音乐源'**
  String get libraryAddSource;

  /// No description provided for @libraryNoAlbums.
  ///
  /// In zh, this message translates to:
  /// **'还没有专辑'**
  String get libraryNoAlbums;

  /// No description provided for @libraryNoSongs.
  ///
  /// In zh, this message translates to:
  /// **'还没有歌曲'**
  String get libraryNoSongs;

  /// No description provided for @libraryNoPlaylists.
  ///
  /// In zh, this message translates to:
  /// **'还没有歌单'**
  String get libraryNoPlaylists;

  /// No description provided for @libraryNoArtists.
  ///
  /// In zh, this message translates to:
  /// **'还没有艺人'**
  String get libraryNoArtists;

  /// No description provided for @libraryEarlier.
  ///
  /// In zh, this message translates to:
  /// **'更早'**
  String get libraryEarlier;

  /// No description provided for @libraryCreatedByMe.
  ///
  /// In zh, this message translates to:
  /// **'我创建的'**
  String get libraryCreatedByMe;

  /// No description provided for @libraryCollected.
  ///
  /// In zh, this message translates to:
  /// **'收藏的'**
  String get libraryCollected;

  /// No description provided for @countTracks.
  ///
  /// In zh, this message translates to:
  /// **'{count} 首'**
  String countTracks(int count);

  /// No description provided for @countSongs.
  ///
  /// In zh, this message translates to:
  /// **'{count} 首歌曲'**
  String countSongs(int count);

  /// No description provided for @countAlbums.
  ///
  /// In zh, this message translates to:
  /// **'{count} 张专辑'**
  String countAlbums(int count);

  /// No description provided for @countPlays.
  ///
  /// In zh, this message translates to:
  /// **'{count} 次'**
  String countPlays(String count);

  /// No description provided for @countComments.
  ///
  /// In zh, this message translates to:
  /// **'{count} 条评论'**
  String countComments(String count);

  /// No description provided for @durationHours.
  ///
  /// In zh, this message translates to:
  /// **'{count} 小时'**
  String durationHours(int count);

  /// No description provided for @durationMinutes.
  ///
  /// In zh, this message translates to:
  /// **'{count} 分钟'**
  String durationMinutes(int count);

  /// No description provided for @albumTracksDuration.
  ///
  /// In zh, this message translates to:
  /// **'{tracks} 首 · {minutes} 分钟'**
  String albumTracksDuration(int tracks, int minutes);

  /// No description provided for @albumNotFound.
  ///
  /// In zh, this message translates to:
  /// **'找不到这张专辑'**
  String get albumNotFound;

  /// No description provided for @albumKindAlbum.
  ///
  /// In zh, this message translates to:
  /// **'专辑'**
  String get albumKindAlbum;

  /// No description provided for @albumKindSingle.
  ///
  /// In zh, this message translates to:
  /// **'单曲'**
  String get albumKindSingle;

  /// No description provided for @albumKindCompilation.
  ///
  /// In zh, this message translates to:
  /// **'合集'**
  String get albumKindCompilation;

  /// No description provided for @albumTracksTitle.
  ///
  /// In zh, this message translates to:
  /// **'曲目'**
  String get albumTracksTitle;

  /// No description provided for @albumReleasedIn.
  ///
  /// In zh, this message translates to:
  /// **'发行于 {year} 年'**
  String albumReleasedIn(int year);

  /// No description provided for @albumReleasedOn.
  ///
  /// In zh, this message translates to:
  /// **'发行于 {date}'**
  String albumReleasedOn(String date);

  /// No description provided for @artistFollowed.
  ///
  /// In zh, this message translates to:
  /// **'已关注 {name}'**
  String artistFollowed(String name);

  /// No description provided for @artistUnfollowed.
  ///
  /// In zh, this message translates to:
  /// **'已取消关注'**
  String get artistUnfollowed;

  /// No description provided for @artistFollowFailed.
  ///
  /// In zh, this message translates to:
  /// **'没能关注，稍后再试'**
  String get artistFollowFailed;

  /// No description provided for @artistUnfollowFailed.
  ///
  /// In zh, this message translates to:
  /// **'没能取消关注，稍后再试'**
  String get artistUnfollowFailed;

  /// No description provided for @artistSimilar.
  ///
  /// In zh, this message translates to:
  /// **'相似艺人'**
  String get artistSimilar;

  /// No description provided for @artistHotTracksOf.
  ///
  /// In zh, this message translates to:
  /// **'{name} 的热门歌曲'**
  String artistHotTracksOf(String name);

  /// No description provided for @artistLatestRelease.
  ///
  /// In zh, this message translates to:
  /// **'最新发布'**
  String get artistLatestRelease;

  /// No description provided for @artistHotTracks.
  ///
  /// In zh, this message translates to:
  /// **'热门歌曲'**
  String get artistHotTracks;

  /// No description provided for @artistSinglesAndEps.
  ///
  /// In zh, this message translates to:
  /// **'单曲与 EP'**
  String get artistSinglesAndEps;

  /// No description provided for @playlistSearchPlaceholder.
  ///
  /// In zh, this message translates to:
  /// **'在歌单内搜索'**
  String get playlistSearchPlaceholder;

  /// No description provided for @playlistColTitle.
  ///
  /// In zh, this message translates to:
  /// **'标题'**
  String get playlistColTitle;

  /// No description provided for @playlistColAlbum.
  ///
  /// In zh, this message translates to:
  /// **'专辑'**
  String get playlistColAlbum;

  /// No description provided for @playlistColAdded.
  ///
  /// In zh, this message translates to:
  /// **'加入时间'**
  String get playlistColAdded;

  /// No description provided for @playlistEmpty.
  ///
  /// In zh, this message translates to:
  /// **'歌单里还没有歌'**
  String get playlistEmpty;

  /// No description provided for @playlistNoMatch.
  ///
  /// In zh, this message translates to:
  /// **'没有找到「{query}」'**
  String playlistNoMatch(String query);

  /// No description provided for @playlistTagCount.
  ///
  /// In zh, this message translates to:
  /// **'「{tag}」有 {count} 首'**
  String playlistTagCount(String tag, int count);

  /// No description provided for @searchPlaceholder.
  ///
  /// In zh, this message translates to:
  /// **'搜索歌曲、专辑、歌手和歌单'**
  String get searchPlaceholder;

  /// No description provided for @searchUnsupported.
  ///
  /// In zh, this message translates to:
  /// **'这个插件不支持搜索。'**
  String get searchUnsupported;

  /// No description provided for @searchRecent.
  ///
  /// In zh, this message translates to:
  /// **'最近搜索'**
  String get searchRecent;

  /// No description provided for @searchRecentResults.
  ///
  /// In zh, this message translates to:
  /// **'最近搜索结果'**
  String get searchRecentResults;

  /// No description provided for @searchHot.
  ///
  /// In zh, this message translates to:
  /// **'热门搜索'**
  String get searchHot;

  /// No description provided for @searchRemoveHistory.
  ///
  /// In zh, this message translates to:
  /// **'从记录里删掉'**
  String get searchRemoveHistory;

  /// No description provided for @searchNoResults.
  ///
  /// In zh, this message translates to:
  /// **'没有找到「{query}」'**
  String searchNoResults(String query);

  /// No description provided for @searchViewAllSongs.
  ///
  /// In zh, this message translates to:
  /// **'查看全部 {count} 首歌'**
  String searchViewAllSongs(int count);

  /// No description provided for @searchViewAllAlbums.
  ///
  /// In zh, this message translates to:
  /// **'查看全部 {count} 张专辑'**
  String searchViewAllAlbums(int count);

  /// No description provided for @searchAllCount.
  ///
  /// In zh, this message translates to:
  /// **'全部 {count}'**
  String searchAllCount(int count);

  /// No description provided for @searchQueueName.
  ///
  /// In zh, this message translates to:
  /// **'搜索「{query}」'**
  String searchQueueName(String query);

  /// No description provided for @searchMcpQueueName.
  ///
  /// In zh, this message translates to:
  /// **'搜索：{query}'**
  String searchMcpQueueName(String query);

  /// No description provided for @commentSortHot.
  ///
  /// In zh, this message translates to:
  /// **'热门'**
  String get commentSortHot;

  /// No description provided for @commentSortLatest.
  ///
  /// In zh, this message translates to:
  /// **'最新'**
  String get commentSortLatest;

  /// No description provided for @commentWrite.
  ///
  /// In zh, this message translates to:
  /// **'写评论'**
  String get commentWrite;

  /// No description provided for @commentEmpty.
  ///
  /// In zh, this message translates to:
  /// **'还没有评论'**
  String get commentEmpty;

  /// No description provided for @commentLoadFailed.
  ///
  /// In zh, this message translates to:
  /// **'评论加载失败'**
  String get commentLoadFailed;

  /// No description provided for @commentLikeFailed.
  ///
  /// In zh, this message translates to:
  /// **'点赞失败'**
  String get commentLikeFailed;

  /// No description provided for @commentAnonymous.
  ///
  /// In zh, this message translates to:
  /// **'匿名'**
  String get commentAnonymous;

  /// No description provided for @commentReply.
  ///
  /// In zh, this message translates to:
  /// **'回复'**
  String get commentReply;

  /// No description provided for @commentPosted.
  ///
  /// In zh, this message translates to:
  /// **'评论已发布'**
  String get commentPosted;

  /// No description provided for @commentReplyPosted.
  ///
  /// In zh, this message translates to:
  /// **'回复已发布'**
  String get commentReplyPosted;

  /// No description provided for @commentPostFailed.
  ///
  /// In zh, this message translates to:
  /// **'发布失败'**
  String get commentPostFailed;

  /// No description provided for @commentWriteTo.
  ///
  /// In zh, this message translates to:
  /// **'写给'**
  String get commentWriteTo;

  /// No description provided for @commentPosting.
  ///
  /// In zh, this message translates to:
  /// **'正在发布…'**
  String get commentPosting;

  /// No description provided for @commentPost.
  ///
  /// In zh, this message translates to:
  /// **'发布'**
  String get commentPost;

  /// No description provided for @commentPlaceholder.
  ///
  /// In zh, this message translates to:
  /// **'写点什么…'**
  String get commentPlaceholder;

  /// No description provided for @commentReplyPlaceholder.
  ///
  /// In zh, this message translates to:
  /// **'回复 {name}…'**
  String commentReplyPlaceholder(String name);

  /// No description provided for @profileLocalUnsupported.
  ///
  /// In zh, this message translates to:
  /// **'本地音乐没有个人主页。'**
  String get profileLocalUnsupported;

  /// No description provided for @profileSourceUnsupported.
  ///
  /// In zh, this message translates to:
  /// **'「{name}」没有个人主页。'**
  String profileSourceUnsupported(String name);

  /// No description provided for @profileSignInHint.
  ///
  /// In zh, this message translates to:
  /// **'登录「{name}」后可以看到你的个人主页。'**
  String profileSignInHint(String name);

  /// No description provided for @profileTopArtists.
  ///
  /// In zh, this message translates to:
  /// **'最常听的艺人'**
  String get profileTopArtists;

  /// No description provided for @profileMostPlayed.
  ///
  /// In zh, this message translates to:
  /// **'最常听'**
  String get profileMostPlayed;

  /// No description provided for @profileMyPlaylists.
  ///
  /// In zh, this message translates to:
  /// **'我创建的歌单'**
  String get profileMyPlaylists;

  /// No description provided for @signOutConfirmTitle.
  ///
  /// In zh, this message translates to:
  /// **'退出「{name}」？'**
  String signOutConfirmTitle(String name);

  /// No description provided for @signOutConfirmMessage.
  ///
  /// In zh, this message translates to:
  /// **'退出后这个源的音乐库、歌单和推荐都看不到了，\n重新登录就能回来。'**
  String get signOutConfirmMessage;

  /// No description provided for @signInDialogTitle.
  ///
  /// In zh, this message translates to:
  /// **'登录{name}'**
  String signInDialogTitle(String name);

  /// No description provided for @signInQrFailed.
  ///
  /// In zh, this message translates to:
  /// **'二维码生成失败'**
  String get signInQrFailed;

  /// No description provided for @remoteNeedSignIn.
  ///
  /// In zh, this message translates to:
  /// **'需要先登录'**
  String get remoteNeedSignIn;

  /// No description provided for @remoteErrorKind.
  ///
  /// In zh, this message translates to:
  /// **'出错了（{kind}）'**
  String remoteErrorKind(String kind);

  /// No description provided for @remotePluginMissing.
  ///
  /// In zh, this message translates to:
  /// **'插件 {id} 没有加载。可以在设置里重新加载插件。'**
  String remotePluginMissing(String id);

  /// No description provided for @remoteSwitchToLocalHint.
  ///
  /// In zh, this message translates to:
  /// **'可以在设置里换回本地音乐'**
  String get remoteSwitchToLocalHint;

  /// No description provided for @remoteNoDiscover.
  ///
  /// In zh, this message translates to:
  /// **'这个插件没有发现页，可以用搜索找歌。'**
  String get remoteNoDiscover;

  /// No description provided for @remoteNoHome.
  ///
  /// In zh, this message translates to:
  /// **'这个插件没有首页，可以用搜索找歌。'**
  String get remoteNoHome;

  /// No description provided for @remoteNoContent.
  ///
  /// In zh, this message translates to:
  /// **'这里暂时没有内容。'**
  String get remoteNoContent;

  /// No description provided for @remotePlayAlbumFailed.
  ///
  /// In zh, this message translates to:
  /// **'没能播放这张专辑，稍后再试'**
  String get remotePlayAlbumFailed;

  /// No description provided for @greetingLateNight.
  ///
  /// In zh, this message translates to:
  /// **'夜深了'**
  String get greetingLateNight;

  /// No description provided for @greetingMorning.
  ///
  /// In zh, this message translates to:
  /// **'早上好'**
  String get greetingMorning;

  /// No description provided for @greetingNoon.
  ///
  /// In zh, this message translates to:
  /// **'中午好'**
  String get greetingNoon;

  /// No description provided for @greetingAfternoon.
  ///
  /// In zh, this message translates to:
  /// **'下午好'**
  String get greetingAfternoon;

  /// No description provided for @greetingEvening.
  ///
  /// In zh, this message translates to:
  /// **'晚上好'**
  String get greetingEvening;

  /// No description provided for @localRecentlyAdded.
  ///
  /// In zh, this message translates to:
  /// **'最近添加'**
  String get localRecentlyAdded;

  /// No description provided for @localEmptyHint.
  ///
  /// In zh, this message translates to:
  /// **'还没有歌曲，去设置里添加音乐文件夹'**
  String get localEmptyHint;

  /// No description provided for @localArtistNotFound.
  ///
  /// In zh, this message translates to:
  /// **'找不到这位艺人'**
  String get localArtistNotFound;

  /// No description provided for @localFileMovedOrDeleted.
  ///
  /// In zh, this message translates to:
  /// **'文件已被移动或删除'**
  String get localFileMovedOrDeleted;

  /// No description provided for @timeJustNow.
  ///
  /// In zh, this message translates to:
  /// **'刚刚'**
  String get timeJustNow;

  /// No description provided for @timeMinutesAgo.
  ///
  /// In zh, this message translates to:
  /// **'{count} 分钟前'**
  String timeMinutesAgo(int count);

  /// No description provided for @timeHoursAgo.
  ///
  /// In zh, this message translates to:
  /// **'{count} 小时前'**
  String timeHoursAgo(int count);

  /// No description provided for @timeDaysAgo.
  ///
  /// In zh, this message translates to:
  /// **'{count} 天前'**
  String timeDaysAgo(int count);

  /// No description provided for @timeMonthsAgo.
  ///
  /// In zh, this message translates to:
  /// **'{count} 个月前'**
  String timeMonthsAgo(int count);

  /// No description provided for @timeYearsAgo.
  ///
  /// In zh, this message translates to:
  /// **'{count} 年前'**
  String timeYearsAgo(int count);

  /// No description provided for @timeToday.
  ///
  /// In zh, this message translates to:
  /// **'今天'**
  String get timeToday;

  /// No description provided for @timeYesterday.
  ///
  /// In zh, this message translates to:
  /// **'昨天'**
  String get timeYesterday;

  /// No description provided for @dateYear.
  ///
  /// In zh, this message translates to:
  /// **'{year} 年'**
  String dateYear(int year);

  /// No description provided for @dateYearMonth.
  ///
  /// In zh, this message translates to:
  /// **'{year} 年 {month} 月'**
  String dateYearMonth(int year, int month);

  /// No description provided for @dateMonthDay.
  ///
  /// In zh, this message translates to:
  /// **'{month} 月 {day} 日'**
  String dateMonthDay(int month, int day);

  /// No description provided for @dateYearMonthDay.
  ///
  /// In zh, this message translates to:
  /// **'{year} 年 {month} 月 {day} 日'**
  String dateYearMonthDay(int year, int month, int day);

  /// No description provided for @toastSignedInAs.
  ///
  /// In zh, this message translates to:
  /// **'已登录：{name}'**
  String toastSignedInAs(String name);

  /// No description provided for @toastNotSignedIn.
  ///
  /// In zh, this message translates to:
  /// **'没有登录'**
  String get toastNotSignedIn;

  /// No description provided for @toastSignOutFailed.
  ///
  /// In zh, this message translates to:
  /// **'退出失败'**
  String get toastSignOutFailed;

  /// No description provided for @toastPlayAlbumFailed.
  ///
  /// In zh, this message translates to:
  /// **'放不了这张专辑'**
  String get toastPlayAlbumFailed;

  /// No description provided for @toastPlayPlaylistFailed.
  ///
  /// In zh, this message translates to:
  /// **'放不了这个歌单'**
  String get toastPlayPlaylistFailed;

  /// No description provided for @toastPlaybackError.
  ///
  /// In zh, this message translates to:
  /// **'播放出错：{error}'**
  String toastPlaybackError(String error);

  /// No description provided for @toastCannotPlayTrack.
  ///
  /// In zh, this message translates to:
  /// **'无法播放「{title}」'**
  String toastCannotPlayTrack(String title);

  /// No description provided for @toastStationEmpty.
  ///
  /// In zh, this message translates to:
  /// **'{name} 暂时没有歌'**
  String toastStationEmpty(String name);

  /// No description provided for @toastStationOpenFailed.
  ///
  /// In zh, this message translates to:
  /// **'{name} 打不开'**
  String toastStationOpenFailed(String name);

  /// No description provided for @toastAddedToPlaylist.
  ///
  /// In zh, this message translates to:
  /// **'已添加到「{name}」'**
  String toastAddedToPlaylist(String name);

  /// No description provided for @toastAddToPlaylistFailed.
  ///
  /// In zh, this message translates to:
  /// **'没能添加到「{name}」'**
  String toastAddToPlaylistFailed(String name);

  /// No description provided for @toastPlaylistCreated.
  ///
  /// In zh, this message translates to:
  /// **'已新建歌单「{name}」'**
  String toastPlaylistCreated(String name);

  /// No description provided for @toastCreatePlaylistFailed.
  ///
  /// In zh, this message translates to:
  /// **'没能新建歌单'**
  String get toastCreatePlaylistFailed;

  /// No description provided for @toastRemovedFromPlaylist.
  ///
  /// In zh, this message translates to:
  /// **'已从歌单中删除'**
  String get toastRemovedFromPlaylist;

  /// No description provided for @toastRemoveFromPlaylistFailed.
  ///
  /// In zh, this message translates to:
  /// **'没能从歌单中删除'**
  String get toastRemoveFromPlaylistFailed;

  /// No description provided for @toastNoSimilarFound.
  ///
  /// In zh, this message translates to:
  /// **'没找到相似的歌'**
  String get toastNoSimilarFound;

  /// No description provided for @toastSimilarQueueName.
  ///
  /// In zh, this message translates to:
  /// **'「{title}」的相似歌曲'**
  String toastSimilarQueueName(String title);

  /// No description provided for @toastFindSimilarFailed.
  ///
  /// In zh, this message translates to:
  /// **'没能找到相似的歌'**
  String get toastFindSimilarFailed;

  /// No description provided for @toastActionFailed.
  ///
  /// In zh, this message translates to:
  /// **'「{title}」没有成功'**
  String toastActionFailed(String title);

  /// No description provided for @toastDisliked.
  ///
  /// In zh, this message translates to:
  /// **'以后少推荐这样的歌'**
  String get toastDisliked;

  /// No description provided for @toastDislikeFailed.
  ///
  /// In zh, this message translates to:
  /// **'没能告诉{name}'**
  String toastDislikeFailed(String name);

  /// No description provided for @toastLikeFailed.
  ///
  /// In zh, this message translates to:
  /// **'没能喜欢这首歌'**
  String get toastLikeFailed;

  /// No description provided for @toastUnlikeFailed.
  ///
  /// In zh, this message translates to:
  /// **'没能取消喜欢'**
  String get toastUnlikeFailed;

  /// No description provided for @toastSaveAlbumFailed.
  ///
  /// In zh, this message translates to:
  /// **'没能收藏这张专辑'**
  String get toastSaveAlbumFailed;

  /// No description provided for @toastUnsaveAlbumFailed.
  ///
  /// In zh, this message translates to:
  /// **'没能取消收藏'**
  String get toastUnsaveAlbumFailed;

  /// No description provided for @toastAlbumSaved.
  ///
  /// In zh, this message translates to:
  /// **'已收藏「{title}」'**
  String toastAlbumSaved(String title);

  /// No description provided for @toastAlbumUnsaved.
  ///
  /// In zh, this message translates to:
  /// **'已取消收藏'**
  String get toastAlbumUnsaved;

  /// No description provided for @pluginErrIdTaken.
  ///
  /// In zh, this message translates to:
  /// **'id {id} 已被占用'**
  String pluginErrIdTaken(String id);

  /// No description provided for @pluginErrMinAppVersion.
  ///
  /// In zh, this message translates to:
  /// **'需要 YesPlayMusic {required} 或更新的版本，当前是 {current}'**
  String pluginErrMinAppVersion(String required, String current);

  /// No description provided for @pluginErrEmptyLink.
  ///
  /// In zh, this message translates to:
  /// **'请填写链接'**
  String get pluginErrEmptyLink;

  /// No description provided for @pluginErrInvalidLink.
  ///
  /// In zh, this message translates to:
  /// **'看不懂这个链接'**
  String get pluginErrInvalidLink;

  /// No description provided for @pluginErrDownloadNetwork.
  ///
  /// In zh, this message translates to:
  /// **'下载失败，请检查网络：{error}'**
  String pluginErrDownloadNetwork(String error);

  /// No description provided for @pluginErrRepoNotFound.
  ///
  /// In zh, this message translates to:
  /// **'找不到 GitHub 仓库 {slug}'**
  String pluginErrRepoNotFound(String slug);

  /// No description provided for @pluginErrNoManifestInPath.
  ///
  /// In zh, this message translates to:
  /// **'{path} 里没有 plugin.json'**
  String pluginErrNoManifestInPath(String path);

  /// No description provided for @pluginErrNoManifestInLink.
  ///
  /// In zh, this message translates to:
  /// **'这个链接里没有找到 plugin.json'**
  String get pluginErrNoManifestInLink;

  /// No description provided for @pluginErrMissingEntry.
  ///
  /// In zh, this message translates to:
  /// **'插件缺少入口文件 {file}'**
  String pluginErrMissingEntry(String file);

  /// No description provided for @pluginErrNotFoundUrl.
  ///
  /// In zh, this message translates to:
  /// **'找不到 {url}'**
  String pluginErrNotFoundUrl(String url);

  /// No description provided for @pluginErrGithubRateLimit.
  ///
  /// In zh, this message translates to:
  /// **'GitHub 暂时拒绝了请求（可能是访问太频繁），请稍后再试'**
  String get pluginErrGithubRateLimit;

  /// No description provided for @pluginErrDownloadHttp.
  ///
  /// In zh, this message translates to:
  /// **'下载失败：HTTP {code}'**
  String pluginErrDownloadHttp(int code);

  /// No description provided for @pluginErrTooLarge.
  ///
  /// In zh, this message translates to:
  /// **'插件太大了（超过 50 MB）'**
  String get pluginErrTooLarge;

  /// No description provided for @pluginErrInvalidZip.
  ///
  /// In zh, this message translates to:
  /// **'下载的文件不是有效的 .zip'**
  String get pluginErrInvalidZip;

  /// No description provided for @pluginErrManifestJson.
  ///
  /// In zh, this message translates to:
  /// **'plugin.json 不是合法 JSON：{error}'**
  String pluginErrManifestJson(String error);

  /// No description provided for @pluginErrManifestObject.
  ///
  /// In zh, this message translates to:
  /// **'plugin.json 应该是一个对象'**
  String get pluginErrManifestObject;

  /// No description provided for @pluginErrManifestIdChars.
  ///
  /// In zh, this message translates to:
  /// **'id \"{id}\" 只能用小写字母、数字和 . _ -'**
  String pluginErrManifestIdChars(String id);

  /// No description provided for @pluginErrManifestIdLocal.
  ///
  /// In zh, this message translates to:
  /// **'id \"local\" 是保留的'**
  String get pluginErrManifestIdLocal;

  /// No description provided for @pluginErrManifestNoName.
  ///
  /// In zh, this message translates to:
  /// **'缺少 name'**
  String get pluginErrManifestNoName;

  /// No description provided for @pluginErrManifestMain.
  ///
  /// In zh, this message translates to:
  /// **'main \"{file}\" 应该是插件目录里的 .js 文件'**
  String pluginErrManifestMain(String file);

  /// No description provided for @pluginErrManifestIcon.
  ///
  /// In zh, this message translates to:
  /// **'icon \"{file}\" 应该是插件目录里的 png、jpg 或 webp 文件'**
  String pluginErrManifestIcon(String file);

  /// No description provided for @pluginErrStopped.
  ///
  /// In zh, this message translates to:
  /// **'{name} 已停止'**
  String pluginErrStopped(String name);

  /// No description provided for @pluginErrNoManifestDir.
  ///
  /// In zh, this message translates to:
  /// **'{dir}：没有 plugin.json'**
  String pluginErrNoManifestDir(String dir);

  /// No description provided for @pluginErrMinVersionSimple.
  ///
  /// In zh, this message translates to:
  /// **'{name} 需要 YesPlayMusic {version} 或更新的版本'**
  String pluginErrMinVersionSimple(String name, String version);

  /// No description provided for @pluginErrProcessExited.
  ///
  /// In zh, this message translates to:
  /// **'{name}：插件进程意外退出'**
  String pluginErrProcessExited(String name);

  /// No description provided for @pluginErrNotObject.
  ///
  /// In zh, this message translates to:
  /// **'{name}.{op} 返回的不是对象'**
  String pluginErrNotObject(String name, String op);

  /// No description provided for @pluginErrNotArray.
  ///
  /// In zh, this message translates to:
  /// **'{name}.{op} 返回的不是数组'**
  String pluginErrNotArray(String name, String op);

  /// No description provided for @pluginErrInvalidStreamUrl.
  ///
  /// In zh, this message translates to:
  /// **'{name} 给的播放地址无效'**
  String pluginErrInvalidStreamUrl(String name);

  /// No description provided for @pluginErrDuplicateId.
  ///
  /// In zh, this message translates to:
  /// **'和其他插件的 id 重复：{id}'**
  String pluginErrDuplicateId(String id);

  /// No description provided for @pluginErrTimeoutDisabled.
  ///
  /// In zh, this message translates to:
  /// **'插件运行超过 {seconds} 秒没有返回，已停用'**
  String pluginErrTimeoutDisabled(int seconds);

  /// No description provided for @pluginErrOomDisabled.
  ///
  /// In zh, this message translates to:
  /// **'插件内存用尽，已停用'**
  String get pluginErrOomDisabled;

  /// No description provided for @pluginErrLoadTimeout.
  ///
  /// In zh, this message translates to:
  /// **'加载超时'**
  String get pluginErrLoadTimeout;

  /// No description provided for @pluginErrOpTimeout.
  ///
  /// In zh, this message translates to:
  /// **'{op} 超时（{seconds} 秒）'**
  String pluginErrOpTimeout(String op, int seconds);

  /// No description provided for @pluginErrClosed.
  ///
  /// In zh, this message translates to:
  /// **'插件已关闭'**
  String get pluginErrClosed;

  /// No description provided for @sourceErrUnsupported.
  ///
  /// In zh, this message translates to:
  /// **'{name} 不支持 {op}'**
  String sourceErrUnsupported(String name, String op);

  /// No description provided for @sourceErrNotFound.
  ///
  /// In zh, this message translates to:
  /// **'找不到源 {source}'**
  String sourceErrNotFound(String source);
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>[
    'de',
    'en',
    'es',
    'fr',
    'ja',
    'ko',
    'ru',
    'zh',
  ].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when language+script codes are specified.
  switch (locale.languageCode) {
    case 'zh':
      {
        switch (locale.scriptCode) {
          case 'Hant':
            return AppLocalizationsZhHant();
        }
        break;
      }
  }

  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'de':
      return AppLocalizationsDe();
    case 'en':
      return AppLocalizationsEn();
    case 'es':
      return AppLocalizationsEs();
    case 'fr':
      return AppLocalizationsFr();
    case 'ja':
      return AppLocalizationsJa();
    case 'ko':
      return AppLocalizationsKo();
    case 'ru':
      return AppLocalizationsRu();
    case 'zh':
      return AppLocalizationsZh();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
