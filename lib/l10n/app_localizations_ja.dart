// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Japanese (`ja`).
class AppLocalizationsJa extends AppLocalizations {
  AppLocalizationsJa([String locale = 'ja']) : super(locale);

  @override
  String get navHome => 'ホーム';

  @override
  String get navDiscover => '見つける';

  @override
  String get navLibrary => 'ライブラリ';

  @override
  String get navSearch => '検索';

  @override
  String get navSearchPage => '検索';

  @override
  String get navSettings => '設定';

  @override
  String get navProfile => 'プロフィール';

  @override
  String get actionPlay => '再生';

  @override
  String get actionPause => '一時停止';

  @override
  String get actionPlayAll => 'すべて再生';

  @override
  String get actionShuffle => 'シャッフル';

  @override
  String get actionNext => '次の曲';

  @override
  String get actionPrev => '前の曲';

  @override
  String get actionLike => 'いいね';

  @override
  String get actionUnlike => 'いいねを解除';

  @override
  String get actionSaveAlbum => 'アルバムを保存';

  @override
  String get actionUnsave => '保存を解除';

  @override
  String get actionFollow => 'フォロー';

  @override
  String get actionFollowing => 'フォロー中';

  @override
  String get actionMore => 'その他';

  @override
  String get actionBack => '戻る';

  @override
  String get actionClose => '閉じる';

  @override
  String get windowMinimize => '最小化';

  @override
  String get windowMaximize => '最大化';

  @override
  String get windowRestore => '元に戻す (縮小)';

  @override
  String get actionCancel => 'キャンセル';

  @override
  String get actionConfirm => 'OK';

  @override
  String get actionClear => '消去';

  @override
  String get actionClearShort => '消去';

  @override
  String get actionRetry => '再試行';

  @override
  String get actionOpen => '開く';

  @override
  String get actionSave => '保存';

  @override
  String get actionSaving => '保存中…';

  @override
  String get actionDone => '完了';

  @override
  String get actionApply => '適用';

  @override
  String get actionCopy => 'コピー';

  @override
  String get actionReset => 'リセット';

  @override
  String get actionAdd => '追加';

  @override
  String get actionSelect => '選択';

  @override
  String get actionAll => 'すべて';

  @override
  String get actionCollapse => '折りたたむ';

  @override
  String get actionExpandAllCategories => 'すべてのカテゴリ';

  @override
  String get actionPrevPage => '前のページ';

  @override
  String get actionNextPage => '次のページ';

  @override
  String get actionViewFullText => '全文を表示';

  @override
  String get actionShow => '表示';

  @override
  String get actionHide => '非表示';

  @override
  String get actionReload => '再読み込み';

  @override
  String get actionInstall => 'インストール';

  @override
  String get actionUpdate => 'アップデート';

  @override
  String get actionUninstall => 'アンインストール';

  @override
  String get actionEnable => '有効化';

  @override
  String get actionSignIn => 'ログイン';

  @override
  String get actionSignOut => 'ログアウト';

  @override
  String get actionManageSources => '音楽ソースを管理';

  @override
  String get actionManagePlugins => 'プラグインを管理';

  @override
  String get actionGoSearch => '検索へ';

  @override
  String get actionLoadMore => 'もっと読み込む';

  @override
  String get stateLoading => '読み込み中…';

  @override
  String get stateLoadingShort => '読み込み中…';

  @override
  String get stateLoadFailed => '読み込みに失敗しました';

  @override
  String get stateCouldNotLoad => '読み込めませんでした';

  @override
  String get stateSigningIn => 'ログイン中…';

  @override
  String get stateSigningInShort => 'ログイン中…';

  @override
  String get stateSignedIn => 'ログイン済み';

  @override
  String get stateNotSignedIn => '未ログイン';

  @override
  String get stateNone => 'なし';

  @override
  String get statePleaseSelect => '選択してください';

  @override
  String get stateCopied => 'コピーしました';

  @override
  String get stateSaved => '保存しました';

  @override
  String stateSaveFailed(String error) {
    return '保存に失敗しました：$error';
  }

  @override
  String get miniShuffleOn => 'シャッフル：オン';

  @override
  String get miniRepeatOn => 'リピート再生';

  @override
  String get miniRepeatOff => 'リピートオフ';

  @override
  String get miniQueue => '再生キュー';

  @override
  String get miniOpenNowPlaying => '再生中画面を開く';

  @override
  String get miniMute => 'ミュート';

  @override
  String get npTitle => '再生中';

  @override
  String get npComments => 'コメント';

  @override
  String get npSimilar => '類似曲';

  @override
  String npSimilarTo(String title) {
    return '$title に似た曲';
  }

  @override
  String get npNoSimilar => '似た曲が見つかりませんでした';

  @override
  String get npUpNext => '次に再生';

