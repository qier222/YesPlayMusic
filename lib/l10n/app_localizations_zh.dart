// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Chinese (`zh`).
class AppLocalizationsZh extends AppLocalizations {
  AppLocalizationsZh([String locale = 'zh']) : super(locale);

  @override
  String get navHome => '首页';

  @override
  String get navDiscover => '发现';

  @override
  String get navLibrary => '音乐库';

  @override
  String get navSearch => '搜索';

  @override
  String get navSearchPage => '搜索页';

  @override
  String get navSettings => '设置';

  @override
  String get navProfile => '个人主页';

  @override
  String get actionPlay => '播放';

  @override
  String get actionPause => '暂停';

  @override
  String get actionPlayAll => '播放全部';

  @override
  String get actionShuffle => '随机播放';

  @override
  String get actionNext => '下一首';

  @override
  String get actionPrev => '上一首';

  @override
  String get actionLike => '喜欢';

  @override
  String get actionUnlike => '取消喜欢';

  @override
  String get actionSaveAlbum => '收藏专辑';

  @override
  String get actionUnsave => '取消收藏';

  @override
  String get actionFollow => '关注';

  @override
  String get actionFollowing => '已关注';

  @override
  String get actionMore => '更多';

  @override
  String get actionBack => '返回';

  @override
  String get actionClose => '关闭';

  @override
  String get actionCancel => '取消';

  @override
  String get actionConfirm => '确定';

  @override
  String get actionClear => '清除';

  @override
  String get actionClearShort => '清空';

  @override
  String get actionRetry => '重试';

  @override
  String get actionOpen => '打开';

  @override
  String get actionSave => '保存';

  @override
  String get actionSaving => '保存中…';

  @override
  String get actionDone => '完成';

  @override
  String get actionApply => '应用';

  @override
  String get actionCopy => '复制';

  @override
  String get actionReset => '重置';

  @override
  String get actionAdd => '添加';

  @override
  String get actionSelect => '选择';

  @override
  String get actionAll => '全部';

  @override
  String get actionCollapse => '收起';

  @override
  String get actionExpandAllCategories => '全部分类';

  @override
  String get actionPrevPage => '上一页';

  @override
  String get actionNextPage => '下一页';

  @override
  String get actionViewFullText => '查看全文';

  @override
  String get actionShow => '显示';

  @override
  String get actionHide => '隐藏';

  @override
  String get actionReload => '重新加载';

  @override
  String get actionInstall => '安装';

  @override
  String get actionUpdate => '更新';

  @override
  String get actionUninstall => '卸载';

  @override
  String get actionEnable => '启用';

  @override
  String get actionSignIn => '登录';

  @override
  String get actionSignOut => '退出登录';

  @override
  String get actionManageSources => '管理音乐源';

  @override
  String get actionManagePlugins => '管理插件';

  @override
  String get actionGoSearch => '去搜索';

  @override
  String get actionLoadMore => '加载更多';

  @override
  String get stateLoading => '正在加载…';

  @override
  String get stateLoadingShort => '加载中…';

  @override
  String get stateLoadFailed => '加载失败';

  @override
  String get stateCouldNotLoad => '没能加载';

  @override
  String get stateSigningIn => '正在登录…';

  @override
  String get stateSigningInShort => '登录中…';

  @override
  String get stateSignedIn => '已登录';

  @override
  String get stateNotSignedIn => '未登录';

  @override
  String get stateNone => '无';

  @override
  String get statePleaseSelect => '请选择';

  @override
  String get stateCopied => '已复制';

  @override
  String get stateSaved => '已保存';

  @override
  String stateSaveFailed(String error) {
    return '保存失败：$error';
  }

  @override
  String get miniShuffleOn => '随机播放：开';

  @override
  String get miniRepeatOn => '列表循环';

  @override
  String get miniRepeatOff => '不循环';

  @override
  String get miniQueue => '播放队列';

  @override
  String get miniOpenNowPlaying => '打开正在播放';

  @override
  String get miniMute => '静音';

  @override
  String get npTitle => '正在播放';

  @override
  String get npComments => '评论';

  @override
  String get npSimilar => '相似歌曲';

  @override
  String npSimilarTo(String title) {
    return '和 $title 相似';
  }

  @override
  String get npNoSimilar => '没有找到相似的歌曲';

  @override
  String get npUpNext => '接下来';

  @override
  String get npQueueEmpty => '队列里没有更多歌曲了';

  @override
  String get npFromPrefix => '来自 ';

  @override
  String get npViewAlbum => '查看专辑';

  @override
  String get npViewArtist => '查看艺人';

  @override
  String get menuPlayNext => '下一首播放';

  @override
  String get menuAddedNext => '将在下一首播放';

  @override
  String get menuAddToQueue => '加入播放队列';

  @override
  String get menuAddedToQueue => '已加入播放队列';

  @override
  String get menuAddToPlaylist => '添加到歌单';

  @override
  String get menuCreatePlaylist => '新建歌单';

  @override
  String get menuPlaylistNamePlaceholder => '歌单名字';

  @override
  String get menuCreateAndAdd => '新建并添加';

  @override
  String get menuPlaySimilar => '播放相似歌曲';

  @override
  String get menuDislike => '不喜欢';

  @override
  String get menuRemoveFromPlaylist => '从歌单中删除';

  @override
  String get shortcutGroupPlayback => '播放';

  @override
  String get shortcutGroupUi => '界面';

  @override
  String get shortcutGroupMediaKeys => '媒体键';

  @override
  String get shortcutPlayPause => '播放 / 暂停';

  @override
  String get shortcutSpaceKey => '空格';

  @override
  String get shortcutSeekForward => '快进 5 秒';

  @override
  String get shortcutSeekBackward => '快退 5 秒';

  @override
  String get shortcutVolumeUp => '音量加';

  @override
  String get shortcutVolumeDown => '音量减';

  @override
  String get shortcutMute => '静音';

  @override
  String get shortcutRepeat => '循环模式';

  @override
  String get shortcutLikeCurrent => '喜欢当前歌曲';

  @override
  String get shortcutDismissOverlay => '收起正在播放，关闭弹窗';

  @override
  String get shortcutBack => '后退';

  @override
  String get shortcutForward => '前进';

  @override
  String get shortcutSwitchTab => '切换侧边栏页面';

  @override
  String get shortcutKeyRangeTo => '到';

  @override
  String get shortcutMediaKeysLabel => '键盘媒体键和耳机按键';

  @override
  String get shortcutTypingHintMac => '正在输入文字时，只有 ⌘F 和 Esc 生效';

  @override
  String get shortcutTypingHintOther => '正在输入文字时，只有 Ctrl+F 和 Esc 生效';

  @override
  String get menuBarSettings => '设置…';

  @override
  String get menuBarView => '显示';

  @override
  String get menuBarWindow => '窗口';

  @override
  String get swatchLilac => '丁香紫';

  @override
  String get swatchSky => '天蓝';

  @override
  String get swatchMint => '薄荷';

  @override
  String get swatchSun => '日光';

  @override
  String get swatchRose => '玫瑰';

  @override
  String get swatchFlame => '橙焰';

  @override
  String get settingsGeneral => '通用';

  @override
  String get settingsShortcuts => '快捷键';

  @override
  String get settingsPlugins => '插件';

  @override
  String get settingsAbout => '关于';

  @override
  String get settingsAppearance => '外观';

  @override
  String get settingsLyrics => '歌词';

  @override
  String get settingsPlayback => '播放';

  @override
  String get settingsStorage => '存储';

  @override
  String get settingsAccentColor => '主题色';

  @override
  String get settingsLanguage => '语言';

  @override
  String get langSystem => '跟随系统';

  @override
  String get settingsMiniLyric => '迷你播放器始终显示歌词';

  @override
  String get settingsKeepRunning => '关闭窗口后继续在后台运行';

  @override
  String get trayShowWindow => '显示窗口';

  @override
  String get trayQuit => '退出';

  @override
  String aboutDownloadVersion(String version) {
    return '下载 $version';
  }

  @override
  String get aboutChecking => '正在检查…';

  @override
  String get aboutCheckUpdate => '检查更新';

  @override
  String get aboutAutoCheck => '自动检查更新';

  @override
  String get aboutAnalytics => '发送匿名使用统计';

  @override
  String get aboutSourceAndFeedback => '源代码与问题反馈';

  @override
  String aboutVersion(String version) {
    return '版本 $version';
  }

  @override
  String get aboutLogs => '日志文件';

  @override
  String get aboutLogsHint => '反馈问题时附上';

  @override
  String get aboutOpenFolder => '打开文件夹';

  @override
  String get aboutOpen => '打开';

  @override
  String updaterNewVersion(String version) {
    return '发现新版本 $version';
  }

  @override
  String get updaterUpToDate => '已经是最新版本';

  @override
  String get updaterCheckFailed => '检查更新失败';

  @override
  String storageClearTitle(String size) {
    return '清除 $size 缓存？';
  }

