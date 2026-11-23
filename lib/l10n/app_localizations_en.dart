// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get navHome => 'Home';

  @override
  String get navDiscover => 'Explore';

  @override
  String get navLibrary => 'Library';

  @override
  String get navSearch => 'Search';

  @override
  String get navSearchPage => 'Search';

  @override
  String get navSettings => 'Settings';

  @override
  String get navProfile => 'Profile';

  @override
  String get actionPlay => 'Play';

  @override
  String get actionPause => 'Pause';

  @override
  String get actionPlayAll => 'Play All';

  @override
  String get actionShuffle => 'Shuffle';

  @override
  String get actionNext => 'Next';

  @override
  String get actionPrev => 'Previous';

  @override
  String get actionLike => 'Like';

  @override
  String get actionUnlike => 'Unlike';

  @override
  String get actionSaveAlbum => 'Save Album';

  @override
  String get actionUnsave => 'Remove from Library';

  @override
  String get actionFollow => 'Follow';

  @override
  String get actionFollowing => 'Following';

  @override
  String get actionMore => 'More';

  @override
  String get actionBack => 'Back';

  @override
  String get actionClose => 'Close';

  @override
  String get actionCancel => 'Cancel';

  @override
  String get actionConfirm => 'OK';

  @override
  String get actionClear => 'Clear';

  @override
  String get actionClearShort => 'Clear';

  @override
  String get actionRetry => 'Retry';

  @override
  String get actionOpen => 'Open';

  @override
  String get actionSave => 'Save';

  @override
  String get actionSaving => 'Saving…';

  @override
  String get actionDone => 'Done';

  @override
  String get actionApply => 'Apply';

  @override
  String get actionCopy => 'Copy';

  @override
  String get actionReset => 'Reset';

  @override
  String get actionAdd => 'Add';

  @override
  String get actionSelect => 'Select';

  @override
  String get actionAll => 'All';

  @override
  String get actionCollapse => 'Collapse';

  @override
  String get actionExpandAllCategories => 'All Categories';

  @override
  String get actionPrevPage => 'Previous Page';

  @override
  String get actionNextPage => 'Next Page';

  @override
  String get actionViewFullText => 'Read More';

  @override
  String get actionShow => 'Show';

  @override
  String get actionHide => 'Hide';

  @override
  String get actionReload => 'Reload';

  @override
  String get actionInstall => 'Install';

  @override
  String get actionUpdate => 'Update';

  @override
  String get actionUninstall => 'Uninstall';

  @override
  String get actionEnable => 'Enable';

  @override
  String get actionSignIn => 'Sign In';

  @override
  String get actionSignOut => 'Sign Out';

  @override
  String get actionManageSources => 'Manage Sources';

  @override
  String get actionManagePlugins => 'Manage Plugins';

  @override
  String get actionGoSearch => 'Go to Search';

  @override
  String get actionLoadMore => 'Load More';

  @override
  String get stateLoading => 'Loading…';

  @override
  String get stateLoadingShort => 'Loading…';

  @override
  String get stateLoadFailed => 'Failed to load';

  @override
  String get stateCouldNotLoad => 'Could not load';

  @override
  String get stateSigningIn => 'Signing in…';

  @override
  String get stateSigningInShort => 'Signing in…';

  @override
  String get stateSignedIn => 'Signed in';

  @override
  String get stateNotSignedIn => 'Not signed in';

  @override
  String get stateNone => 'None';

  @override
  String get statePleaseSelect => 'Select';

  @override
  String get stateCopied => 'Copied';

  @override
  String get stateSaved => 'Saved';

  @override
  String stateSaveFailed(String error) {
    return 'Failed to save: $error';
  }

  @override
  String get miniShuffleOn => 'Shuffle: On';

  @override
  String get miniRepeatOn => 'Repeat All';

  @override
  String get miniRepeatOff => 'Repeat Off';

  @override
  String get miniQueue => 'Queue';

  @override
  String get miniOpenNowPlaying => 'Open Now Playing';

  @override
  String get miniMute => 'Mute';

  @override
  String get npTitle => 'Now Playing';

  @override
  String get npComments => 'Comments';

  @override
  String get npSimilar => 'Similar';

  @override
  String npSimilarTo(String title) {
    return 'Similar to $title';
  }

  @override
  String get npNoSimilar => 'No similar tracks found';

  @override
  String get npUpNext => 'Up Next';

  @override
  String get npQueueEmpty => 'No more tracks in queue';

  @override
  String get npFromPrefix => 'From ';

  @override
  String get npViewAlbum => 'Go to Album';

  @override
  String get npViewArtist => 'Go to Artist';

  @override
  String get menuPlayNext => 'Play Next';

  @override
  String get menuAddedNext => 'Playing next';

  @override
  String get menuAddToQueue => 'Add to Queue';

  @override
  String get menuAddedToQueue => 'Added to queue';

  @override
  String get menuAddToPlaylist => 'Add to Playlist';

  @override
  String get menuCreatePlaylist => 'New Playlist';

  @override
  String get menuPlaylistNamePlaceholder => 'Playlist name';

  @override
  String get menuCreateAndAdd => 'Create & Add';

  @override
  String get menuPlaySimilar => 'Play Similar Tracks';

  @override
  String get menuDislike => 'Dislike';

  @override
  String get menuRemoveFromPlaylist => 'Remove from Playlist';

  @override
  String get shortcutGroupPlayback => 'Playback';

  @override
  String get shortcutGroupUi => 'Interface';

  @override
  String get shortcutGroupMediaKeys => 'Media Keys';

  @override
  String get shortcutPlayPause => 'Play / Pause';

  @override
  String get shortcutSpaceKey => 'Space';

  @override
  String get shortcutSeekForward => 'Seek Forward 5s';

  @override
  String get shortcutSeekBackward => 'Seek Backward 5s';

  @override
  String get shortcutVolumeUp => 'Volume Up';

  @override
  String get shortcutVolumeDown => 'Volume Down';

  @override
  String get shortcutMute => 'Mute';

  @override
  String get shortcutRepeat => 'Repeat Mode';

  @override
  String get shortcutLikeCurrent => 'Like Current Track';

  @override
  String get shortcutDismissOverlay => 'Close Now Playing / Dialog';

  @override
  String get shortcutBack => 'Back';

  @override
  String get shortcutForward => 'Forward';

  @override
  String get shortcutSwitchTab => 'Switch Sidebar Tab';

  @override
  String get shortcutKeyRangeTo => 'to';

  @override
  String get shortcutMediaKeysLabel =>
      'Keyboard media keys & headphone buttons';

  @override
  String get shortcutTypingHintMac =>
      'While typing, only ⌘F and Esc are active';

  @override
  String get shortcutTypingHintOther =>
      'While typing, only Ctrl+F and Esc are active';

  @override
  String get menuBarSettings => 'Settings…';

  @override
  String get menuBarView => 'View';

  @override
  String get menuBarWindow => 'Window';

  @override
  String get swatchLilac => 'Lilac';

  @override
  String get swatchSky => 'Sky';

  @override
  String get swatchMint => 'Mint';

  @override
  String get swatchSun => 'Sun';

  @override
  String get swatchRose => 'Rose';

  @override
  String get swatchFlame => 'Flame';

  @override
  String get settingsGeneral => 'General';

  @override
  String get settingsShortcuts => 'Shortcuts';

  @override
  String get settingsPlugins => 'Plugins';

  @override
  String get settingsAbout => 'About';

  @override
  String get settingsAppearance => 'Appearance';

  @override
  String get settingsLyrics => 'Lyrics';

  @override
  String get settingsPlayback => 'Playback';

  @override
  String get settingsStorage => 'Storage';

  @override
  String get settingsAccentColor => 'Accent Color';

  @override
  String get settingsLanguage => 'Language';

  @override
  String get langSystem => 'Follow System';

  @override
  String get settingsMiniLyric => 'Show current lyric in mini player';

  @override
  String get settingsMinimizeToTray => 'Minimize to tray when closing window';

  @override
  String aboutDownloadVersion(String version) {
    return 'Download $version';
  }

  @override
  String get aboutChecking => 'Checking…';

  @override
  String get aboutCheckUpdate => 'Check for Updates';

  @override
  String get aboutAutoCheck => 'Check for updates automatically';

  @override
  String get aboutAnalytics => 'Send anonymous usage statistics';

  @override
  String get aboutSourceAndFeedback => 'Source Code & Feedback';

  @override
  String aboutVersion(String version) {
    return 'Version $version';
  }

  @override
  String get aboutLogs => 'Log Files';

  @override
  String get aboutLogsHint => 'Attach when reporting a problem';

  @override
  String get aboutOpenFolder => 'Open Folder';

  @override
  String get aboutOpen => 'Open';

  @override
  String updaterNewVersion(String version) {
    return 'New version $version available';
  }

  @override
  String get updaterUpToDate => 'You are up to date';

  @override
  String get updaterCheckFailed => 'Failed to check for updates';

  @override
  String storageClearTitle(String size) {
    return 'Clear $size of cache?';
  }

  @override
  String get storageClearMessage =>
      'API, audio, and image caches will be cleared\nand fetched again when needed.';

  @override
  String storageCleared(String size) {
    return 'Cleared $size of cache';
  }

  @override
  String storageLimit(String size) {
    return '/ $size limit';
  }

  @override
  String storageApi(String size) {
    return 'API $size';
  }

  @override
  String storageAudio(String size) {
    return 'Audio $size';
  }

  @override
  String storageImage(String size) {
    return 'Images $size';
  }

  @override
  String get storageClearing => 'Clearing…';

  @override
  String get storageClearCache => 'Clear Cache';

  @override
  String get sourceMusicSource => 'Music Source';

  @override
  String get sourceLocal => 'Local Music';

  @override
  String get sourceLocalDesc => 'Play audio files stored on your computer';

  @override
  String get sourceBuiltIn => 'Built-in';

  @override
  String get sourceInUse => 'Active';

  @override
  String get sourceScanning => 'Scanning…';

  @override
  String get sourceNoFolders => 'No folders added';

  @override
  String sourceFolderAlbums(int folders, int albums) {
    return '$folders folders, $albums albums';
  }

  @override
  String get sourceAddFolderEllipsis => 'Add Music Folder…';

  @override
  String get sourceAddFolder => 'Add Folder';

  @override
  String get sourceAddMusicFolder => 'Add Music Folder';

  @override
  String get sourceRescan => 'Rescan';

  @override
  String get sourceMusicFolders => 'Music Folders';

  @override
  String get sourceNoFoldersAdded => 'No music folders added yet';

  @override
  String get sourceOpenInFileManager => 'Open in File Manager';

  @override
  String get sourceShowInFileManager => 'Show in File Manager';

  @override
  String get sourceStopScanningFolder => 'Stop scanning this folder';

  @override
  String sourceSwitchedTo(String name) {
    return 'Switched to \"$name\"';
  }

  @override
  String get sourceFolderAlreadyScanned =>
      'This folder is already being scanned';

  @override
  String get sourceNoMusicFound => 'No music found';

  @override
  String get sourceNotFound => 'Music source not found';

  @override
  String pluginsLoadedToast(int count) {
    return 'Loaded $count plugins';
  }

  @override
  String get pluginFind => 'Find Plugins';

  @override
  String get pluginInstallTitle => 'Install Plugin';

  @override
  String get pluginTabInstalled => 'Installed';

  @override
  String get pluginTabOfficial => 'Official';

  @override
  String get pluginOpenDir => 'Open Plugins Folder';

  @override
  String get pluginThirdPartyHint =>
      'Third-party plugins are maintained by their respective authors';

  @override
  String get pluginDevDocs => 'Plugin Documentation ›';

  @override
  String get pluginComingSoon => 'Coming soon';

  @override
  String get pluginInstallFromLink => 'Install from Link';

  @override
  String get pluginInstallFromLinkHint => 'GitHub repository, Release, or .zip';

  @override
  String pluginUninstallTitle(String name) {
    return 'Uninstall \"$name\"?';
  }

  @override
  String get pluginUninstallMessage =>
      'Plugin settings and sign-in data will be deleted';

  @override
  String pluginUninstalled(String name) {
    return 'Uninstalled \"$name\"';
  }

  @override
  String pluginUpdateAvailable(String version) {
    return 'Update available: $version';
  }

  @override
  String pluginNeedSetting(String field) {
    return 'Requires $field';
  }

  @override
  String pluginSignedInAs(String name) {
    return 'Signed in as $name';
  }

  @override
  String pluginDisabledToast(String name) {
    return 'Disabled \"$name\"';
  }

  @override
  String pluginEnabledToast(String name) {
    return 'Enabled \"$name\"';
  }

  @override
  String get pluginHasUpdate => 'Update';

  @override
  String get pluginSignInAccount => 'Sign In';

  @override
  String get pluginSettingsEllipsis => 'Plugin Settings…';

  @override
  String get pluginDisable => 'Disable Plugin';

  @override
  String get pluginReload => 'Reload Plugins';

  @override
  String get pluginUninstallEllipsis => 'Uninstall Plugin…';

  @override
  String get pluginDeleteEllipsis => 'Delete Plugin…';

  @override
  String get pluginDisabledBadge => 'Disabled';

  @override
  String get pluginNotLoadedBadge => 'Not Loaded';

  @override
  String get pluginNotLoadedStatus => 'Plugin failed to load';

  @override
  String get pluginEmptyTitle => 'No plugins installed';

  @override
  String get pluginEmptyHint => 'Install via GitHub link';

  @override
  String get pluginSettingsTitle => 'Plugin Settings';

  @override
  String get pluginSectionAccount => 'Account';

  @override
  String get pluginSectionCapabilities => 'Capabilities';

  @override
  String get pluginSectionPermissions => 'Permissions';

  @override
  String get pluginDisabledHint => 'Plugin is disabled. Enable to take effect';

  @override
  String get pluginUninstallBtn => 'Uninstall Plugin';

  @override
  String get pluginSignInSyncHint => 'Sign in to sync favorites and playlists';

  @override
  String get pluginGetIt => 'Get ›';

  @override
  String pluginUpdatedToast(String name) {
    return 'Updated \"$name\"';
  }

  @override
  String pluginInstalledToast(String name) {
    return 'Installed \"$name\"';
  }

  @override
  String pluginInstallFailed(String error) {
    return 'Installation failed: $error';
  }

  @override
  String get pluginInstallPrompt =>
      'Paste a GitHub repository URL\nor a plugin download link';

  @override
  String get pluginInstallPlaceholder => 'github.com/owner/repo';

  @override
  String get pluginInstallSupportHint =>
      'Supports GitHub repositories, Releases, plugin.json, and .zip links';

  @override
  String get pluginReading => 'Reading…';

  @override
  String get pluginNextStep => 'Next';

  @override
  String get pluginInstallFromLocal => 'Install from local folder…';

  @override
  String pluginPublishedAgo(String ago) {
    return ', published $ago';
  }

  @override
  String get pluginLocalFolder => 'Local folder';

  @override
  String get pluginLatestCode => 'Latest code';

  @override
  String pluginInstalledVersion(String version) {
    return 'Installed $version';
  }

  @override
  String get pluginPermissionsNeeded => 'Required Permissions';

  @override
  String get pluginPermNoNetwork => 'No network access';

  @override
  String get pluginPermNoNetworkDetail => 'Does not connect to any website';

  @override
  String get pluginPermAnyWebsite => 'Any website';

  @override
  String get pluginPermAnyWebsiteDetail => 'Can connect to any website';

  @override
  String get pluginPermAnyWebsiteFull => 'Can access any website';

  @override
  String get pluginPermNetwork => 'Network access';

  @override
  String get pluginPermSignInDetail =>
      'Opens a sign-in page and reads cookies after sign-in';

  @override
  String get pluginPermProcess => 'Run local programs';

  @override
  String get pluginPermProcessBadge => 'Requires permission';

  @override
  String pluginPermProcessDetail(String programs) {
    return '$programs. Off by default; can be enabled in plugin settings';
  }

  @override
  String get pluginPermStorage => 'Local storage';

  @override
  String get pluginPermStorageDetail =>
      'Stores settings, sign-in state, and cache';

  @override
  String get pluginCapabilitiesProvided => 'Capabilities';

  @override
  String get pluginNavIconHint => 'Items with icons are added to the sidebar';

  @override
  String get pluginTrustHint => 'Only install plugins from sources you trust';

  @override
  String get pluginInstalling => 'Installing…';

  @override
  String get pluginYourServer => 'your configured server';

  @override
  String pluginCanAccessHosts(String hosts) {
    return 'Accesses $hosts';
  }

  @override
  String pluginCanAccessHostsMore(String hosts, int count) {
    return 'Accesses $hosts and $count total';
  }

  @override
  String get pluginOnlyYourServer =>
      'Only accesses the server configured in settings';

  @override
  String pluginAndYourServer(String hosts) {
    return '$hosts, and the server configured in settings';
  }

  @override
  String get pluginAnyProgram => 'Any local program';

  @override
  String get officialJellyfinDesc => 'Connect to a Jellyfin server';

  @override
  String get officialPlexDesc => 'Connect to Plex Media Server';

  @override
  String get officialSubsonicDesc =>
      'Connect to Navidrome and other Subsonic servers';

  @override
  String get officialEmbyDesc => 'Connect to an Emby server';

  @override
  String get capSuggest => 'Suggestions';

  @override
  String get capLyrics => 'Lyrics';

  @override
  String get capPlaylist => 'Playlists';

  @override
  String get capEditPlaylist => 'Edit Playlists';

  @override
  String get capFavorites => 'Favorites';

  @override
  String get capAlbum => 'Albums';

  @override
  String get capArtist => 'Artists';

  @override
  String get capRadio => 'Radio';

  @override
  String get capSimilar => 'Similar';

  @override
  String get capHistory => 'History';

  @override
  String get capDislike => 'Dislike';

  @override
  String get capTrackMenu => 'Track Menu';

  @override
  String get mcpPortRangeError => 'Port must be between 1024 and 65535';

  @override
  String mcpPortUpdated(int port) {
    return 'Port updated to $port';
  }

  @override
  String mcpCopiedLabel(String label) {
    return 'Copied $label';
  }

  @override
  String mcpRunning(String url) {
    return 'Running · $url';
  }

  @override
  String get mcpStopped => 'Stopped';

  @override
  String get mcpEnableLocal => 'Enable Local MCP Server';

  @override
  String get mcpEnableHint =>
      'Listens only on 127.0.0.1 for external AI clients to control playback and search';

  @override
  String mcpSessions(int count) {
    return '$count sessions';
  }

  @override
  String get mcpListenPort => 'Port';

  @override
  String get mcpPortHint => 'Default 18888 (Streamable HTTP)';

  @override
  String get mcpLazyMode => 'MCP Lazy-Loading Mode';

  @override
  String mcpLazyHintOn(int core, int lazy) {
    return 'Initially exposes $core core tools + $lazy extended tools on demand';
  }

  @override
  String mcpLazyHintOff(int total) {
    return 'Exposes all $total tools supported by the current source';
  }

  @override
  String get mcpReadOnly => 'Read-Only Safe Mode';

  @override
  String get mcpReadOnlyHint =>
      'Blocks write actions such as editing playlists, commenting, and liking';

  @override
  String get mcpAuthSection => 'Authentication';

  @override
  String get mcpRequireToken => 'Require Bearer Token';

  @override
  String get mcpRequireTokenHint =>
      'Clients must send Authorization: Bearer <token> header';

  @override
  String get mcpHttpConfigTitle => 'Client Configuration (Streamable HTTP)';

  @override
  String get mcpHttpConfigDesc =>
      'For HTTP MCP clients such as Antigravity, Cursor, and Claude:';

  @override
  String get mcpCopyHttpConfig => 'Copy HTTP Config';

  @override
  String get mcpHttpConfigLabel => 'Streamable HTTP config';

  @override
  String get mcpStdioConfigTitle => 'Stdio Bridge Configuration (Auto-Wake)';

  @override
  String get mcpStdioConfigDesc =>
      'For stdio-only clients; automatically wakes the app in the background if not running:';

  @override
  String get mcpCopyStdioConfig => 'Copy Stdio Bridge Config';

  @override
  String get mcpStdioConfigLabel => 'Stdio bridge config';

  @override
  String mcpPortStartFailed(int port, String error) {
    return 'Failed to start on port $port: $error';
  }

  @override
  String get tabSongs => 'Songs';

  @override
  String get tabAlbums => 'Albums';

  @override
  String get tabPlaylists => 'Playlists';

  @override
  String get tabArtists => 'Artists';

  @override
  String get tabArtistSearch => 'Artists';

  @override
  String get sortTitleAZ => 'Title A-Z';

  @override
  String get sortReleaseDate => 'Release Date';

  @override
  String get sortDefault => 'Default';

  @override
  String get sortAlbumAZ => 'Album A-Z';

  @override
  String get libraryEmptyTitle => 'Your library is empty';

  @override
  String get libraryAddSource => 'Add Music Source';

  @override
  String get libraryNoAlbums => 'No albums yet';

  @override
  String get libraryNoSongs => 'No songs yet';

  @override
  String get libraryNoPlaylists => 'No playlists yet';

  @override
  String get libraryNoArtists => 'No artists yet';

  @override
  String get libraryEarlier => 'Earlier';

  @override
  String get libraryCreatedByMe => 'Created by Me';

  @override
  String get libraryCollected => 'Saved';

  @override
  String countTracks(int count) {
    return '$count tracks';
  }

  @override
  String countSongs(int count) {
    return '$count songs';
  }

  @override
  String countAlbums(int count) {
    return '$count albums';
  }

  @override
  String countPlays(String count) {
    return '$count plays';
  }

  @override
  String countComments(String count) {
    return '$count comments';
  }

  @override
  String durationHours(int count) {
    return '$count hr';
  }

  @override
  String durationMinutes(int count) {
    return '$count min';
  }

  @override
  String albumTracksDuration(int tracks, int minutes) {
    return '$tracks tracks · $minutes min';
  }

  @override
  String get albumNotFound => 'Album not found';

  @override
  String get albumKindAlbum => 'Album';

  @override
  String get albumKindSingle => 'Single';

  @override
  String get albumKindCompilation => 'Compilation';

  @override
  String get albumTracksTitle => 'Tracks';

  @override
  String albumReleasedIn(int year) {
    return 'Released in $year';
  }

  @override
  String albumReleasedOn(String date) {
    return 'Released $date';
  }

  @override
  String artistFollowed(String name) {
    return 'Followed $name';
  }

  @override
  String get artistUnfollowed => 'Unfollowed';

  @override
  String get artistFollowFailed => 'Could not follow, try again later';

  @override
  String get artistUnfollowFailed => 'Could not unfollow, try again later';

  @override
  String get artistSimilar => 'Similar Artists';

  @override
  String artistHotTracksOf(String name) {
    return 'Top Tracks by $name';
  }

  @override
  String get artistLatestRelease => 'Latest Release';

  @override
  String get artistHotTracks => 'Top Tracks';

  @override
  String get artistSinglesAndEps => 'Singles & EPs';

  @override
  String get playlistSearchPlaceholder => 'Search in playlist';

  @override
  String get playlistColTitle => 'Title';

  @override
  String get playlistColAlbum => 'Album';

  @override
  String get playlistColAdded => 'Date Added';

  @override
  String get playlistEmpty => 'No tracks in this playlist';

  @override
  String playlistNoMatch(String query) {
    return 'No matches for \"$query\"';
  }

  @override
  String playlistTagCount(String tag, int count) {
    return '\"$tag\" has $count tracks';
  }

  @override
  String get searchPlaceholder =>
      'Search songs, albums, artists, and playlists';

  @override
  String get searchUnsupported => 'This plugin does not support search.';

  @override
  String get searchRecent => 'Recent Searches';

  @override
  String get searchRecentResults => 'Recent Results';

  @override
  String get searchHot => 'Trending';

  @override
  String get searchRemoveHistory => 'Remove from history';

  @override
  String searchNoResults(String query) {
    return 'No results for \"$query\"';
  }

  @override
  String searchViewAllSongs(int count) {
    return 'View all $count songs';
  }

  @override
  String searchViewAllAlbums(int count) {
    return 'View all $count albums';
  }

  @override
  String searchAllCount(int count) {
    return 'All $count';
  }

  @override
  String searchQueueName(String query) {
    return 'Search \"$query\"';
  }

  @override
  String searchMcpQueueName(String query) {
    return 'Search: $query';
  }

  @override
  String get commentSortHot => 'Top';

  @override
  String get commentSortLatest => 'Latest';

  @override
  String get commentWrite => 'Write Comment';

  @override
  String get commentEmpty => 'No comments yet';

  @override
  String get commentLoadFailed => 'Failed to load comments';

  @override
  String get commentLikeFailed => 'Failed to like';

  @override
  String get commentAnonymous => 'Anonymous';

  @override
  String get commentReply => 'Reply';

  @override
  String get commentPosted => 'Comment posted';

  @override
  String get commentReplyPosted => 'Reply posted';

  @override
  String get commentPostFailed => 'Failed to post';

  @override
  String get commentWriteTo => 'Comment on';

  @override
  String get commentPosting => 'Posting…';

  @override
  String get commentPost => 'Post';

  @override
  String get commentPlaceholder => 'Write a comment…';

  @override
  String commentReplyPlaceholder(String name) {
    return 'Reply to $name…';
  }

  @override
  String get profileLocalUnsupported =>
      'Local Music does not have a profile page.';

  @override
  String profileSourceUnsupported(String name) {
    return '\"$name\" does not have a profile page.';
  }

  @override
  String profileSignInHint(String name) {
    return 'Sign in to \"$name\" to view your profile.';
  }

  @override
  String get profileTopArtists => 'Top Artists';

  @override
  String get profileMostPlayed => 'Most Played';

  @override
  String get profileMyPlaylists => 'My Playlists';

  @override
  String signOutConfirmTitle(String name) {
    return 'Sign out of \"$name\"?';
  }

  @override
  String get signOutConfirmMessage =>
      'Your library, playlists, and recommendations from this source will be hidden\nuntil you sign in again.';

  @override
  String signInDialogTitle(String name) {
    return 'Sign in to $name';
  }

  @override
  String get signInQrFailed => 'Failed to generate QR code';

  @override
  String get remoteNeedSignIn => 'Sign in required';

  @override
  String remoteErrorKind(String kind) {
    return 'Error ($kind)';
  }

  @override
  String remotePluginMissing(String id) {
    return 'Plugin $id is not loaded. You can reload plugins in Settings.';
  }

  @override
  String get remoteSwitchToLocalHint =>
      'You can switch back to Local Music in Settings';

  @override
  String get remoteNoDiscover =>
      'This plugin has no Explore page. Try Search instead.';

  @override
  String get remoteNoHome =>
      'This plugin has no Home page. Try Search instead.';

  @override
  String get remoteNoContent => 'Nothing here yet.';

  @override
  String get remotePlayAlbumFailed =>
      'Could not play this album, try again later';

  @override
  String get greetingLateNight => 'Late night';

  @override
  String get greetingMorning => 'Good morning';

  @override
  String get greetingNoon => 'Good afternoon';

  @override
  String get greetingAfternoon => 'Good afternoon';

  @override
  String get greetingEvening => 'Good evening';

  @override
  String get localRecentlyAdded => 'Recently Added';

  @override
  String get localEmptyHint => 'No songs yet. Add a music folder in Settings';

  @override
  String get localArtistNotFound => 'Artist not found';

  @override
  String get localFileMovedOrDeleted => 'File was moved or deleted';

  @override
  String get timeJustNow => 'Just now';

  @override
  String timeMinutesAgo(int count) {
    return '$count min ago';
  }

  @override
  String timeHoursAgo(int count) {
    return '$count hr ago';
  }

  @override
  String timeDaysAgo(int count) {
    return '${count}d ago';
  }

  @override
  String timeMonthsAgo(int count) {
    return '$count mo ago';
  }

  @override
  String timeYearsAgo(int count) {
    return '$count yr ago';
  }

  @override
  String get timeToday => 'Today';

  @override
  String get timeYesterday => 'Yesterday';

  @override
  String dateYear(int year) {
    return '$year';
  }

  @override
  String dateYearMonth(int year, int month) {
    return '$year-$month';
  }

  @override
  String dateMonthDay(int month, int day) {
    return '$month/$day';
  }

  @override
  String dateYearMonthDay(int year, int month, int day) {
    return '$year-$month-$day';
  }

  @override
  String toastSignedInAs(String name) {
    return 'Signed in: $name';
  }

  @override
  String get toastNotSignedIn => 'Not signed in';

  @override
  String get toastSignOutFailed => 'Sign out failed';

  @override
  String get toastPlayAlbumFailed => 'Could not play this album';

  @override
  String get toastPlayPlaylistFailed => 'Could not play this playlist';

  @override
  String toastPlaybackError(String error) {
    return 'Playback error: $error';
  }

  @override
  String toastCannotPlayTrack(String title) {
    return 'Cannot play \"$title\"';
  }

  @override
  String toastStationEmpty(String name) {
    return 'No tracks in $name';
  }

  @override
  String toastStationOpenFailed(String name) {
    return 'Could not open $name';
  }

  @override
  String toastAddedToPlaylist(String name) {
    return 'Added to \"$name\"';
  }

  @override
  String toastAddToPlaylistFailed(String name) {
    return 'Could not add to \"$name\"';
  }

  @override
  String toastPlaylistCreated(String name) {
    return 'Created playlist \"$name\"';
  }

  @override
  String get toastCreatePlaylistFailed => 'Could not create playlist';

  @override
  String get toastRemovedFromPlaylist => 'Removed from playlist';

  @override
  String get toastRemoveFromPlaylistFailed => 'Could not remove from playlist';

  @override
  String get toastNoSimilarFound => 'No similar tracks found';

  @override
  String toastSimilarQueueName(String title) {
    return 'Similar to \"$title\"';
  }

  @override
  String get toastFindSimilarFailed => 'Could not find similar tracks';

  @override
  String toastActionFailed(String title) {
    return '\"$title\" failed';
  }

  @override
  String get toastDisliked => 'We\'ll recommend fewer tracks like this';

  @override
  String toastDislikeFailed(String name) {
    return 'Could not notify $name';
  }

  @override
  String get toastLikeFailed => 'Could not like this track';

  @override
  String get toastUnlikeFailed => 'Could not unlike this track';

  @override
  String get toastSaveAlbumFailed => 'Could not save this album';

  @override
  String get toastUnsaveAlbumFailed => 'Could not remove this album';

  @override
  String toastAlbumSaved(String title) {
    return 'Saved \"$title\"';
  }

  @override
  String get toastAlbumUnsaved => 'Removed from library';

  @override
  String pluginErrIdTaken(String id) {
    return 'id $id is already in use';
  }

  @override
  String pluginErrMinAppVersion(String required, String current) {
    return 'Requires YesPlayMusic $required or later (current: $current)';
  }

  @override
  String get pluginErrEmptyLink => 'Please enter a link';

  @override
  String get pluginErrInvalidLink => 'Unrecognized link';

  @override
  String pluginErrDownloadNetwork(String error) {
    return 'Download failed, check your network: $error';
  }

  @override
  String pluginErrRepoNotFound(String slug) {
    return 'GitHub repository $slug not found';
  }

  @override
  String pluginErrNoManifestInPath(String path) {
    return 'No plugin.json found in $path';
  }

  @override
  String get pluginErrNoManifestInLink => 'No plugin.json found at this link';

  @override
  String pluginErrMissingEntry(String file) {
    return 'Plugin is missing entry file $file';
  }

  @override
  String pluginErrNotFoundUrl(String url) {
    return 'Not found: $url';
  }

  @override
  String get pluginErrGithubRateLimit =>
      'GitHub temporarily declined the request (rate limit). Please try again later';

  @override
  String pluginErrDownloadHttp(int code) {
    return 'Download failed: HTTP $code';
  }

  @override
  String get pluginErrTooLarge => 'Plugin is too large (exceeds 50 MB)';

  @override
  String get pluginErrInvalidZip =>
      'Downloaded file is not a valid .zip archive';

  @override
  String pluginErrManifestJson(String error) {
    return 'plugin.json is not valid JSON: $error';
  }

  @override
  String get pluginErrManifestObject => 'plugin.json must be a JSON object';

  @override
  String pluginErrManifestIdChars(String id) {
    return 'id \"$id\" may only contain lowercase letters, digits, and . _ -';
  }

  @override
  String get pluginErrManifestIdLocal => 'id \"local\" is reserved';

  @override
  String get pluginErrManifestNoName => 'Missing name';

  @override
  String pluginErrManifestMain(String file) {
    return 'main \"$file\" must be a .js file inside the plugin folder';
  }

  @override
  String pluginErrManifestIcon(String file) {
    return 'icon \"$file\" must be a png, jpg, or webp file inside the plugin folder';
  }

  @override
  String pluginErrStopped(String name) {
    return '$name has stopped';
  }

  @override
  String pluginErrNoManifestDir(String dir) {
    return '$dir: missing plugin.json';
  }

  @override
  String pluginErrMinVersionSimple(String name, String version) {
    return '$name requires YesPlayMusic $version or later';
  }

  @override
  String pluginErrProcessExited(String name) {
    return '$name: plugin process exited unexpectedly';
  }

  @override
  String pluginErrNotObject(String name, String op) {
    return '$name.$op did not return an object';
  }

  @override
  String pluginErrNotArray(String name, String op) {
    return '$name.$op did not return an array';
  }

  @override
  String pluginErrInvalidStreamUrl(String name) {
    return '$name returned an invalid stream URL';
  }

  @override
  String pluginErrDuplicateId(String id) {
    return 'Duplicate plugin id: $id';
  }

  @override
  String pluginErrTimeoutDisabled(int seconds) {
    return 'Plugin did not respond within ${seconds}s and was disabled';
  }

  @override
  String get pluginErrOomDisabled =>
      'Plugin ran out of memory and was disabled';

  @override
  String get pluginErrLoadTimeout => 'Load timed out';

  @override
  String pluginErrOpTimeout(String op, int seconds) {
    return '$op timed out (${seconds}s)';
  }

  @override
  String get pluginErrClosed => 'Plugin is closed';

  @override
  String sourceErrUnsupported(String name, String op) {
    return '$name does not support $op';
  }

  @override
  String sourceErrNotFound(String source) {
    return 'Source not found: $source';
  }
}