  @override
  String get npQueueEmpty => 'キューにこれ以上曲がありません';

  @override
  String get npFromPrefix => '再生元：';

  @override
  String get npViewAlbum => 'アルバムを見る';

  @override
  String get npViewArtist => 'アーティストを見る';

  @override
  String get menuPlayNext => '次に再生';

  @override
  String get menuAddedNext => '次に再生に追加しました';

  @override
  String get menuAddToQueue => 'キューに追加';

  @override
  String get menuAddedToQueue => '再生キューに追加しました';

  @override
  String get menuAddToPlaylist => 'プレイリストに追加';

  @override
  String get menuCreatePlaylist => '新規プレイリスト';

  @override
  String get menuPlaylistNamePlaceholder => 'プレイリスト名';

  @override
  String get menuCreateAndAdd => '作成して追加';

  @override
  String get menuPlaySimilar => '類似曲を再生';

  @override
  String get menuDislike => '興味なし';

  @override
  String get menuRemoveFromPlaylist => 'プレイリストから削除';

  @override
  String get shortcutGroupPlayback => '再生';

  @override
  String get shortcutGroupUi => 'インターフェース';

  @override
  String get shortcutGroupMediaKeys => 'メディアキー';

  @override
  String get shortcutPlayPause => '再生 / 一時停止';

  @override
  String get shortcutSpaceKey => 'スペース';

  @override
  String get shortcutSeekForward => '5 秒進む';

  @override
  String get shortcutSeekBackward => '5 秒戻る';

  @override
  String get shortcutVolumeUp => '音量を上げる';

  @override
  String get shortcutVolumeDown => '音量を下げる';

  @override
  String get shortcutMute => 'ミュート';

  @override
  String get shortcutRepeat => 'リピートモード';

  @override
  String get shortcutLikeCurrent => '再生中の曲にいいね';

  @override
  String get shortcutDismissOverlay => '再生中画面・ダイアログを閉じる';

  @override
  String get shortcutBack => '戻る';

  @override
  String get shortcutForward => '進む';

  @override
  String get shortcutSwitchTab => 'サイドバーのタブを切替';

  @override
  String get shortcutKeyRangeTo => '〜';

  @override
  String get shortcutMediaKeysLabel => 'キーボードのメディアキーとイヤホンボタン';

  @override
  String get shortcutTypingHintMac => 'テキスト入力中は ⌘F と Esc のみ有効です';

  @override
  String get shortcutTypingHintOther => 'テキスト入力中は Ctrl+F と Esc のみ有効です';

  @override
  String get menuBarSettings => '設定…';

  @override
  String get menuBarView => '表示';

  @override
  String get menuBarWindow => 'ウィンドウ';

  @override
  String get swatchLilac => 'ライラック';

  @override
  String get swatchSky => 'スカイ';

  @override
  String get swatchMint => 'ミント';

  @override
  String get swatchSun => 'サン';

  @override
  String get swatchRose => 'ローズ';

  @override
  String get swatchFlame => 'フレイム';

  @override
  String get settingsGeneral => '一般';

  @override
  String get settingsShortcuts => 'ショートカット';

  @override
  String get settingsPlugins => 'プラグイン';

  @override
  String get settingsAbout => 'このアプリについて';

  @override
  String get settingsAppearance => '外観';

  @override
  String get settingsLyrics => '歌詞';

  @override
  String get settingsPlayback => '再生';

  @override
  String get settingsStorage => 'ストレージ';

  @override
  String get settingsAccentColor => 'アクセントカラー';

  @override
  String get settingsLanguage => '言語';

  @override
  String get langSystem => 'システムに従う';

  @override
  String get settingsMiniLyric => 'ミニプレイヤーに常に歌詞を表示';

  @override
  String get settingsKeepRunning => 'ウィンドウを閉じてもバックグラウンドで実行';

  @override
  String get trayShowWindow => 'ウィンドウを表示';

  @override
  String get trayQuit => '終了';

  @override
  String aboutDownloadVersion(String version) {
    return '$version をダウンロード';
  }

  @override
  String get aboutChecking => '確認中…';

  @override
  String get aboutCheckUpdate => 'アップデートを確認';

  @override
  String get aboutAutoCheck => 'アップデートを自動確認';

  @override
  String get aboutAnalytics => '匿名の利用統計を送信';

  @override
  String get aboutSourceAndFeedback => 'ソースコードとフィードバック';

  @override
  String aboutVersion(String version) {
    return 'バージョン $version';
  }

  @override
  String get aboutLogs => 'ログファイル';

  @override
  String get aboutLogsHint => '不具合の報告時に添付';

  @override
  String get aboutOpenFolder => 'フォルダを開く';

  @override
  String get aboutOpen => '開く';

  @override
  String updaterNewVersion(String version) {
    return '新バージョン $version が利用可能です';
  }