  @override
  String get storageClearMessage => 'API、音频和图片的缓存都会清除，\n之后用到时再重新获取。';

  @override
  String storageCleared(String size) {
    return '已清除 $size 缓存';
  }

  @override
  String storageLimit(String size) {
    return '/ $size 缓存上限';
  }

  @override
  String storageApi(String size) {
    return 'API $size';
  }

  @override
  String storageAudio(String size) {
    return '音频 $size';
  }

  @override
  String storageImage(String size) {
    return '图片 $size';
  }

  @override
  String get storageClearing => '正在清除…';

  @override
  String get storageClearCache => '清除缓存';

  @override
  String get sourceMusicSource => '音乐来源';

  @override
  String get sourceLocal => '本地音乐';

  @override
  String get sourceLocalDesc => '播放电脑上的音乐文件';

  @override
  String get sourceBuiltIn => '内置';

  @override
  String get sourceInUse => '正在使用';

  @override
  String get sourceScanning => '正在扫描…';

  @override
  String get sourceNoFolders => '未添加文件夹';

  @override
  String sourceFolderAlbums(int folders, int albums) {
    return '$folders 个文件夹，$albums 张专辑';
  }

  @override
  String get sourceAddFolderEllipsis => '添加音乐文件夹…';

  @override
  String get sourceAddFolder => '添加文件夹';

  @override
  String get sourceAddMusicFolder => '添加音乐文件夹';

  @override
  String get sourceRescan => '重新扫描';

  @override
  String get sourceMusicFolders => '音乐文件夹';

  @override
  String get sourceNoFoldersAdded => '还没有添加音乐文件夹';

  @override
  String get sourceOpenInFileManager => '在文件管理器中打开';

  @override
  String get sourceShowInFileManager => '在文件管理器中显示';

  @override
  String get sourceStopScanningFolder => '不再扫描这个文件夹';

  @override
  String sourceSwitchedTo(String name) {
    return '已切换到「$name」';
  }

  @override
  String get sourceFolderAlreadyScanned => '这个文件夹已经在扫描范围里了';

  @override
  String get sourceNoMusicFound => '没有找到音乐';

  @override
  String sourceScanningCount(int count) {
    final intl.NumberFormat countNumberFormat =
        intl.NumberFormat.decimalPattern(localeName);
    final String countString = countNumberFormat.format(count);

    return '正在扫描… 已读取 $countString 首';
  }

  @override
  String sourceFoldersUnreadable(int count) {
    final intl.NumberFormat countNumberFormat =
        intl.NumberFormat.decimalPattern(localeName);
    final String countString = countNumberFormat.format(count);

    return '$countString 个文件夹无法读取，已跳过';
  }

  @override
  String get sourceFolderUnreadable => '无法读取，已跳过';

  @override
  String get sourceCancelScan => '取消扫描';

  @override
  String get sourceNotFound => '没有找到这个音乐源';

  @override
  String pluginsLoadedToast(int count) {
    return '已加载 $count 个插件';
  }

  @override
  String get pluginFind => '查找插件';

  @override
  String get pluginInstallTitle => '安装插件';

  @override
  String get pluginTabInstalled => '已安装';

  @override
  String get pluginTabOfficial => '官方插件';

  @override
  String get pluginOpenDir => '打开插件目录';

  @override
  String get pluginThirdPartyHint => '官方之外的插件由各自作者维护';

  @override
  String get pluginDevDocs => '插件开发文档 ›';

  @override
  String get pluginComingSoon => '即将上线';

  @override
  String get pluginInstallFromLink => '从链接安装';

  @override
  String get pluginInstallFromLinkHint => 'GitHub 仓库、Release 或 .zip';

  @override
  String pluginUninstallTitle(String name) {
    return '卸载「$name」？';
  }

  @override
  String get pluginUninstallMessage => '插件的设置和登录状态会一起删除';

  @override
  String pluginUninstalled(String name) {
    return '已卸载「$name」';
  }

  @override
  String pluginUpdateAvailable(String version) {
    return '可更新到 $version';
  }

  @override
  String pluginNeedSetting(String field) {
    return '需要填写$field';
  }

  @override
  String pluginSignedInAs(String name) {
    return '已登录 $name';
  }

  @override
  String pluginDisabledToast(String name) {
    return '已停用「$name」';
  }

  @override
  String pluginEnabledToast(String name) {
    return '已启用「$name」';
  }

  @override
  String get pluginHasUpdate => '有更新';

  @override
  String get pluginSignInAccount => '登录账号';

  @override
  String get pluginSettingsEllipsis => '插件设置…';

  @override
  String get pluginDisable => '停用插件';

  @override
  String get pluginReload => '重新加载插件';

  @override
  String get pluginUninstallEllipsis => '卸载插件…';

  @override
  String get pluginDeleteEllipsis => '删除插件…';

  @override
  String get pluginDisabledBadge => '已停用';

  @override
  String get pluginNotLoadedBadge => '未加载';

  @override
  String get pluginNotLoadedStatus => '插件没有加载';

  @override
  String get pluginEmptyTitle => '还没有安装插件';

  @override
  String get pluginEmptyHint => '支持 GitHub 链接';

  @override
  String get pluginSettingsTitle => '插件设置';

  @override
  String get pluginSectionAccount => '账号';

  @override
  String get pluginSectionCapabilities => '能力';

  @override
  String get pluginSectionPermissions => '权限';

  @override
  String get pluginDisabledHint => '插件已停用，启用后生效';

  @override
  String get pluginUninstallBtn => '卸载插件';

  @override
  String get pluginSignInSyncHint => '登录后同步收藏和歌单';

  @override
  String get pluginGetIt => '去获取 ›';

  @override
  String pluginUpdatedToast(String name) {
    return '已更新「$name」';
  }

  @override
  String pluginInstalledToast(String name) {
    return '已安装「$name」';
  }

  @override
  String pluginInstallFailed(String error) {
    return '安装失败：$error';
  }

  @override
  String get pluginInstallPrompt => '粘贴 GitHub 仓库地址，\n或者插件的下载链接';

  @override
  String get pluginInstallPlaceholder => 'github.com/作者/仓库';

  @override
  String get pluginInstallSupportHint =>
      '支持 GitHub 仓库、Release，以及 plugin.json 和 .zip 链接';

  @override
  String get pluginReading => '读取中…';

  @override
  String get pluginNextStep => '下一步';

  @override
  String get pluginInstallFromLocal => '从本地文件夹安装…';

  @override
  String pluginPublishedAgo(String ago) {
    return '，$ago发布';
  }

  @override
  String get pluginLocalFolder => '本地文件夹';

  @override
  String get pluginLatestCode => '最新代码';

  @override
  String pluginInstalledVersion(String version) {
    return '已安装 $version';
  }

  @override
  String get pluginPermissionsNeeded => '需要这些权限';

  @override
  String get pluginPermNoNetwork => '不访问网络';

  @override
  String get pluginPermNoNetworkDetail => '不连接任何网站';

  @override
  String get pluginPermAnyWebsite => '访问任意网站';

  @override
  String get pluginPermAnyWebsiteDetail => '可连接任意网站';

  @override
  String get pluginPermAnyWebsiteFull => '可以访问任意网站';

  @override
  String get pluginPermNetwork => '访问网络';

  @override
  String get pluginPermSignInDetail => '打开登录页，读取登录后的 Cookie';

  @override
  String get pluginPermProcess => '运行本机程序';

  @override
  String get pluginPermProcessBadge => '需要单独允许';

  @override
  String pluginPermProcessDetail(String programs) {
    return '$programs，默认关闭，可在插件设置中开启';
  }

  @override
  String get pluginPermStorage => '保存数据';

  @override
  String get pluginPermStorageDetail => '保存设置、登录状态和缓存';

  @override
  String get pluginCapabilitiesProvided => '提供这些能力';

  @override
  String get pluginNavIconHint => '带图标的会加到侧边栏';

  @override
  String get pluginTrustHint => '请只安装可信来源的插件';

  @override
  String get pluginInstalling => '安装中…';

  @override
  String get pluginYourServer => '你填写的服务器';

  @override
  String pluginCanAccessHosts(String hosts) {
    return '可访问 $hosts';
  }

  @override
  String pluginCanAccessHostsMore(String hosts, int count) {
    return '可访问 $hosts 等 $count 个';
  }

  @override
  String get pluginOnlyYourServer => '只访问你在设置里填写的服务器';

  @override
  String pluginAndYourServer(String hosts) {
    return '$hosts，以及你在设置里填写的服务器';
  }

  @override
  String get pluginAnyProgram => '任意本机程序';

  @override
  String get officialJellyfinDesc => '连接 Jellyfin 服务器';

  @override
  String get officialPlexDesc => '连接 Plex Media Server';

  @override
  String get officialSubsonicDesc => '连接 Navidrome 等 Subsonic 服务器';

  @override
  String get officialEmbyDesc => '连接 Emby 服务器';

  @override
  String get capSuggest => '搜索建议';

  @override
  String get capLyrics => '歌词';

  @override
  String get capPlaylist => '歌单';

  @override
  String get capEditPlaylist => '编辑歌单';

  @override
  String get capFavorites => '收藏';

  @override
  String get capAlbum => '专辑';

  @override
  String get capArtist => '艺人';

  @override
  String get capRadio => '电台';

  @override
  String get capSimilar => '相似推荐';

  @override
  String get capHistory => '播放记录';

  @override
  String get capDislike => '不感兴趣';

  @override
  String get capTrackMenu => '歌曲菜单';

  @override
  String get mcpPortRangeError => '端口号需在 1024 ~ 65535 之间';

  @override
  String mcpPortUpdated(int port) {
    return '已更新端口为 $port';
  }

  @override
  String mcpCopiedLabel(String label) {
    return '已复制 $label';
  }

  @override
  String mcpRunning(String url) {
    return '运行中 · $url';
  }

  @override
  String get mcpStopped => '已停止';

  @override
  String get mcpEnableLocal => '启用本地 MCP 服务';

  @override
  String get mcpEnableHint => '仅监听 127.0.0.1，供外部 AI 客户端控制播放与搜索';

  @override
  String mcpSessions(int count) {
    return '$count 会话';
  }

  @override
  String get mcpListenPort => '监听端口';

  @override
  String get mcpPortHint => '默认 18888（Streamable HTTP）';

  @override
  String get mcpLazyMode => 'MCP 懒加载模式';

  @override
  String mcpLazyHintOn(int core, int lazy) {
    return '初始仅暴露 $core 个核心工具 + 按需发现 $lazy 个扩展工具';
  }

  @override
  String mcpLazyHintOff(int total) {
    return '全量暴露当前音乐来源支持的全部 $total 个工具';
  }

  @override
  String get mcpReadOnly => '只读安全模式';

  @override
  String get mcpReadOnlyHint => '屏蔽删改歌单、发评论、喜欢/不喜欢等写操作';

  @override
  String get mcpAuthSection => '安全认证';

  @override
  String get mcpRequireToken => '要求 Bearer Token';

  @override
  String get mcpRequireTokenHint =>
      '开启后客户端请求头需携带 Authorization: Bearer <token>';

  @override
  String get mcpHttpConfigTitle => '客户端配置（Streamable HTTP）';

  @override
  String get mcpHttpConfigDesc =>
      '适用于 Antigravity、Cursor、Claude 等支持 HTTP MCP 的客户端：';

  @override
  String get mcpCopyHttpConfig => '复制 HTTP 配置';

  @override
  String get mcpHttpConfigLabel => 'Streamable HTTP 配置';

  @override
  String get mcpStdioConfigTitle => 'Stdio 桥接配置（支持自动唤醒）';

  @override
  String get mcpStdioConfigDesc => '适用于仅支持 stdio 的客户端；请求到达时若应用未运行会自动后台唤醒：';

  @override
  String get mcpCopyStdioConfig => '复制 Stdio 桥接配置';

  @override
  String get mcpStdioConfigLabel => 'Stdio 桥接配置';

  @override
  String mcpPortStartFailed(int port, String error) {
    return '端口 $port 启动失败：$error';
  }

  @override
  String get tabSongs => '歌曲';

  @override
  String get tabAlbums => '专辑';

  @override
  String get tabPlaylists => '歌单';

  @override
  String get tabArtists => '艺人';

  @override
  String get tabArtistSearch => '歌手';

  @override
  String get sortTitleAZ => '标题 A-Z';

  @override
  String get sortReleaseDate => '发行时间';

  @override
  String get sortDefault => '默认';

  @override
  String get sortAlbumAZ => '专辑 A-Z';

  @override
  String get libraryEmptyTitle => '音乐库还是空的';

  @override
  String get libraryAddSource => '添加音乐源';

  @override
  String get libraryNoAlbums => '还没有专辑';

  @override
  String get libraryNoSongs => '还没有歌曲';

  @override
  String get libraryNoPlaylists => '还没有歌单';

  @override
  String get libraryNoArtists => '还没有艺人';

  @override
  String get libraryEarlier => '更早';

  @override
  String get libraryCreatedByMe => '我创建的';

  @override
  String get libraryCollected => '收藏的';

  @override
  String countTracks(int count) {
    return '$count 首';
  }

  @override
  String countSongs(int count) {
    return '$count 首歌曲';
  }

  @override
  String countAlbums(int count) {
    return '$count 张专辑';
  }

  @override
  String countPlays(String count) {
    return '$count 次';
  }

  @override
  String countComments(String count) {
    return '$count 条评论';
  }

  @override
  String durationHours(int count) {
    return '$count 小时';
  }

  @override
  String durationMinutes(int count) {
    return '$count 分钟';
  }

  @override
  String albumTracksDuration(int tracks, int minutes) {
    return '$tracks 首 · $minutes 分钟';
  }

  @override
  String get albumNotFound => '找不到这张专辑';

  @override
  String get albumKindAlbum => '专辑';

  @override
  String get albumKindSingle => '单曲';

  @override
  String get albumKindCompilation => '合集';

  @override
  String get albumTracksTitle => '曲目';

  @override
  String albumReleasedIn(int year) {
    return '发行于 $year 年';
  }

  @override
  String albumReleasedOn(String date) {
    return '发行于 $date';
  }

  @override
  String artistFollowed(String name) {
    return '已关注 $name';
  }

  @override
  String get artistUnfollowed => '已取消关注';

  @override
  String get artistFollowFailed => '没能关注，稍后再试';

  @override
  String get artistUnfollowFailed => '没能取消关注，稍后再试';

  @override
  String get artistSimilar => '相似艺人';

  @override
  String artistHotTracksOf(String name) {
    return '$name 的热门歌曲';
  }

  @override
  String get artistLatestRelease => '最新发布';

  @override
  String get artistHotTracks => '热门歌曲';

  @override
  String get artistSinglesAndEps => '单曲与 EP';

  @override
  String get playlistSearchPlaceholder => '在歌单内搜索';

  @override
  String get playlistColTitle => '标题';

  @override
  String get playlistColAlbum => '专辑';

  @override
  String get playlistColAdded => '加入时间';

  @override
  String get playlistEmpty => '歌单里还没有歌';

  @override
  String playlistNoMatch(String query) {
    return '没有找到「$query」';
  }

  @override
  String playlistTagCount(String tag, int count) {
    return '「$tag」有 $count 首';
  }

  @override
  String get searchPlaceholder => '搜索歌曲、专辑、歌手和歌单';

  @override
  String get searchUnsupported => '这个插件不支持搜索。';

  @override
  String get searchRecent => '最近搜索';

  @override
  String get searchRecentResults => '最近搜索结果';

  @override
  String get searchHot => '热门搜索';

  @override
  String get searchRemoveHistory => '从记录里删掉';

  @override
  String searchNoResults(String query) {
    return '没有找到「$query」';
  }

  @override
  String searchViewAllSongs(int count) {
    return '查看全部 $count 首歌';
  }

  @override
  String searchViewAllAlbums(int count) {
    return '查看全部 $count 张专辑';
  }

  @override
  String searchAllCount(int count) {
    return '全部 $count';
  }

  @override
  String searchQueueName(String query) {
    return '搜索「$query」';
  }

  @override
  String searchMcpQueueName(String query) {
    return '搜索：$query';
  }

  @override
  String get commentSortHot => '热门';

  @override
  String get commentSortLatest => '最新';

  @override
  String get commentWrite => '写评论';

  @override
  String get commentEmpty => '还没有评论';

  @override
  String get commentLoadFailed => '评论加载失败';

  @override
  String get commentLikeFailed => '点赞失败';

  @override
  String get commentAnonymous => '匿名';

  @override
  String get commentReply => '回复';

  @override
  String get commentPosted => '评论已发布';

  @override
  String get commentReplyPosted => '回复已发布';

  @override
  String get commentPostFailed => '发布失败';

  @override
  String get commentWriteTo => '写给';

  @override
  String get commentPosting => '正在发布…';

  @override
  String get commentPost => '发布';

  @override
  String get commentPlaceholder => '写点什么…';

  @override
  String commentReplyPlaceholder(String name) {
    return '回复 $name…';
  }

  @override
  String get profileLocalUnsupported => '本地音乐没有个人主页。';

  @override
  String profileSourceUnsupported(String name) {
    return '「$name」没有个人主页。';
  }

  @override
  String profileSignInHint(String name) {
    return '登录「$name」后可以看到你的个人主页。';
  }

  @override
  String get profileTopArtists => '最常听的艺人';

  @override
  String get profileMostPlayed => '最常听';

  @override
  String get profileMyPlaylists => '我创建的歌单';

  @override
  String signOutConfirmTitle(String name) {
    return '退出「$name」？';
  }