  @override
  String get updaterUpToDate => '最新バージョンです';

  @override
  String get updaterCheckFailed => 'アップデートの確認に失敗しました';

  @override
  String storageClearTitle(String size) {
    return '$size のキャッシュを消去しますか？';
  }

  @override
  String get storageClearMessage => 'API・音声・画像のキャッシュがすべて消去され、\n必要時に再取得されます。';

  @override
  String storageCleared(String size) {
    return '$size のキャッシュを消去しました';
  }

  @override
  String storageLimit(String size) {
    return '/ 上限 $size';
  }

  @override
  String storageApi(String size) {
    return 'API $size';
  }

  @override
  String storageAudio(String size) {
    return '音声 $size';
  }

  @override
  String storageImage(String size) {
    return '画像 $size';
  }

  @override
  String get storageClearing => '消去中…';

  @override
  String get storageClearCache => 'キャッシュを消去';

  @override
  String get sourceMusicSource => '音楽ソース';

  @override
  String get sourceLocal => 'ローカル音楽';

  @override
  String get sourceLocalDesc => 'PC 内の音楽ファイルを再生';

  @override
  String get sourceBuiltIn => '内蔵';

  @override
  String get sourceInUse => '使用中';

  @override
  String get sourceScanning => 'スキャン中…';

  @override
  String get sourceNoFolders => 'フォルダ未追加';

  @override
  String sourceFolderAlbums(int folders, int albums) {
    return '$folders フォルダ、$albums アルバム';
  }

  @override
  String get sourceAddFolderEllipsis => '音楽フォルダを追加…';

  @override
  String get sourceAddFolder => 'フォルダを追加';

  @override
  String get sourceAddMusicFolder => '音楽フォルダを追加';

  @override
  String get sourceRescan => '再スキャン';

  @override
  String get sourceMusicFolders => '音楽フォルダ';

  @override
  String get sourceNoFoldersAdded => '音楽フォルダがまだ追加されていません';

  @override
  String get sourceOpenInFileManager => 'ファイルマネージャーで開く';

  @override
  String get sourceShowInFileManager => 'ファイルマネージャーで表示';

  @override
  String get sourceStopScanningFolder => 'このフォルダのスキャンを停止';

  @override
  String sourceSwitchedTo(String name) {
    return '「$name」に切り替えました';
  }

  @override
  String get sourceFolderAlreadyScanned => 'このフォルダは既にスキャン対象です';

  @override
  String get sourceNoMusicFound => '音楽が見つかりませんでした';

  @override
  String sourceScanningCount(int count) {
    final intl.NumberFormat countNumberFormat =
        intl.NumberFormat.decimalPattern(localeName);
    final String countString = countNumberFormat.format(count);

    return 'スキャン中… $countString 曲';
  }

  @override
  String sourceFoldersUnreadable(int count) {
    final intl.NumberFormat countNumberFormat =
        intl.NumberFormat.decimalPattern(localeName);
    final String countString = countNumberFormat.format(count);

    return '$countString 個のフォルダを読み取れなかったため、スキップしました';
  }

  @override
  String get sourceFolderUnreadable => '読み取れないためスキップしました';

  @override
  String get sourceCancelScan => 'スキャンをキャンセル';

  @override
  String get sourceNotFound => 'この音楽ソースが見つかりません';

  @override
  String pluginsLoadedToast(int count) {
    return '$count 個のプラグインを読み込みました';
  }

  @override
  String get pluginFind => 'プラグインを探す';

  @override
  String get pluginInstallTitle => 'プラグインをインストール';

  @override
  String get pluginTabInstalled => 'インストール済み';

  @override
  String get pluginTabOfficial => '公式プラグイン';

  @override
  String get pluginOpenDir => 'プラグインフォルダを開く';

  @override
  String get pluginThirdPartyHint => '公式以外のプラグインは各作者によって保守されています';

  @override
  String get pluginDevDocs => 'プラグイン開発ドキュメント ›';

  @override
  String get pluginComingSoon => '近日公開';

  @override
  String get pluginInstallFromLink => 'リンクからインストール';

  @override
  String get pluginInstallFromLinkHint => 'GitHub リポジトリ、Release、または .zip';

  @override
  String pluginUninstallTitle(String name) {
    return '「$name」をアンインストールしますか？';
  }

  @override
  String get pluginUninstallMessage => 'プラグインの設定とログイン状態も削除されます';

  @override
  String pluginUninstalled(String name) {
    return '「$name」をアンインストールしました';
  }

  @override
  String pluginUpdateAvailable(String version) {
    return '$version にアップデート可能';
  }

  @override
  String pluginNeedSetting(String field) {
    return '$field の設定が必要です';
  }

  @override
  String pluginSignedInAs(String name) {
    return '$name としてログイン中';
  }