  @override
  String get signOutConfirmMessage => '退出后这个源的音乐库、歌单和推荐都看不到了，\n重新登录就能回来。';

  @override
  String signInDialogTitle(String name) {
    return '登录$name';
  }

  @override
  String get signInQrFailed => '二维码生成失败';

  @override
  String get remoteNeedSignIn => '需要先登录';

  @override
  String remoteErrorKind(String kind) {
    return '出错了（$kind）';
  }

  @override
  String remotePluginMissing(String id) {
    return '插件 $id 没有加载。可以在设置里重新加载插件。';
  }

  @override
  String get remoteSwitchToLocalHint => '可以在设置里换回本地音乐';

  @override
  String get remoteNoDiscover => '这个插件没有发现页，可以用搜索找歌。';

  @override
  String get remoteNoHome => '这个插件没有首页，可以用搜索找歌。';

  @override
  String get remoteNoContent => '这里暂时没有内容。';

  @override
  String get remotePlayAlbumFailed => '没能播放这张专辑，稍后再试';

  @override
  String get greetingLateNight => '夜深了';

  @override
  String get greetingMorning => '早上好';

  @override
  String get greetingNoon => '中午好';

  @override
  String get greetingAfternoon => '下午好';

  @override
  String get greetingEvening => '晚上好';

  @override
  String get localRecentlyAdded => '最近添加';

  @override
  String get localEmptyHint => '还没有歌曲，去设置里添加音乐文件夹';

  @override
  String get localArtistNotFound => '找不到这位艺人';

  @override
  String get localFileMovedOrDeleted => '文件已被移动或删除';

  @override
  String get timeJustNow => '刚刚';

  @override
  String timeMinutesAgo(int count) {
    return '$count 分钟前';
  }

  @override
  String timeHoursAgo(int count) {
    return '$count 小时前';
  }

  @override
  String timeDaysAgo(int count) {
    return '$count 天前';
  }

  @override
  String timeMonthsAgo(int count) {
    return '$count 个月前';
  }

  @override
  String timeYearsAgo(int count) {
    return '$count 年前';
  }

  @override
  String get timeToday => '今天';

  @override
  String get timeYesterday => '昨天';

  @override
  String dateYear(int year) {
    return '$year 年';
  }

  @override
  String dateYearMonth(int year, int month) {
    return '$year 年 $month 月';
  }

  @override
  String dateMonthDay(int month, int day) {
    return '$month 月 $day 日';
  }

  @override
  String dateYearMonthDay(int year, int month, int day) {
    return '$year 年 $month 月 $day 日';
  }

  @override
  String toastSignedInAs(String name) {
    return '已登录：$name';
  }

  @override
  String get toastNotSignedIn => '没有登录';

  @override
  String get toastSignOutFailed => '退出失败';

  @override
  String get toastPlayAlbumFailed => '放不了这张专辑';

  @override
  String get toastPlayPlaylistFailed => '放不了这个歌单';

  @override
  String toastPlaybackError(String error) {
    return '播放出错：$error';
  }

  @override
  String toastCannotPlayTrack(String title) {
    return '无法播放「$title」';
  }

  @override
  String toastStationEmpty(String name) {
    return '$name 暂时没有歌';
  }

  @override
  String toastStationOpenFailed(String name) {
    return '$name 打不开';
  }

  @override
  String toastAddedToPlaylist(String name) {
    return '已添加到「$name」';
  }

  @override
  String toastAddToPlaylistFailed(String name) {
    return '没能添加到「$name」';
  }

  @override
  String toastPlaylistCreated(String name) {
    return '已新建歌单「$name」';
  }

  @override
  String get toastCreatePlaylistFailed => '没能新建歌单';

  @override
  String get toastRemovedFromPlaylist => '已从歌单中删除';

  @override
  String get toastRemoveFromPlaylistFailed => '没能从歌单中删除';

  @override
  String get toastNoSimilarFound => '没找到相似的歌';

  @override
  String toastSimilarQueueName(String title) {
    return '「$title」的相似歌曲';
  }

  @override
  String get toastFindSimilarFailed => '没能找到相似的歌';

  @override
  String toastActionFailed(String title) {
    return '「$title」没有成功';
  }

  @override
  String get toastDisliked => '以后少推荐这样的歌';

  @override
  String toastDislikeFailed(String name) {
    return '没能告诉$name';
  }

  @override
  String get toastLikeFailed => '没能喜欢这首歌';

  @override
  String get toastUnlikeFailed => '没能取消喜欢';

  @override
  String get toastSaveAlbumFailed => '没能收藏这张专辑';

  @override
  String get toastUnsaveAlbumFailed => '没能取消收藏';

  @override
  String toastAlbumSaved(String title) {
    return '已收藏「$title」';
  }

  @override
  String get toastAlbumUnsaved => '已取消收藏';

  @override
  String pluginErrIdTaken(String id) {
    return 'id $id 已被占用';
  }

  @override
  String pluginErrMinAppVersion(String required, String current) {
    return '需要 YesPlayMusic $required 或更新的版本，当前是 $current';
  }

  @override
  String get pluginErrEmptyLink => '请填写链接';

  @override
  String get pluginErrInvalidLink => '看不懂这个链接';

  @override
  String pluginErrDownloadNetwork(String error) {
    return '下载失败，请检查网络：$error';
  }

  @override
  String pluginErrRepoNotFound(String slug) {
    return '找不到 GitHub 仓库 $slug';
  }

  @override
  String pluginErrNoManifestInPath(String path) {
    return '$path 里没有 plugin.json';
  }

  @override
  String get pluginErrNoManifestInLink => '这个链接里没有找到 plugin.json';

  @override
  String pluginErrMissingEntry(String file) {
    return '插件缺少入口文件 $file';
  }

  @override
  String pluginErrNotFoundUrl(String url) {
    return '找不到 $url';
  }

  @override
  String get pluginErrGithubRateLimit => 'GitHub 暂时拒绝了请求（可能是访问太频繁），请稍后再试';

  @override
  String pluginErrDownloadHttp(int code) {
    return '下载失败：HTTP $code';
  }

  @override
  String get pluginErrTooLarge => '插件太大了（超过 50 MB）';

  @override
  String get pluginErrInvalidZip => '下载的文件不是有效的 .zip';

  @override
  String pluginErrManifestJson(String error) {
    return 'plugin.json 不是合法 JSON：$error';
  }

  @override
  String get pluginErrManifestObject => 'plugin.json 应该是一个对象';

  @override
  String pluginErrManifestIdChars(String id) {
    return 'id \"$id\" 只能用小写字母、数字和 . _ -';
  }

  @override
  String get pluginErrManifestIdLocal => 'id \"local\" 是保留的';

  @override
  String get pluginErrManifestNoName => '缺少 name';

  @override
  String pluginErrManifestMain(String file) {
    return 'main \"$file\" 应该是插件目录里的 .js 文件';
  }

  @override
  String pluginErrManifestIcon(String file) {
    return 'icon \"$file\" 应该是插件目录里的 png、jpg 或 webp 文件';
  }

  @override
  String pluginErrStopped(String name) {
    return '$name 已停止';
  }

  @override
  String pluginErrNoManifestDir(String dir) {
    return '$dir：没有 plugin.json';
  }

  @override
  String pluginErrMinVersionSimple(String name, String version) {
    return '$name 需要 YesPlayMusic $version 或更新的版本';
  }

  @override
  String pluginErrProcessExited(String name) {
    return '$name：插件进程意外退出';
  }

  @override
  String pluginErrNotObject(String name, String op) {
    return '$name.$op 返回的不是对象';
  }

  @override
  String pluginErrNotArray(String name, String op) {
    return '$name.$op 返回的不是数组';
  }

  @override
  String pluginErrInvalidStreamUrl(String name) {
    return '$name 给的播放地址无效';
  }

  @override
  String pluginErrDuplicateId(String id) {
    return '和其他插件的 id 重复：$id';
  }

  @override
  String pluginErrTimeoutDisabled(int seconds) {
    return '插件运行超过 $seconds 秒没有返回，已停用';
  }

  @override
  String get pluginErrOomDisabled => '插件内存用尽，已停用';

  @override
  String get pluginErrLoadTimeout => '加载超时';

  @override
  String pluginErrOpTimeout(String op, int seconds) {
    return '$op 超时（$seconds 秒）';
  }

  @override
  String get pluginErrClosed => '插件已关闭';

  @override
  String sourceErrUnsupported(String name, String op) {
    return '$name 不支持 $op';
  }

  @override
  String sourceErrNotFound(String source) {
    return '找不到源 $source';
  }
}

/// The translations for Chinese, using the Han script (`zh_Hant`).
class AppLocalizationsZhHant extends AppLocalizationsZh {
  AppLocalizationsZhHant() : super('zh_Hant');

  @override
  String get navHome => '首頁';

  @override
  String get navDiscover => '探索';

  @override
  String get navLibrary => '音樂庫';

  @override
  String get navSearch => '搜尋';

  @override
  String get navSearchPage => '搜尋頁';

  @override
  String get navSettings => '設定';

  @override
  String get navProfile => '個人主頁';

  @override
  String get actionPlay => '播放';

  @override
  String get actionPause => '暫停';

  @override
  String get actionPlayAll => '播放全部';

  @override
  String get actionShuffle => '隨機播放';

  @override
  String get actionNext => '下一首';

  @override
  String get actionPrev => '上一首';

  @override
  String get actionLike => '喜歡';

  @override
  String get actionUnlike => '取消喜歡';

  @override
  String get actionSaveAlbum => '收藏專輯';

  @override
  String get actionUnsave => '取消收藏';

  @override
  String get actionFollow => '追蹤';

  @override
  String get actionFollowing => '已追蹤';

  @override
  String get actionMore => '更多';

  @override
  String get actionBack => '返回';

  @override
  String get actionClose => '關閉';

  @override
  String get actionCancel => '取消';

  @override
  String get actionConfirm => '確定';

  @override
  String get actionClear => '清除';

  @override
  String get actionClearShort => '清空';

  @override
  String get actionRetry => '重試';

  @override
  String get actionOpen => '開啟';

  @override
  String get actionSave => '儲存';

  @override
  String get actionSaving => '儲存中…';

  @override
  String get actionDone => '完成';

  @override
  String get actionApply => '套用';

  @override
  String get actionCopy => '複製';

  @override
  String get actionReset => '重設';

  @override
  String get actionAdd => '新增';

  @override
  String get actionSelect => '選擇';

  @override
  String get actionAll => '全部';

  @override
  String get actionCollapse => '收合';

  @override
  String get actionExpandAllCategories => '全部分類';

  @override
  String get actionPrevPage => '上一頁';

  @override
  String get actionNextPage => '下一頁';

  @override
  String get actionViewFullText => '檢視全文';

  @override
  String get actionShow => '顯示';

  @override
  String get actionHide => '隱藏';

  @override
  String get actionReload => '重新載入';

  @override
  String get actionInstall => '安裝';

  @override
  String get actionUpdate => '更新';

  @override
  String get actionUninstall => '解除安裝';

  @override
  String get actionEnable => '啟用';

  @override
  String get actionSignIn => '登入';

  @override
  String get actionSignOut => '登出';

  @override
  String get actionManageSources => '管理音樂來源';

  @override
  String get actionManagePlugins => '管理外掛';

  @override
  String get actionGoSearch => '前往搜尋';

  @override
  String get actionLoadMore => '載入更多';

  @override
  String get stateLoading => '正在載入…';

  @override
  String get stateLoadingShort => '載入中…';

  @override
  String get stateLoadFailed => '載入失敗';

  @override
  String get stateCouldNotLoad => '無法載入';

  @override
  String get stateSigningIn => '正在登入…';

  @override
  String get stateSigningInShort => '登入中…';

  @override
  String get stateSignedIn => '已登入';

  @override
  String get stateNotSignedIn => '未登入';

  @override
  String get stateNone => '無';

  @override
  String get statePleaseSelect => '請選擇';

  @override
  String get stateCopied => '已複製';

  @override
  String get stateSaved => '已儲存';

  @override
  String stateSaveFailed(String error) {
    return '儲存失敗：$error';
  }

  @override
  String get miniShuffleOn => '隨機播放：開';

  @override
  String get miniRepeatOn => '重複播放全部';

  @override
  String get miniRepeatOff => '不重複播放';

  @override
  String get miniQueue => '播放佇列';

  @override
  String get miniOpenNowPlaying => '開啟正在播放';

  @override
  String get miniMute => '靜音';

  @override
  String get npTitle => '正在播放';

  @override
  String get npComments => '評論';

  @override
  String get npSimilar => '相似歌曲';

  @override
  String npSimilarTo(String title) {
    return '與 $title 相似';
  }

  @override
  String get npNoSimilar => '找不到相似的歌曲';

  @override
  String get npUpNext => '接下來';

  @override
  String get npQueueEmpty => '佇列中沒有更多歌曲了';

  @override
  String get npFromPrefix => '來自 ';

  @override
  String get npViewAlbum => '檢視專輯';

  @override
  String get npViewArtist => '檢視藝人';

  @override
  String get menuPlayNext => '下一首播放';

  @override
  String get menuAddedNext => '將在下一首播放';

  @override
  String get menuAddToQueue => '加入播放佇列';

  @override
  String get menuAddedToQueue => '已加入播放佇列';

  @override
  String get menuAddToPlaylist => '加入歌單';

  @override
  String get menuCreatePlaylist => '建立歌單';

  @override
  String get menuPlaylistNamePlaceholder => '歌單名稱';

  @override
  String get menuCreateAndAdd => '建立並加入';

  @override
  String get menuPlaySimilar => '播放相似歌曲';

  @override
  String get menuDislike => '不喜歡';

  @override
  String get menuRemoveFromPlaylist => '從歌單中移除';

  @override
  String get shortcutGroupPlayback => '播放';

  @override
  String get shortcutGroupUi => '介面';

  @override
  String get shortcutGroupMediaKeys => '媒體鍵';

  @override
  String get shortcutPlayPause => '播放 / 暫停';

  @override
  String get shortcutSpaceKey => '空白鍵';

  @override
  String get shortcutSeekForward => '快轉 5 秒';

  @override
  String get shortcutSeekBackward => '倒轉 5 秒';

  @override
  String get shortcutVolumeUp => '提高音量';

  @override
  String get shortcutVolumeDown => '降低音量';

  @override
  String get shortcutMute => '靜音';

  @override
  String get shortcutRepeat => '重複播放模式';

  @override
  String get shortcutLikeCurrent => '喜歡目前歌曲';

  @override
  String get shortcutDismissOverlay => '收合正在播放，關閉彈窗';

  @override
  String get shortcutBack => '上一頁';

  @override
  String get shortcutForward => '下一頁';

  @override
  String get shortcutSwitchTab => '切換側邊欄頁面';

  @override
  String get shortcutKeyRangeTo => '至';

  @override
  String get shortcutMediaKeysLabel => '鍵盤媒體鍵與耳機按鍵';

  @override
  String get shortcutTypingHintMac => '正在輸入文字時，僅 ⌘F 與 Esc 生效';

  @override
  String get shortcutTypingHintOther => '正在輸入文字時，僅 Ctrl+F 與 Esc 生效';

  @override
  String get menuBarSettings => '設定…';

  @override
  String get menuBarView => '顯示';

  @override
  String get menuBarWindow => '視窗';

  @override
  String get swatchLilac => '丁香紫';

  @override
  String get swatchSky => '天藍';

  @override
  String get swatchMint => '薄荷';

  @override
  String get swatchSun => '日光';

  @override
  String get swatchRose => '玫瑰';

  @override
  String get swatchFlame => '橙焰';

  @override
  String get settingsGeneral => '一般';

  @override
  String get settingsShortcuts => '快速鍵';

  @override
  String get settingsPlugins => '外掛';

  @override
  String get settingsAbout => '關於';

  @override
  String get settingsAppearance => '外觀';

  @override
  String get settingsLyrics => '歌詞';

  @override
  String get settingsPlayback => '播放';

  @override
  String get settingsStorage => '儲存空間';

  @override
  String get settingsAccentColor => '主題色';

  @override
  String get settingsLanguage => '語言';

  @override
  String get langSystem => '跟隨系統';

  @override
  String get settingsMiniLyric => '迷你播放器一律顯示歌詞';

  @override
  String get settingsKeepRunning => '關閉視窗後繼續在背景執行';

  @override
  String get trayShowWindow => '顯示視窗';

  @override
  String get trayQuit => '結束';

  @override
  String aboutDownloadVersion(String version) {
    return '下載 $version';
  }

  @override
  String get aboutChecking => '正在檢查…';

  @override
  String get aboutCheckUpdate => '檢查更新';

  @override
  String get aboutAutoCheck => '自動檢查更新';

  @override
  String get aboutAnalytics => '傳送匿名使用統計';

  @override
  String get aboutSourceAndFeedback => '原始碼與問題回報';

  @override
  String aboutVersion(String version) {
    return '版本 $version';
  }

  @override
  String get aboutLogs => '記錄檔';

  @override
  String get aboutLogsHint => '回報問題時附上';

  @override
  String get aboutOpenFolder => '開啟資料夾';

  @override
  String get aboutOpen => '開啟';

  @override
  String updaterNewVersion(String version) {
    return '發現新版本 $version';
  }

  @override
  String get updaterUpToDate => '已是最新版本';

  @override
  String get updaterCheckFailed => '檢查更新失敗';

  @override
  String storageClearTitle(String size) {
    return '清除 $size 快取？';
  }

  @override
  String get storageClearMessage => 'API、音訊與圖片快取都會清除，\n之後用到時會重新取得。';

  @override
  String storageCleared(String size) {
    return '已清除 $size 快取';
  }