  @override
  String pluginDisabledToast(String name) {
    return '「$name」を無効化しました';
  }

  @override
  String pluginEnabledToast(String name) {
    return '「$name」を有効化しました';
  }

  @override
  String get pluginHasUpdate => '更新あり';

  @override
  String get pluginSignInAccount => 'アカウントにログイン';

  @override
  String get pluginSettingsEllipsis => 'プラグイン設定…';

  @override
  String get pluginDisable => 'プラグインを無効化';

  @override
  String get pluginReload => 'プラグインを再読み込み';

  @override
  String get pluginUninstallEllipsis => 'プラグインをアンインストール…';

  @override
  String get pluginDeleteEllipsis => 'プラグインを削除…';

  @override
  String get pluginDisabledBadge => '無効';

  @override
  String get pluginNotLoadedBadge => '未読み込み';

  @override
  String get pluginNotLoadedStatus => 'プラグインが読み込まれていません';

  @override
  String get pluginEmptyTitle => 'プラグインはまだありません';

  @override
  String get pluginEmptyHint => 'GitHub リンクに対応';

  @override
  String get pluginSettingsTitle => 'プラグイン設定';

  @override
  String get pluginSectionAccount => 'アカウント';

  @override
  String get pluginSectionCapabilities => '機能';

  @override
  String get pluginSectionPermissions => '権限';

  @override
  String get pluginDisabledHint => 'プラグインは無効です。有効にすると反映されます';

  @override
  String get pluginUninstallBtn => 'プラグインをアンインストール';

  @override
  String get pluginSignInSyncHint => 'ログインするとお気に入りやプレイリストを同期できます';

  @override
  String get pluginGetIt => '取得 ›';

  @override
  String pluginUpdatedToast(String name) {
    return '「$name」をアップデートしました';
  }

  @override
  String pluginInstalledToast(String name) {
    return '「$name」をインストールしました';
  }

  @override
  String pluginInstallFailed(String error) {
    return 'インストール失敗：$error';
  }

  @override
  String get pluginInstallPrompt =>
      'GitHub リポジトリ URL、\nまたはプラグインのダウンロードリンクを貼り付け';

  @override
  String get pluginInstallPlaceholder => 'github.com/owner/repo';

  @override
  String get pluginInstallSupportHint =>
      'GitHub リポジトリ、Release、plugin.json、.zip リンクに対応';

  @override
  String get pluginReading => '読み込み中…';

  @override
  String get pluginNextStep => '次へ';

  @override
  String get pluginInstallFromLocal => 'ローカルフォルダからインストール…';

  @override
  String pluginPublishedAgo(String ago) {
    return '、$agoに公開';
  }

  @override
  String get pluginLocalFolder => 'ローカルフォルダ';

  @override
  String get pluginLatestCode => '最新コード';

  @override
  String pluginInstalledVersion(String version) {
    return 'インストール済み $version';
  }

  @override
  String get pluginPermissionsNeeded => '必要な権限';

  @override
  String get pluginPermNoNetwork => 'ネットワークアクセスなし';

  @override
  String get pluginPermNoNetworkDetail => 'どのウェブサイトにも接続しません';

  @override
  String get pluginPermAnyWebsite => '任意のウェブサイトにアクセス';

  @override
  String get pluginPermAnyWebsiteDetail => 'すべてのウェブサイトに接続可能';

  @override
  String get pluginPermAnyWebsiteFull => '任意のウェブサイトにアクセス可能';

  @override
  String get pluginPermNetwork => 'ネットワークアクセス';

  @override
  String get pluginPermSignInDetail => 'ログインページを開き、ログイン後の Cookie を読み取ります';

  @override
  String get pluginPermProcess => 'ローカルプログラムの実行';

  @override
  String get pluginPermProcessBadge => '個別許可が必要';

  @override
  String pluginPermProcessDetail(String programs) {
    return '$programs。デフォルトでオフ、プラグイン設定で有効化できます';
  }

  @override
  String get pluginPermStorage => 'データの保存';

  @override
  String get pluginPermStorageDetail => '設定、ログイン状態、キャッシュを保存します';

  @override
  String get pluginCapabilitiesProvided => '提供される機能';

  @override
  String get pluginNavIconHint => 'アイコン付きの項目はサイドバーに追加されます';

  @override
  String get pluginTrustHint => '信頼できる提供元のプラグインのみインストールしてください';

  @override
  String get pluginInstalling => 'インストール中…';

  @override
  String get pluginYourServer => '設定したサーバー';

  @override
  String pluginCanAccessHosts(String hosts) {
    return '$hosts にアクセス可能';
  }

  @override
  String pluginCanAccessHostsMore(String hosts, int count) {
    return '$hosts など計 $count 件にアクセス可能';
  }

  @override
  String get pluginOnlyYourServer => '設定で指定したサーバーのみにアクセス';