  @override
  String storageLimit(String size) {
    return '/ $size 快取上限';
  }

  @override
  String storageApi(String size) {
    return 'API $size';
  }

  @override
  String storageAudio(String size) {
    return '音訊 $size';
  }

  @override
  String storageImage(String size) {
    return '圖片 $size';
  }

  @override
  String get storageClearing => '正在清除…';

  @override
  String get storageClearCache => '清除快取';

  @override
  String get sourceMusicSource => '音樂來源';

  @override
  String get sourceLocal => '本機音樂';

  @override
  String get sourceLocalDesc => '播放電腦上的音樂檔案';

  @override
  String get sourceBuiltIn => '內建';

  @override
  String get sourceInUse => '使用中';

  @override
  String get sourceScanning => '正在掃描…';

  @override
  String get sourceNoFolders => '未新增資料夾';

  @override
  String sourceFolderAlbums(int folders, int albums) {
    return '$folders 個資料夾，$albums 張專輯';
  }

  @override
  String get sourceAddFolderEllipsis => '新增音樂資料夾…';

  @override
  String get sourceAddFolder => '新增資料夾';

  @override
  String get sourceAddMusicFolder => '新增音樂資料夾';

  @override
  String get sourceRescan => '重新掃描';

  @override
  String get sourceMusicFolders => '音樂資料夾';

  @override
  String get sourceNoFoldersAdded => '尚未新增音樂資料夾';

  @override
  String get sourceOpenInFileManager => '在檔案管理員中開啟';

  @override
  String get sourceShowInFileManager => '在檔案管理員中顯示';

  @override
  String get sourceStopScanningFolder => '不再掃描此資料夾';

  @override
  String sourceSwitchedTo(String name) {
    return '已切換至「$name」';
  }

  @override
  String get sourceFolderAlreadyScanned => '此資料夾已在掃描範圍內';

  @override
  String get sourceNoMusicFound => '找不到音樂';

  @override
  String sourceScanningCount(int count) {
    final intl.NumberFormat countNumberFormat =
        intl.NumberFormat.decimalPattern(localeName);
    final String countString = countNumberFormat.format(count);

    return '正在掃描… 已讀取 $countString 首';
  }

  @override
  String sourceFoldersUnreadable(int count) {
    final intl.NumberFormat countNumberFormat =
        intl.NumberFormat.decimalPattern(localeName);
    final String countString = countNumberFormat.format(count);

    return '有 $countString 個資料夾無法讀取，已略過';
  }

  @override
  String get sourceFolderUnreadable => '無法讀取，已略過';

  @override
  String get sourceCancelScan => '取消掃描';

  @override
  String get sourceNotFound => '找不到此音樂來源';

  @override
  String pluginsLoadedToast(int count) {
    return '已載入 $count 個外掛';
  }

  @override
  String get pluginFind => '尋找外掛';

  @override
  String get pluginInstallTitle => '安裝外掛';

  @override
  String get pluginTabInstalled => '已安裝';

  @override
  String get pluginTabOfficial => '官方外掛';

  @override
  String get pluginOpenDir => '開啟外掛目錄';

  @override
  String get pluginThirdPartyHint => '官方之外的外掛由各自作者維護';

  @override
  String get pluginDevDocs => '外掛開發文件 ›';

  @override
  String get pluginComingSoon => '即將推出';

  @override
  String get pluginInstallFromLink => '從連結安裝';

  @override
  String get pluginInstallFromLinkHint => 'GitHub 儲存庫、Release 或 .zip';

  @override
  String pluginUninstallTitle(String name) {
    return '解除安裝「$name」？';
  }

  @override
  String get pluginUninstallMessage => '外掛的設定與登入狀態將一併刪除';

  @override
  String pluginUninstalled(String name) {
    return '已解除安裝「$name」';
  }

  @override
  String pluginUpdateAvailable(String version) {
    return '可更新至 $version';
  }

  @override
  String pluginNeedSetting(String field) {
    return '需要填寫$field';
  }

  @override
  String pluginSignedInAs(String name) {
    return '已登入 $name';
  }

  @override
  String pluginDisabledToast(String name) {
    return '已停用「$name」';
  }

  @override
  String pluginEnabledToast(String name) {
    return '已啟用「$name」';
  }

  @override
  String get pluginHasUpdate => '有更新';

  @override
  String get pluginSignInAccount => '登入帳號';

  @override
  String get pluginSettingsEllipsis => '外掛設定…';

  @override
  String get pluginDisable => '停用外掛';

  @override
  String get pluginReload => '重新載入外掛';

  @override
  String get pluginUninstallEllipsis => '解除安裝外掛…';

  @override
  String get pluginDeleteEllipsis => '刪除外掛…';

  @override
  String get pluginDisabledBadge => '已停用';

  @override
  String get pluginNotLoadedBadge => '未載入';

  @override
  String get pluginNotLoadedStatus => '外掛尚未載入';

  @override
  String get pluginEmptyTitle => '尚未安裝外掛';

  @override
  String get pluginEmptyHint => '支援 GitHub 連結';

  @override
  String get pluginSettingsTitle => '外掛設定';

  @override
  String get pluginSectionAccount => '帳號';

  @override
  String get pluginSectionCapabilities => '能力';

  @override
  String get pluginSectionPermissions => '權限';

  @override
  String get pluginDisabledHint => '外掛已停用，啟用後生效';

  @override
  String get pluginUninstallBtn => '解除安裝外掛';

  @override
  String get pluginSignInSyncHint => '登入後同步收藏與歌單';

  @override
  String get pluginGetIt => '前往取得 ›';

  @override
  String pluginUpdatedToast(String name) {
    return '已更新「$name」';
  }

  @override
  String pluginInstalledToast(String name) {
    return '已安裝「$name」';
  }

  @override
  String pluginInstallFailed(String error) {
    return '安裝失敗：$error';
  }

  @override
  String get pluginInstallPrompt => '貼上 GitHub 儲存庫網址，\n或外掛的下載連結';

  @override
  String get pluginInstallPlaceholder => 'github.com/作者/儲存庫';

  @override
  String get pluginInstallSupportHint =>
      '支援 GitHub 儲存庫、Release，以及 plugin.json 與 .zip 連結';

  @override
  String get pluginReading => '讀取中…';

  @override
  String get pluginNextStep => '下一步';

  @override
  String get pluginInstallFromLocal => '從本機資料夾安裝…';

  @override
  String pluginPublishedAgo(String ago) {
    return '，$ago發佈';
  }

  @override
  String get pluginLocalFolder => '本機資料夾';

  @override
  String get pluginLatestCode => '最新程式碼';

  @override
  String pluginInstalledVersion(String version) {
    return '已安裝 $version';
  }

  @override
  String get pluginPermissionsNeeded => '需要以下權限';

  @override
  String get pluginPermNoNetwork => '不存取網路';

  @override
  String get pluginPermNoNetworkDetail => '不連線至任何網站';

  @override
  String get pluginPermAnyWebsite => '存取任意網站';

  @override
  String get pluginPermAnyWebsiteDetail => '可連線至任意網站';

  @override
  String get pluginPermAnyWebsiteFull => '可以存取任意網站';

  @override
  String get pluginPermNetwork => '存取網路';

  @override
  String get pluginPermSignInDetail => '開啟登入頁，讀取登入後的 Cookie';

  @override
  String get pluginPermProcess => '執行本機程式';

  @override
  String get pluginPermProcessBadge => '需要單獨允許';

  @override
  String pluginPermProcessDetail(String programs) {
    return '$programs，預設關閉，可在外掛設定中開啟';
  }

  @override
  String get pluginPermStorage => '儲存資料';

  @override
  String get pluginPermStorageDetail => '儲存設定、登入狀態與快取';

  @override
  String get pluginCapabilitiesProvided => '提供以下能力';

  @override
  String get pluginNavIconHint => '帶圖示的項目會加入側邊欄';

  @override
  String get pluginTrustHint => '請僅安裝可信任來源的外掛';

  @override
  String get pluginInstalling => '安裝中…';

  @override
  String get pluginYourServer => '您填寫的伺服器';

  @override
  String pluginCanAccessHosts(String hosts) {
    return '可存取 $hosts';
  }

  @override
  String pluginCanAccessHostsMore(String hosts, int count) {
    return '可存取 $hosts 等 $count 個';
  }

  @override
  String get pluginOnlyYourServer => '僅存取您在設定中填寫的伺服器';

  @override
  String pluginAndYourServer(String hosts) {
    return '$hosts，以及您在設定中填寫的伺服器';
  }

  @override
  String get pluginAnyProgram => '任意本機程式';

  @override
  String get officialJellyfinDesc => '連線至 Jellyfin 伺服器';

  @override
  String get officialPlexDesc => '連線至 Plex Media Server';

  @override
  String get officialSubsonicDesc => '連線至 Navidrome 等 Subsonic 伺服器';

  @override
  String get officialEmbyDesc => '連線至 Emby 伺服器';