  @override
  String pluginAndYourServer(String hosts) {
    return '$hosts、および設定で指定したサーバー';
  }

  @override
  String get pluginAnyProgram => '任意のローカルプログラム';

  @override
  String get officialJellyfinDesc => 'Jellyfin サーバーに接続';

  @override
  String get officialPlexDesc => 'Plex Media Server に接続';

  @override
  String get officialSubsonicDesc => 'Navidrome などの Subsonic サーバーに接続';

  @override
  String get officialEmbyDesc => 'Emby サーバーに接続';

  @override
  String get capSuggest => '検索候補';

  @override
  String get capLyrics => '歌詞';

  @override
  String get capPlaylist => 'プレイリスト';

  @override
  String get capEditPlaylist => 'プレイリスト編集';

  @override
  String get capFavorites => 'お気に入り';

  @override
  String get capAlbum => 'アルバム';

  @override
  String get capArtist => 'アーティスト';

  @override
  String get capRadio => 'ラジオ';

  @override
  String get capSimilar => '類似曲おすすめ';

  @override
  String get capHistory => '再生履歴';

  @override
  String get capDislike => '興味なし';

  @override
  String get capTrackMenu => '曲メニュー';

  @override
  String get mcpPortRangeError => 'ポート番号は 1024〜65535 の範囲で指定してください';

  @override
  String mcpPortUpdated(int port) {
    return 'ポートを $port に更新しました';
  }

  @override
  String mcpCopiedLabel(String label) {
    return '$label をコピーしました';
  }

  @override
  String mcpRunning(String url) {
    return '稼働中 · $url';
  }

  @override
  String get mcpStopped => '停止中';

  @override
  String get mcpEnableLocal => 'ローカル MCP サーバーを有効化';

  @override
  String get mcpEnableHint => '127.0.0.1 のみで待機し、外部 AI クライアントから再生や検索を操作可能にします';

  @override
  String mcpSessions(int count) {
    return '$count セッション';
  }

  @override
  String get mcpListenPort => '待機ポート';

  @override
  String get mcpPortHint => 'デフォルト 18888（Streamable HTTP）';

  @override
  String get mcpLazyMode => 'MCP 遅延読み込みモード';

  @override
  String mcpLazyHintOn(int core, int lazy) {
    return '初期時は $core 個のコアツールのみ公開し、必要に応じ $lazy 個の拡張ツールを検出';
  }

  @override
  String mcpLazyHintOff(int total) {
    return '現在の音楽ソースが対応する全 $total 個のツールをすべて公開';
  }

  @override
  String get mcpReadOnly => '読み取り専用セーフモード';

  @override
  String get mcpReadOnlyHint => 'プレイリスト編集、コメント投稿、いいね等の書き込み操作をブロック';

  @override
  String get mcpAuthSection => 'セキュリティ認証';

  @override
  String get mcpRequireToken => 'Bearer Token を要求';

  @override
  String get mcpRequireTokenHint =>
      '有効にすると Authorization: Bearer <token> ヘッダーが必要になります';

  @override
  String get mcpHttpConfigTitle => 'クライアント設定（Streamable HTTP）';

  @override
  String get mcpHttpConfigDesc =>
      'Antigravity、Cursor、Claude など HTTP MCP 対応クライアント向け：';

  @override
  String get mcpCopyHttpConfig => 'HTTP 設定をコピー';

  @override
  String get mcpHttpConfigLabel => 'Streamable HTTP 設定';

  @override
  String get mcpStdioConfigTitle => 'Stdio ブリッジ設定（自動起動対応）';

  @override
  String get mcpStdioConfigDesc =>
      'stdio のみ対応のクライアント向け。リクエスト時にアプリ未起動ならバックグラウンドで自動起動します：';

  @override
  String get mcpCopyStdioConfig => 'Stdio ブリッジ設定をコピー';

  @override
  String get mcpStdioConfigLabel => 'Stdio ブリッジ設定';

  @override
  String mcpPortStartFailed(int port, String error) {
    return 'ポート $port の起動に失敗しました：$error';
  }

  @override
  String get tabSongs => '曲';

  @override
  String get tabAlbums => 'アルバム';

  @override
  String get tabPlaylists => 'プレイリスト';

  @override
  String get tabArtists => 'アーティスト';

  @override
  String get tabArtistSearch => 'アーティスト';

  @override
  String get sortTitleAZ => 'タイトル A-Z';

  @override
  String get sortReleaseDate => 'リリース日';

  @override
  String get sortDefault => 'デフォルト';

  @override
  String get sortAlbumAZ => 'アルバム A-Z';

  @override
  String get libraryEmptyTitle => 'ライブラリは空です';

  @override
  String get libraryAddSource => '音楽ソースを追加';