  @override
  String get capSuggest => '搜尋建議';

  @override
  String get capLyrics => '歌詞';

  @override
  String get capPlaylist => '歌單';

  @override
  String get capEditPlaylist => '編輯歌單';

  @override
  String get capFavorites => '收藏';

  @override
  String get capAlbum => '專輯';

  @override
  String get capArtist => '藝人';

  @override
  String get capRadio => '電台';

  @override
  String get capSimilar => '相似推薦';

  @override
  String get capHistory => '播放紀錄';

  @override
  String get capDislike => '不感興趣';

  @override
  String get capTrackMenu => '歌曲選單';

  @override
  String get mcpPortRangeError => '連接埠需在 1024 ~ 65535 之間';

  @override
  String mcpPortUpdated(int port) {
    return '已更新連接埠為 $port';
  }

  @override
  String mcpCopiedLabel(String label) {
    return '已複製 $label';
  }

  @override
  String mcpRunning(String url) {
    return '執行中 · $url';
  }

  @override
  String get mcpStopped => '已停止';

  @override
  String get mcpEnableLocal => '啟用本機 MCP 服務';

  @override
  String get mcpEnableHint => '僅監聽 127.0.0.1，供外部 AI 用戶端控制播放與搜尋';

  @override
  String mcpSessions(int count) {
    return '$count 工作階段';
  }

  @override
  String get mcpListenPort => '監聽連接埠';

  @override
  String get mcpPortHint => '預設 18888（Streamable HTTP）';

  @override
  String get mcpLazyMode => 'MCP 延遲載入模式';

  @override
  String mcpLazyHintOn(int core, int lazy) {
    return '初始僅暴露 $core 個核心工具 + 按需探索 $lazy 個擴充工具';
  }

  @override
  String mcpLazyHintOff(int total) {
    return '完整暴露目前音樂來源支援的全部 $total 個工具';
  }

  @override
  String get mcpReadOnly => '唯讀安全模式';

  @override
  String get mcpReadOnlyHint => '封鎖刪改歌單、發評論、喜歡/不喜歡等寫入操作';

  @override
  String get mcpAuthSection => '安全驗證';

  @override
  String get mcpRequireToken => '要求 Bearer Token';

  @override
  String get mcpRequireTokenHint =>
      '開啟後用戶端請求標頭需攜帶 Authorization: Bearer <token>';

  @override
  String get mcpHttpConfigTitle => '用戶端設定（Streamable HTTP）';

  @override
  String get mcpHttpConfigDesc =>
      '適用於 Antigravity、Cursor、Claude 等支援 HTTP MCP 的用戶端：';

  @override
  String get mcpCopyHttpConfig => '複製 HTTP 設定';

  @override
  String get mcpHttpConfigLabel => 'Streamable HTTP 設定';

  @override
  String get mcpStdioConfigTitle => 'Stdio 橋接設定（支援自動喚醒）';

  @override
  String get mcpStdioConfigDesc => '適用於僅支援 stdio 的用戶端；請求到達時若應用程式未執行會自動在背景喚醒：';

  @override
  String get mcpCopyStdioConfig => '複製 Stdio 橋接設定';

  @override
  String get mcpStdioConfigLabel => 'Stdio 橋接設定';

  @override
  String mcpPortStartFailed(int port, String error) {
    return '連接埠 $port 啟動失敗：$error';
  }

  @override
  String get tabSongs => '歌曲';

  @override
  String get tabAlbums => '專輯';

  @override
  String get tabPlaylists => '歌單';

  @override
  String get tabArtists => '藝人';

  @override
  String get tabArtistSearch => '歌手';

  @override
  String get sortTitleAZ => '標題 A-Z';

  @override
  String get sortReleaseDate => '發行時間';

  @override
  String get sortDefault => '預設';

  @override
  String get sortAlbumAZ => '專輯 A-Z';

  @override
  String get libraryEmptyTitle => '音樂庫還是空的';

  @override
  String get libraryAddSource => '新增音樂來源';

  @override
  String get libraryNoAlbums => '還沒有專輯';

  @override
  String get libraryNoSongs => '還沒有歌曲';

  @override
  String get libraryNoPlaylists => '還沒有歌單';

  @override
  String get libraryNoArtists => '還沒有藝人';

  @override
  String get libraryEarlier => '更早';

  @override
  String get libraryCreatedByMe => '我建立的';

  @override
  String get libraryCollected => '收藏的';

  @override
  String countTracks(int count) {
    return '$count 首';
  }

  @override
  String countSongs(int count) {
    return '$count 首歌曲';
  }

  @override
  String countAlbums(int count) {
    return '$count 張專輯';
  }

  @override
  String countPlays(String count) {
    return '$count 次';
  }

  @override
  String countComments(String count) {
    return '$count 則評論';
  }

  @override
  String durationHours(int count) {
    return '$count 小時';
  }

  @override
  String durationMinutes(int count) {
    return '$count 分鐘';
  }

  @override
  String albumTracksDuration(int tracks, int minutes) {
    return '$tracks 首 · $minutes 分鐘';
  }

  @override
  String get albumNotFound => '找不到這張專輯';

  @override
  String get albumKindAlbum => '專輯';

  @override
  String get albumKindSingle => '單曲';

  @override
  String get albumKindCompilation => '精選輯';

  @override
  String get albumTracksTitle => '曲目';

  @override
  String albumReleasedIn(int year) {
    return '發行於 $year 年';
  }

  @override
  String albumReleasedOn(String date) {
    return '發行於 $date';
  }

  @override
  String artistFollowed(String name) {
    return '已追蹤 $name';
  }

  @override
  String get artistUnfollowed => '已取消追蹤';

  @override
  String get artistFollowFailed => '無法追蹤，請稍後再試';

  @override
  String get artistUnfollowFailed => '無法取消追蹤，請稍後再試';

  @override
  String get artistSimilar => '相似藝人';

  @override
  String artistHotTracksOf(String name) {
    return '$name 的熱門歌曲';
  }

  @override
  String get artistLatestRelease => '最新發行';

  @override
  String get artistHotTracks => '熱門歌曲';

  @override
  String get artistSinglesAndEps => '單曲與 EP';

  @override
  String get playlistSearchPlaceholder => '在歌單內搜尋';

  @override
  String get playlistColTitle => '標題';

  @override
  String get playlistColAlbum => '專輯';

  @override
  String get playlistColAdded => '加入時間';

  @override
  String get playlistEmpty => '歌單裡還沒有歌';

  @override
  String playlistNoMatch(String query) {
    return '找不到「$query」';
  }

  @override
  String playlistTagCount(String tag, int count) {
    return '「$tag」有 $count 首';
  }

  @override
  String get searchPlaceholder => '搜尋歌曲、專輯、歌手與歌單';

  @override
  String get searchUnsupported => '此外掛不支援搜尋。';

  @override
  String get searchRecent => '最近搜尋';

  @override
  String get searchRecentResults => '最近搜尋結果';

  @override
  String get searchHot => '熱門搜尋';

  @override
  String get searchRemoveHistory => '從紀錄中移除';

  @override
  String searchNoResults(String query) {
    return '找不到「$query」';
  }

  @override
  String searchViewAllSongs(int count) {
    return '檢視全部 $count 首歌';
  }

  @override
  String searchViewAllAlbums(int count) {
    return '檢視全部 $count 張專輯';
  }

  @override
  String searchAllCount(int count) {
    return '全部 $count';
  }

  @override
  String searchQueueName(String query) {
    return '搜尋「$query」';
  }

  @override
  String searchMcpQueueName(String query) {
    return '搜尋：$query';
  }

  @override
  String get commentSortHot => '熱門';

  @override
  String get commentSortLatest => '最新';

  @override
  String get commentWrite => '寫評論';

  @override
  String get commentEmpty => '還沒有評論';

  @override
  String get commentLoadFailed => '評論載入失敗';

  @override
  String get commentLikeFailed => '按讚失敗';

  @override
  String get commentAnonymous => '匿名';

  @override
  String get commentReply => '回覆';

  @override
  String get commentPosted => '評論已發佈';

  @override
  String get commentReplyPosted => '回覆已發佈';

  @override
  String get commentPostFailed => '發佈失敗';

  @override
  String get commentWriteTo => '寫給';

  @override
  String get commentPosting => '正在發佈…';

  @override
  String get commentPost => '發佈';

  @override
  String get commentPlaceholder => '寫點什麼…';

  @override
  String commentReplyPlaceholder(String name) {
    return '回覆 $name…';
  }

  @override
  String get profileLocalUnsupported => '本機音樂沒有個人主頁。';

  @override
  String profileSourceUnsupported(String name) {
    return '「$name」沒有個人主頁。';
  }

  @override
  String profileSignInHint(String name) {
    return '登入「$name」後即可檢視您的個人主頁。';
  }

  @override
  String get profileTopArtists => '最常聽的藝人';

  @override
  String get profileMostPlayed => '最常聽';