  @override
  String get libraryNoAlbums => 'アルバムがありません';

  @override
  String get libraryNoSongs => '曲がありません';

  @override
  String get libraryNoPlaylists => 'プレイリストがありません';

  @override
  String get libraryNoArtists => 'アーティストがいません';

  @override
  String get libraryEarlier => 'それ以前';

  @override
  String get libraryCreatedByMe => '作成したプレイリスト';

  @override
  String get libraryCollected => '保存済み';

  @override
  String countTracks(int count) {
    return '$count 曲';
  }

  @override
  String countSongs(int count) {
    return '$count 曲';
  }

  @override
  String countAlbums(int count) {
    return '$count アルバム';
  }

  @override
  String countPlays(String count) {
    return '$count 回';
  }

  @override
  String countComments(String count) {
    return '$count 件のコメント';
  }

  @override
  String durationHours(int count) {
    return '$count 時間';
  }

  @override
  String durationMinutes(int count) {
    return '$count 分';
  }

  @override
  String albumTracksDuration(int tracks, int minutes) {
    return '$tracks 曲 · $minutes 分';
  }

  @override
  String get albumNotFound => 'アルバムが見つかりません';

  @override
  String get albumKindAlbum => 'アルバム';

  @override
  String get albumKindSingle => 'シングル';

  @override
  String get albumKindCompilation => 'コンピレーション';

  @override
  String get albumTracksTitle => 'トラック';

  @override
  String albumReleasedIn(int year) {
    return '$year 年リリース';
  }

  @override
  String albumReleasedOn(String date) {
    return '$date リリース';
  }

  @override
  String artistFollowed(String name) {
    return '$name をフォローしました';
  }

  @override
  String get artistUnfollowed => 'フォローを解除しました';

  @override
  String get artistFollowFailed => 'フォローできませんでした。後でお試しください';

  @override
  String get artistUnfollowFailed => 'フォロー解除できませんでした。後でお試しください';

  @override
  String get artistSimilar => '似たアーティスト';

  @override
  String artistHotTracksOf(String name) {
    return '$name の人気曲';
  }

  @override
  String get artistLatestRelease => '最新リリース';

  @override
  String get artistHotTracks => '人気曲';

  @override
  String get artistSinglesAndEps => 'シングル & EP';

  @override
  String get playlistSearchPlaceholder => 'プレイリスト内を検索';

  @override
  String get playlistColTitle => 'タイトル';

  @override
  String get playlistColAlbum => 'アルバム';

  @override
  String get playlistColAdded => '追加日';

  @override
  String get playlistEmpty => 'プレイリストに曲がありません';

  @override
  String playlistNoMatch(String query) {
    return '「$query」に一致する曲はありません';
  }

  @override
  String playlistTagCount(String tag, int count) {
    return '「$tag」には $count 曲あります';
  }

  @override
  String get searchPlaceholder => '曲、アルバム、アーティスト、プレイリストを検索';

  @override
  String get searchUnsupported => 'このプラグインは検索に対応していません。';

  @override
  String get searchRecent => '最近の検索';

  @override
  String get searchRecentResults => '最近の検索結果';

  @override
  String get searchHot => '人気の検索';

  @override
  String get searchRemoveHistory => '履歴から削除';

  @override
  String searchNoResults(String query) {
    return '「$query」の結果が見つかりませんでした';
  }

  @override
  String searchViewAllSongs(int count) {
    return '全 $count 曲を表示';
  }

  @override
  String searchViewAllAlbums(int count) {
    return '全 $count アルバムを表示';
  }

  @override
  String searchAllCount(int count) {
    return 'すべて $count';
  }

  @override
  String searchQueueName(String query) {
    return '検索「$query」';
  }

  @override
  String searchMcpQueueName(String query) {
    return '検索：$query';
  }

  @override
  String get commentSortHot => '人気順';

  @override
  String get commentSortLatest => '新着順';

  @override
  String get commentWrite => 'コメントを書く';

  @override
  String get commentEmpty => 'まだコメントはありません';

  @override
  String get commentLoadFailed => 'コメントの読み込みに失敗しました';

  @override
  String get commentLikeFailed => 'いいねに失敗しました';

  @override
  String get commentAnonymous => '匿名';

  @override
  String get commentReply => '返信';

  @override
  String get commentPosted => 'コメントを投稿しました';

  @override
  String get commentReplyPosted => '返信を投稿しました';

  @override
  String get commentPostFailed => '投稿に失敗しました';

  @override
  String get commentWriteTo => 'コメント先：';

  @override
  String get commentPosting => '投稿中…';

  @override
  String get commentPost => '投稿';

  @override
  String get commentPlaceholder => 'コメントを入力…';

  @override
  String commentReplyPlaceholder(String name) {
    return '$name に返信…';
  }