  @override
  String get profileMyPlaylists => '我建立的歌單';

  @override
  String signOutConfirmTitle(String name) {
    return '登出「$name」？';
  }

  @override
  String get signOutConfirmMessage => '登出後此來源的音樂庫、歌單與推薦將無法檢視，\n重新登入即可恢復。';

  @override
  String signInDialogTitle(String name) {
    return '登入 $name';
  }

  @override
  String get signInQrFailed => 'QR Code 產生失敗';

  @override
  String get remoteNeedSignIn => '需要先登入';

  @override
  String remoteErrorKind(String kind) {
    return '發生錯誤（$kind）';
  }

  @override
  String remotePluginMissing(String id) {
    return '外掛 $id 未載入，可在設定中重新載入外掛。';
  }

  @override
  String get remoteSwitchToLocalHint => '可在設定中切換回本機音樂';

  @override
  String get remoteNoDiscover => '此外掛沒有探索頁，可使用搜尋找歌。';

  @override
  String get remoteNoHome => '此外掛沒有首頁，可使用搜尋找歌。';

  @override
  String get remoteNoContent => '這裡暫時沒有內容。';

  @override
  String get remotePlayAlbumFailed => '無法播放此專輯，請稍後再試';

  @override
  String get greetingLateNight => '夜深了';

  @override
  String get greetingMorning => '早安';

  @override
  String get greetingNoon => '午安';

  @override
  String get greetingAfternoon => '下午好';

  @override
  String get greetingEvening => '晚安';

  @override
  String get localRecentlyAdded => '最近新增';

  @override
  String get localEmptyHint => '還沒有歌曲，前往設定新增音樂資料夾';

  @override
  String get localArtistNotFound => '找不到這位藝人';

  @override
  String get localFileMovedOrDeleted => '檔案已被移動或刪除';

  @override
  String get timeJustNow => '剛剛';

  @override
  String timeMinutesAgo(int count) {
    return '$count 分鐘前';
  }

  @override
  String timeHoursAgo(int count) {
    return '$count 小時前';
  }

  @override
  String timeDaysAgo(int count) {
    return '$count 天前';
  }

  @override
  String timeMonthsAgo(int count) {
    return '$count 個月前';
  }

  @override
  String timeYearsAgo(int count) {
    return '$count 年前';
  }

  @override
  String get timeToday => '今天';

  @override
  String get timeYesterday => '昨天';

  @override
  String dateYear(int year) {
    return '$year 年';
  }

  @override
  String dateYearMonth(int year, int month) {
    return '$year 年 $month 月';
  }

  @override
  String dateMonthDay(int month, int day) {
    return '$month 月 $day 日';
  }

  @override
  String dateYearMonthDay(int year, int month, int day) {
    return '$year 年 $month 月 $day 日';
  }

  @override
  String toastSignedInAs(String name) {
    return '已登入：$name';
  }

  @override
  String get toastNotSignedIn => '尚未登入';

  @override
  String get toastSignOutFailed => '登出失敗';

  @override
  String get toastPlayAlbumFailed => '無法播放此專輯';

  @override
  String get toastPlayPlaylistFailed => '無法播放此歌單';

  @override
  String toastPlaybackError(String error) {
    return '播放出錯：$error';
  }

  @override
  String toastCannotPlayTrack(String title) {
    return '無法播放「$title」';
  }

  @override
  String toastStationEmpty(String name) {
    return '$name 暫時沒有歌';
  }

  @override
  String toastStationOpenFailed(String name) {
    return '$name 無法開啟';
  }

  @override
  String toastAddedToPlaylist(String name) {
    return '已加入「$name」';
  }

  @override
  String toastAddToPlaylistFailed(String name) {
    return '無法加入「$name」';
  }

  @override
  String toastPlaylistCreated(String name) {
    return '已建立歌單「$name」';
  }

  @override
  String get toastCreatePlaylistFailed => '無法建立歌單';

  @override
  String get toastRemovedFromPlaylist => '已從歌單中移除';

  @override
  String get toastRemoveFromPlaylistFailed => '無法從歌單中移除';

  @override
  String get toastNoSimilarFound => '找不到相似的歌';

  @override
  String toastSimilarQueueName(String title) {
    return '「$title」的相似歌曲';
  }

  @override
  String get toastFindSimilarFailed => '無法找到相似的歌';

  @override
  String toastActionFailed(String title) {
    return '「$title」未能成功';
  }

  @override
  String get toastDisliked => '之後會減少推薦這類歌曲';

  @override
  String toastDislikeFailed(String name) {
    return '無法通知 $name';
  }

  @override
  String get toastLikeFailed => '無法喜歡這首歌';

  @override
  String get toastUnlikeFailed => '無法取消喜歡';

  @override
  String get toastSaveAlbumFailed => '無法收藏此專輯';

  @override
  String get toastUnsaveAlbumFailed => '無法取消收藏';

  @override
  String toastAlbumSaved(String title) {
    return '已收藏「$title」';
  }

  @override
  String get toastAlbumUnsaved => '已取消收藏';

  @override
  String pluginErrIdTaken(String id) {
    return 'id $id 已被佔用';
  }

  @override
  String pluginErrMinAppVersion(String required, String current) {
    return '需要 YesPlayMusic $required 或更新的版本，目前為 $current';
  }

  @override
  String get pluginErrEmptyLink => '請填寫連結';

  @override
  String get pluginErrInvalidLink => '無法識別此連結';

  @override
  String pluginErrDownloadNetwork(String error) {
    return '下載失敗，請檢查網路：$error';
  }

  @override
  String pluginErrRepoNotFound(String slug) {
    return '找不到 GitHub 儲存庫 $slug';
  }

  @override
  String pluginErrNoManifestInPath(String path) {
    return '$path 中沒有 plugin.json';
  }

  @override
  String get pluginErrNoManifestInLink => '此連結中找不到 plugin.json';

  @override
  String pluginErrMissingEntry(String file) {
    return '外掛缺少進入點檔案 $file';
  }

  @override
  String pluginErrNotFoundUrl(String url) {
    return '找不到 $url';
  }

  @override
  String get pluginErrGithubRateLimit => 'GitHub 暫時拒絕了請求（可能存取過於頻繁），請稍後再試';

  @override
  String pluginErrDownloadHttp(int code) {
    return '下載失敗：HTTP $code';
  }

  @override
  String get pluginErrTooLarge => '外掛檔案過大（超過 50 MB）';

  @override
  String get pluginErrInvalidZip => '下載的檔案不是有效的 .zip';

  @override
  String pluginErrManifestJson(String error) {
    return 'plugin.json 不是有效的 JSON：$error';
  }

  @override
  String get pluginErrManifestObject => 'plugin.json 必須是一個物件';

  @override
  String pluginErrManifestIdChars(String id) {
    return 'id \"$id\" 只能使用小寫字母、數字與 . _ -';
  }

  @override
  String get pluginErrManifestIdLocal => 'id \"local\" 為保留名稱';

  @override
  String get pluginErrManifestNoName => '缺少 name';

  @override
  String pluginErrManifestMain(String file) {
    return 'main \"$file\" 必須是外掛目錄中的 .js 檔案';
  }

  @override
  String pluginErrManifestIcon(String file) {
    return 'icon \"$file\" 必須是外掛目錄中的 png、jpg 或 webp 檔案';
  }

  @override
  String pluginErrStopped(String name) {
    return '$name 已停止';
  }

  @override
  String pluginErrNoManifestDir(String dir) {
    return '$dir：沒有 plugin.json';
  }

  @override
  String pluginErrMinVersionSimple(String name, String version) {
    return '$name 需要 YesPlayMusic $version 或更新的版本';
  }

  @override
  String pluginErrProcessExited(String name) {
    return '$name：外掛處理程序意外結束';
  }

  @override
  String pluginErrNotObject(String name, String op) {
    return '$name.$op 回傳的不是物件';
  }

  @override
  String pluginErrNotArray(String name, String op) {
    return '$name.$op 回傳的不是陣列';
  }

  @override
  String pluginErrInvalidStreamUrl(String name) {
    return '$name 提供的播放網址無效';
  }

  @override
  String pluginErrDuplicateId(String id) {
    return '與其他外掛的 id 重複：$id';
  }

  @override
  String pluginErrTimeoutDisabled(int seconds) {
    return '外掛執行超過 $seconds 秒未回應，已停用';
  }

  @override
  String get pluginErrOomDisabled => '外掛記憶體用盡，已停用';

  @override
  String get pluginErrLoadTimeout => '載入逾時';

  @override
  String pluginErrOpTimeout(String op, int seconds) {
    return '$op 逾時（$seconds 秒）';
  }

  @override
  String get pluginErrClosed => '外掛已關閉';

  @override
  String sourceErrUnsupported(String name, String op) {
    return '$name 不支援 $op';
  }

  @override
  String sourceErrNotFound(String source) {
    return '找不到來源 $source';
  }
}