  @override
  String get profileLocalUnsupported => 'ローカル音楽にはプロフィールページがありません。';

  @override
  String profileSourceUnsupported(String name) {
    return '「$name」にはプロフィールページがありません。';
  }

  @override
  String profileSignInHint(String name) {
    return '「$name」にログインするとプロフィールを表示できます。';
  }

  @override
  String get profileTopArtists => 'よく聴くアーティスト';

  @override
  String get profileMostPlayed => 'よく聴く曲';

  @override
  String get profileMyPlaylists => '作成したプレイリスト';

  @override
  String signOutConfirmTitle(String name) {
    return '「$name」からログアウトしますか？';
  }

  @override
  String get signOutConfirmMessage =>
      'ログアウトするとこのソースのライブラリやプレイリストが表示されなくなります。\n再度ログインすると元に戻ります。';

  @override
  String signInDialogTitle(String name) {
    return '$name にログイン';
  }

  @override
  String get signInQrFailed => 'QR コードの生成に失敗しました';

  @override
  String get remoteNeedSignIn => 'ログインが必要です';

  @override
  String remoteErrorKind(String kind) {
    return 'エラー（$kind）';
  }

  @override
  String remotePluginMissing(String id) {
    return 'プラグイン $id が読み込まれていません。設定から再読み込みできます。';
  }

  @override
  String get remoteSwitchToLocalHint => '設定からローカル音楽に切り替えられます';

  @override
  String get remoteNoDiscover => 'このプラグインには見つけるページがありません。検索をお試しください。';

  @override
  String get remoteNoHome => 'このプラグインにはホームページがありません。検索をお試しください。';

  @override
  String get remoteNoContent => 'ここにはまだコンテンツがありません。';

  @override
  String get remotePlayAlbumFailed => 'このアルバムを再生できませんでした。後でお試しください';

  @override
  String get greetingLateNight => '夜更けですね';

  @override
  String get greetingMorning => 'おはようございます';

  @override
  String get greetingNoon => 'こんにちは';

  @override
  String get greetingAfternoon => 'こんにちは';

  @override
  String get greetingEvening => 'こんばんは';

  @override
  String get localRecentlyAdded => '最近追加した曲';

  @override
  String get localEmptyHint => '曲がありません。設定から音楽フォルダを追加してください';

  @override
  String get localArtistNotFound => 'アーティストが見つかりません';

  @override
  String get localFileMovedOrDeleted => 'ファイルが移動または削除されました';

  @override
  String get timeJustNow => 'たった今';

  @override
  String timeMinutesAgo(int count) {
    return '$count 分前';
  }

  @override
  String timeHoursAgo(int count) {
    return '$count 時間前';
  }

  @override
  String timeDaysAgo(int count) {
    return '$count 日前';
  }

  @override
  String timeMonthsAgo(int count) {
    return '$count か月前';
  }

  @override
  String timeYearsAgo(int count) {
    return '$count 年前';
  }

  @override
  String get timeToday => '今日';

  @override
  String get timeYesterday => '昨日';

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
    return 'ログインしました：$name';
  }

  @override
  String get toastNotSignedIn => 'ログインしていません';

  @override
  String get toastSignOutFailed => 'ログアウトに失敗しました';

  @override
  String get toastPlayAlbumFailed => 'このアルバムを再生できません';

  @override
  String get toastPlayPlaylistFailed => 'このプレイリストを再生できません';

  @override
  String toastPlaybackError(String error) {
    return '再生エラー：$error';
  }

  @override
  String toastCannotPlayTrack(String title) {
    return '「$title」を再生できません';
  }

  @override
  String toastStationEmpty(String name) {
    return '$name に曲がありません';
  }

  @override
  String toastStationOpenFailed(String name) {
    return '$name を開けません';
  }

  @override
  String toastAddedToPlaylist(String name) {
    return '「$name」に追加しました';
  }

  @override
  String toastAddToPlaylistFailed(String name) {
    return '「$name」に追加できませんでした';
  }

  @override
  String toastPlaylistCreated(String name) {
    return 'プレイリスト「$name」を作成しました';
  }

  @override
  String get toastCreatePlaylistFailed => 'プレイリストを作成できませんでした';

  @override
  String get toastRemovedFromPlaylist => 'プレイリストから削除しました';

  @override
  String get toastRemoveFromPlaylistFailed => 'プレイリストから削除できませんでした';

  @override
  String get toastNoSimilarFound => '似た曲が見つかりませんでした';

  @override
  String toastSimilarQueueName(String title) {
    return '「$title」に似た曲';
  }

  @override
  String get toastFindSimilarFailed => '似た曲を探せませんでした';

  @override
  String toastActionFailed(String title) {
    return '「$title」が失敗しました';
  }

  @override
  String get toastDisliked => '今後このような曲のおすすめを減らします';

  @override
  String toastDislikeFailed(String name) {
    return '$name に送信できませんでした';
  }

  @override
  String get toastLikeFailed => 'いいねできませんでした';

  @override
  String get toastUnlikeFailed => 'いいねを解除できませんでした';

  @override
  String get toastSaveAlbumFailed => 'アルバムを保存できませんでした';

  @override
  String get toastUnsaveAlbumFailed => '保存を解除できませんでした';

  @override
  String toastAlbumSaved(String title) {
    return '「$title」を保存しました';
  }

  @override
  String get toastAlbumUnsaved => '保存を解除しました';

  @override
  String pluginErrIdTaken(String id) {
    return 'id $id は既に使用されています';
  }

  @override
  String pluginErrMinAppVersion(String required, String current) {
    return 'YesPlayMusic $required 以降が必要です（現在：$current）';
  }

  @override
  String get pluginErrEmptyLink => 'リンクを入力してください';

  @override
  String get pluginErrInvalidLink => 'リンクを認識できません';

  @override
  String pluginErrDownloadNetwork(String error) {
    return 'ダウンロード失敗。ネットワークを確認してください：$error';
  }

  @override
  String pluginErrRepoNotFound(String slug) {
    return 'GitHub リポジトリ $slug が見つかりません';
  }

  @override
  String pluginErrNoManifestInPath(String path) {
    return '$path に plugin.json がありません';
  }

  @override
  String get pluginErrNoManifestInLink => 'このリンクに plugin.json が見つかりませんでした';

  @override
  String pluginErrMissingEntry(String file) {
    return 'エントリーファイル $file が見つかりません';
  }

  @override
  String pluginErrNotFoundUrl(String url) {
    return '$url が見つかりません';
  }

  @override
  String get pluginErrGithubRateLimit =>
      'GitHub がリクエストを一時拒否しました（アクセス制限）。しばらくしてから再試行してください';

  @override
  String pluginErrDownloadHttp(int code) {
    return 'ダウンロード失敗：HTTP $code';
  }

  @override
  String get pluginErrTooLarge => 'プラグインが大きすぎます（50 MB 超過）';

  @override
  String get pluginErrInvalidZip => 'ダウンロードしたファイルは有効な .zip ではありません';

  @override
  String pluginErrManifestJson(String error) {
    return 'plugin.json が正しい JSON ではありません：$error';
  }

  @override
  String get pluginErrManifestObject => 'plugin.json はオブジェクトである必要があります';

  @override
  String pluginErrManifestIdChars(String id) {
    return 'id \"$id\" には小文字英数字と . _ - のみ使用できます';
  }

  @override
  String get pluginErrManifestIdLocal => 'id \"local\" は予約されています';

  @override
  String get pluginErrManifestNoName => 'name がありません';

  @override
  String pluginErrManifestMain(String file) {
    return 'main \"$file\" はプラグインフォルダ内の .js ファイルである必要があります';
  }

  @override
  String pluginErrManifestIcon(String file) {
    return 'icon \"$file\" はプラグインフォルダ内の png / jpg / webp ファイルである必要があります';
  }

  @override
  String pluginErrStopped(String name) {
    return '$name は停止しました';
  }

  @override
  String pluginErrNoManifestDir(String dir) {
    return '$dir：plugin.json がありません';
  }

  @override
  String pluginErrMinVersionSimple(String name, String version) {
    return '$name には YesPlayMusic $version 以降が必要です';
  }

  @override
  String pluginErrProcessExited(String name) {
    return '$name：プラグインプロセスが予期せず終了しました';
  }

  @override
  String pluginErrNotObject(String name, String op) {
    return '$name.$op の戻り値がオブジェクトではありません';
  }

  @override
  String pluginErrNotArray(String name, String op) {
    return '$name.$op の戻り値が配列ではありません';
  }

  @override
  String pluginErrInvalidStreamUrl(String name) {
    return '$name が無効な再生 URL を返しました';
  }

  @override
  String pluginErrDuplicateId(String id) {
    return '他のプラグインと id が重複しています：$id';
  }

  @override
  String pluginErrTimeoutDisabled(int seconds) {
    return 'プラグインが $seconds 秒以上応答しないため無効化しました';
  }

  @override
  String get pluginErrOomDisabled => 'プラグインのメモリが不足したため無効化しました';

  @override
  String get pluginErrLoadTimeout => '読み込みがタイムアウトしました';

  @override
  String pluginErrOpTimeout(String op, int seconds) {
    return '$op がタイムアウトしました（$seconds 秒）';
  }

  @override
  String get pluginErrClosed => 'プラグインは終了しています';

  @override
  String sourceErrUnsupported(String name, String op) {
    return '$name は $op に対応していません';
  }

  @override
  String sourceErrNotFound(String source) {
    return 'ソースが見つかりません：$source';
  }
}
