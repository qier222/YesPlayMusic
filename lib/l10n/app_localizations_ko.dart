// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Korean (`ko`).
class AppLocalizationsKo extends AppLocalizations {
  AppLocalizationsKo([String locale = 'ko']) : super(locale);

  @override
  String get navHome => '홈';

  @override
  String get navDiscover => '탐색';

  @override
  String get navLibrary => '보관함';

  @override
  String get navSearch => '검색';

  @override
  String get navSearchPage => '검색';

  @override
  String get navSettings => '설정';

  @override
  String get navProfile => '프로필';

  @override
  String get actionPlay => '재생';

  @override
  String get actionPause => '일시정지';

  @override
  String get actionPlayAll => '모두 재생';

  @override
  String get actionShuffle => '셔플';

  @override
  String get actionNext => '다음 곡';

  @override
  String get actionPrev => '이전 곡';

  @override
  String get actionLike => '좋아요';

  @override
  String get actionUnlike => '좋아요 취소';

  @override
  String get actionSaveAlbum => '앨범 저장';

  @override
  String get actionUnsave => '저장 취소';

  @override
  String get actionFollow => '팔로우';

  @override
  String get actionFollowing => '팔로잉';

  @override
  String get actionMore => '더 보기';

  @override
  String get actionBack => '뒤로';

  @override
  String get actionClose => '닫기';

  @override
  String get actionCancel => '취소';

  @override
  String get actionConfirm => '확인';

  @override
  String get actionClear => '지우기';

  @override
  String get actionClearShort => '비우기';

  @override
  String get actionRetry => '다시 시도';

  @override
  String get actionOpen => '열기';

  @override
  String get actionSave => '저장';

  @override
  String get actionSaving => '저장 중…';

  @override
  String get actionDone => '완료';

  @override
  String get actionApply => '적용';

  @override
  String get actionCopy => '복사';

  @override
  String get actionReset => '초기화';

  @override
  String get actionAdd => '추가';

  @override
  String get actionSelect => '선택';

  @override
  String get actionAll => '전체';

  @override
  String get actionCollapse => '접기';

  @override
  String get actionExpandAllCategories => '모든 카테고리';

  @override
  String get actionPrevPage => '이전 페이지';

  @override
  String get actionNextPage => '다음 페이지';

  @override
  String get actionViewFullText => '전체 보기';

  @override
  String get actionShow => '표시';

  @override
  String get actionHide => '숨기기';

  @override
  String get actionReload => '새로고침';

  @override
  String get actionInstall => '설치';

  @override
  String get actionUpdate => '업데이트';

  @override
  String get actionUninstall => '제거';

  @override
  String get actionEnable => '활성화';

  @override
  String get actionSignIn => '로그인';

  @override
  String get actionSignOut => '로그아웃';

  @override
  String get actionManageSources => '음악 소스 관리';

  @override
  String get actionManagePlugins => '플러그인 관리';

  @override
  String get actionGoSearch => '검색으로 이동';

  @override
  String get actionLoadMore => '더 불러오기';

  @override
  String get stateLoading => '불러오는 중…';

  @override
  String get stateLoadingShort => '로딩 중…';

  @override
  String get stateLoadFailed => '불러오기 실패';

  @override
  String get stateCouldNotLoad => '불러올 수 없습니다';

  @override
  String get stateSigningIn => '로그인 중…';

  @override
  String get stateSigningInShort => '로그인 중…';

  @override
  String get stateSignedIn => '로그인됨';

  @override
  String get stateNotSignedIn => '로그인되지 않음';

  @override
  String get stateNone => '없음';

  @override
  String get statePleaseSelect => '선택하세요';

  @override
  String get stateCopied => '복사됨';

  @override
  String get stateSaved => '저장됨';

  @override
  String stateSaveFailed(String error) {
    return '저장 실패: $error';
  }

  @override
  String get miniShuffleOn => '셔플: 켜짐';

  @override
  String get miniRepeatOn => '전체 반복';

  @override
  String get miniRepeatOff => '반복 끄기';

  @override
  String get miniQueue => '재생목록';

  @override
  String get miniOpenNowPlaying => '지금 재생 중 열기';

  @override
  String get miniMute => '음소거';

  @override
  String get npTitle => '지금 재생 중';

  @override
  String get npComments => '댓글';

  @override
  String get npSimilar => '비슷한 곡';

  @override
  String npSimilarTo(String title) {
    return '$title과(와) 비슷한 곡';
  }

  @override
  String get npNoSimilar => '비슷한 곡을 찾지 못했습니다';

  @override
  String get npUpNext => '다음 재생';

  @override
  String get npQueueEmpty => '재생목록에 더 이상 곡이 없습니다';

  @override
  String get npFromPrefix => '출처: ';

  @override
  String get npViewAlbum => '앨범 보기';

  @override
  String get npViewArtist => '아티스트 보기';

  @override
  String get menuPlayNext => '다음에 재생';

  @override
  String get menuAddedNext => '다음 곡으로 추가됨';

  @override
  String get menuAddToQueue => '재생목록에 추가';

  @override
  String get menuAddedToQueue => '재생목록에 추가됨';

  @override
  String get menuAddToPlaylist => '플레이리스트에 추가';

  @override
  String get menuCreatePlaylist => '새 플레이리스트';

  @override
  String get menuPlaylistNamePlaceholder => '플레이리스트 이름';

  @override
  String get menuCreateAndAdd => '만들고 추가';

  @override
  String get menuPlaySimilar => '비슷한 곡 재생';

  @override
  String get menuDislike => '관심 없음';

  @override
  String get menuRemoveFromPlaylist => '플레이리스트에서 삭제';

  @override
  String get shortcutGroupPlayback => '재생';

  @override
  String get shortcutGroupUi => '인터페이스';

  @override
  String get shortcutGroupMediaKeys => '미디어 키';

  @override
  String get shortcutPlayPause => '재생 / 일시정지';

  @override
  String get shortcutSpaceKey => '스페이스';

  @override
  String get shortcutSeekForward => '5초 앞으로';

  @override
  String get shortcutSeekBackward => '5초 뒤로';

  @override
  String get shortcutVolumeUp => '볼륨 높이기';

  @override
  String get shortcutVolumeDown => '볼륨 낮추기';

  @override
  String get shortcutMute => '음소거';

  @override
  String get shortcutRepeat => '반복 모드';

  @override
  String get shortcutLikeCurrent => '현재 곡 좋아요';

  @override
  String get shortcutDismissOverlay => '재생 화면 / 팝업 닫기';

  @override
  String get shortcutBack => '뒤로';

  @override
  String get shortcutForward => '앞으로';

  @override
  String get shortcutSwitchTab => '사이드바 탭 전환';

  @override
  String get shortcutKeyRangeTo => '~';

  @override
  String get shortcutMediaKeysLabel => '키보드 미디어 키 및 이어폰 버튼';

  @override
  String get shortcutTypingHintMac => '텍스트 입력 중에는 ⌘F와 Esc만 작동합니다';

  @override
  String get shortcutTypingHintOther => '텍스트 입력 중에는 Ctrl+F와 Esc만 작동합니다';

  @override
  String get menuBarSettings => '설정…';

  @override
  String get menuBarView => '보기';

  @override
  String get menuBarWindow => '윈도우';

  @override
  String get swatchLilac => '라일락';

  @override
  String get swatchSky => '스카이';

  @override
  String get swatchMint => '민트';

  @override
  String get swatchSun => '선';

  @override
  String get swatchRose => '로즈';

  @override
  String get swatchFlame => '플레임';

  @override
  String get settingsGeneral => '일반';

  @override
  String get settingsShortcuts => '단축키';

  @override
  String get settingsPlugins => '플러그인';

  @override
  String get settingsAbout => '정보';

  @override
  String get settingsAppearance => '외관';

  @override
  String get settingsLyrics => '가사';

  @override
  String get settingsPlayback => '재생';

  @override
  String get settingsStorage => '저장 공간';

  @override
  String get settingsAccentColor => '강조 색상';

  @override
  String get settingsLanguage => '언어';

  @override
  String get langSystem => '시스템 설정 따르기';

  @override
  String get settingsMiniLyric => '미니 플레이어에 현재 가사 표시';

  @override
  String get settingsMinimizeToTray => '창을 닫을 때 트레이로 최소화';

  @override
  String aboutDownloadVersion(String version) {
    return '$version 다운로드';
  }

  @override
  String get aboutChecking => '확인 중…';

  @override
  String get aboutCheckUpdate => '업데이트 확인';

  @override
  String get aboutAutoCheck => '자동으로 업데이트 확인';

  @override
  String get aboutAnalytics => '익명 사용 통계 보내기';

  @override
  String get aboutSourceAndFeedback => '소스 코드 및 피드백';

  @override
  String aboutVersion(String version) {
    return '버전 $version';
  }

  @override
  String get aboutLogs => '로그 파일';

  @override
  String get aboutLogsHint => '문제 신고 시 첨부';

  @override
  String get aboutOpenFolder => '폴더 열기';

  @override
  String get aboutOpen => '열기';

  @override
  String updaterNewVersion(String version) {
    return '새 버전 $version 사용 가능';
  }

  @override
  String get updaterUpToDate => '최신 버전입니다';

  @override
  String get updaterCheckFailed => '업데이트 확인 실패';

  @override
  String storageClearTitle(String size) {
    return '캐시 $size를 지울까요?';
  }

  @override
  String get storageClearMessage =>
      'API, 오디오 및 이미지 캐시가 모두 삭제되며\n필요할 때 다시 가져옵니다.';

  @override
  String storageCleared(String size) {
    return '캐시 $size를 지웠습니다';
  }

  @override
  String storageLimit(String size) {
    return '/ $size 한도';
  }

  @override
  String storageApi(String size) {
    return 'API $size';
  }

  @override
  String storageAudio(String size) {
    return '오디오 $size';
  }

  @override
  String storageImage(String size) {
    return '이미지 $size';
  }

  @override
  String get storageClearing => '지우는 중…';

  @override
  String get storageClearCache => '캐시 지우기';

  @override
  String get sourceMusicSource => '음악 소스';

  @override
  String get sourceLocal => '로컬 음악';

  @override
  String get sourceLocalDesc => '컴퓨터에 저장된 음악 파일 재생';

  @override
  String get sourceBuiltIn => '내장';

  @override
  String get sourceInUse => '사용 중';

  @override
  String get sourceScanning => '스캔 중…';

  @override
  String get sourceNoFolders => '추가된 폴더 없음';

  @override
  String sourceFolderAlbums(int folders, int albums) {
    return '폴더 $folders개, 앨범 $albums개';
  }

  @override
  String get sourceAddFolderEllipsis => '음악 폴더 추가…';

  @override
  String get sourceAddFolder => '폴더 추가';

  @override
  String get sourceAddMusicFolder => '음악 폴더 추가';

  @override
  String get sourceRescan => '다시 스캔';

  @override
  String get sourceMusicFolders => '음악 폴더';

  @override
  String get sourceNoFoldersAdded => '아직 추가된 음악 폴더가 없습니다';

  @override
  String get sourceOpenInFileManager => '파일 관리자에서 열기';

  @override
  String get sourceShowInFileManager => '파일 관리자에서 보기';

  @override
  String get sourceStopScanningFolder => '이 폴더 스캔 중지';

  @override
  String sourceSwitchedTo(String name) {
    return '\"$name\"(으)로 전환됨';
  }

  @override
  String get sourceFolderAlreadyScanned => '이 폴더는 이미 스캔 대상에 포함되어 있습니다';

  @override
  String get sourceNoMusicFound => '음악을 찾지 못했습니다';

  @override
  String get sourceNotFound => '음악 소스를 찾을 수 없습니다';

  @override
  String pluginsLoadedToast(int count) {
    return '플러그인 $count개 불러옴';
  }

  @override
  String get pluginFind => '플러그인 찾기';

  @override
  String get pluginInstallTitle => '플러그인 설치';

  @override
  String get pluginTabInstalled => '설치됨';

  @override
  String get pluginTabOfficial => '공식 플러그인';

  @override
  String get pluginOpenDir => '플러그인 폴더 열기';

  @override
  String get pluginThirdPartyHint => '비공식 플러그인은 각 개발자가 관리합니다';

  @override
  String get pluginDevDocs => '플러그인 개발 문서 ›';

  @override
  String get pluginComingSoon => '출시 예정';

  @override
  String get pluginInstallFromLink => '링크로 설치';

  @override
  String get pluginInstallFromLinkHint => 'GitHub 저장소, Release 또는 .zip';

  @override
  String pluginUninstallTitle(String name) {
    return '\"$name\"을(를) 제거할까요?';
  }

  @override
  String get pluginUninstallMessage => '플러그인 설정과 로그인 정보도 함께 삭제됩니다';

  @override
  String pluginUninstalled(String name) {
    return '\"$name\" 제거됨';
  }

  @override
  String pluginUpdateAvailable(String version) {
    return '$version(으)로 업데이트 가능';
  }

  @override
  String pluginNeedSetting(String field) {
    return '$field 입력 필요';
  }

  @override
  String pluginSignedInAs(String name) {
    return '$name(으)로 로그인됨';
  }

  @override
  String pluginDisabledToast(String name) {
    return '\"$name\" 비활성화됨';
  }

  @override
  String pluginEnabledToast(String name) {
    return '\"$name\" 활성화됨';
  }

  @override
  String get pluginHasUpdate => '업데이트';

  @override
  String get pluginSignInAccount => '계정 로그인';

  @override
  String get pluginSettingsEllipsis => '플러그인 설정…';

  @override
  String get pluginDisable => '플러그인 비활성화';

  @override
  String get pluginReload => '플러그인 새로고침';

  @override
  String get pluginUninstallEllipsis => '플러그인 제거…';

  @override
  String get pluginDeleteEllipsis => '플러그인 삭제…';

  @override
  String get pluginDisabledBadge => '비활성';

  @override
  String get pluginNotLoadedBadge => '로드 안 됨';

  @override
  String get pluginNotLoadedStatus => '플러그인을 불러오지 못했습니다';

  @override
  String get pluginEmptyTitle => '설치된 플러그인이 없습니다';

  @override
  String get pluginEmptyHint => 'GitHub 링크 지원';

  @override
  String get pluginSettingsTitle => '플러그인 설정';

  @override
  String get pluginSectionAccount => '계정';

  @override
  String get pluginSectionCapabilities => '기능';

  @override
  String get pluginSectionPermissions => '권한';

  @override
  String get pluginDisabledHint => '플러그인이 비활성화되어 있습니다. 활성화하면 적용됩니다';

  @override
  String get pluginUninstallBtn => '플러그인 제거';

  @override
  String get pluginSignInSyncHint => '로그인하여 즐겨찾기와 플레이리스트 동기화';

  @override
  String get pluginGetIt => '받기 ›';

  @override
  String pluginUpdatedToast(String name) {
    return '\"$name\" 업데이트됨';
  }

  @override
  String pluginInstalledToast(String name) {
    return '\"$name\" 설치됨';
  }

  @override
  String pluginInstallFailed(String error) {
    return '설치 실패: $error';
  }

  @override
  String get pluginInstallPrompt => 'GitHub 저장소 주소 또는\n플러그인 다운로드 링크를 붙여넣으세요';

  @override
  String get pluginInstallPlaceholder => 'github.com/owner/repo';

  @override
  String get pluginInstallSupportHint =>
      'GitHub 저장소, Release, plugin.json 및 .zip 링크 지원';

  @override
  String get pluginReading => '읽는 중…';

  @override
  String get pluginNextStep => '다음';

  @override
  String get pluginInstallFromLocal => '로컬 폴더에서 설치…';

  @override
  String pluginPublishedAgo(String ago) {
    return ', $ago 게시됨';
  }

  @override
  String get pluginLocalFolder => '로컬 폴더';

  @override
  String get pluginLatestCode => '최신 코드';

  @override
  String pluginInstalledVersion(String version) {
    return '설치됨 $version';
  }

  @override
  String get pluginPermissionsNeeded => '필요한 권한';

  @override
  String get pluginPermNoNetwork => '네트워크 접근 없음';

  @override
  String get pluginPermNoNetworkDetail => '어떤 웹사이트에도 연결하지 않음';

  @override
  String get pluginPermAnyWebsite => '모든 웹사이트 접근';

  @override
  String get pluginPermAnyWebsiteDetail => '모든 웹사이트에 연결 가능';

  @override
  String get pluginPermAnyWebsiteFull => '모든 웹사이트에 접근 가능';

  @override
  String get pluginPermNetwork => '네트워크 접근';

  @override
  String get pluginPermSignInDetail => '로그인 페이지를 열고 로그인 후 쿠키를 읽습니다';

  @override
  String get pluginPermProcess => '로컬 프로그램 실행';

  @override
  String get pluginPermProcessBadge => '별도 허용 필요';

  @override
  String pluginPermProcessDetail(String programs) {
    return '$programs. 기본 꺼짐, 플러그인 설정에서 켤 수 있음';
  }

  @override
  String get pluginPermStorage => '데이터 저장';

  @override
  String get pluginPermStorageDetail => '설정, 로그인 상태 및 캐시 저장';

  @override
  String get pluginCapabilitiesProvided => '제공하는 기능';

  @override
  String get pluginNavIconHint => '아이콘이 있는 항목은 사이드바에 추가됩니다';

  @override
  String get pluginTrustHint => '신뢰할 수 있는 출처의 플러그인만 설치하세요';

  @override
  String get pluginInstalling => '설치 중…';

  @override
  String get pluginYourServer => '설정한 서버';

  @override
  String pluginCanAccessHosts(String hosts) {
    return '$hosts 접근 가능';
  }

  @override
  String pluginCanAccessHostsMore(String hosts, int count) {
    return '$hosts 외 총 $count개 접근 가능';
  }

  @override
  String get pluginOnlyYourServer => '설정에서 지정한 서버에만 접근';

  @override
  String pluginAndYourServer(String hosts) {
    return '$hosts 및 설정에서 지정한 서버';
  }

  @override
  String get pluginAnyProgram => '임의의 로컬 프로그램';

  @override
  String get officialJellyfinDesc => 'Jellyfin 서버에 연결';

  @override
  String get officialPlexDesc => 'Plex Media Server에 연결';

  @override
  String get officialSubsonicDesc => 'Navidrome 등 Subsonic 서버에 연결';

  @override
  String get officialEmbyDesc => 'Emby 서버에 연결';

  @override
  String get capSuggest => '검색 제안';

  @override
  String get capLyrics => '가사';

  @override
  String get capPlaylist => '플레이리스트';

  @override
  String get capEditPlaylist => '플레이리스트 편집';

  @override
  String get capFavorites => '즐겨찾기';

  @override
  String get capAlbum => '앨범';

  @override
  String get capArtist => '아티스트';

  @override
  String get capRadio => '라디오';

  @override
  String get capSimilar => '비슷한 곡 추천';

  @override
  String get capHistory => '재생 기록';

  @override
  String get capDislike => '관심 없음';

  @override
  String get capTrackMenu => '곡 메뉴';

  @override
  String get mcpPortRangeError => '포트 번호는 1024 ~ 65535 사이여야 합니다';

  @override
  String mcpPortUpdated(int port) {
    return '포트가 $port(으)로 업데이트되었습니다';
  }

  @override
  String mcpCopiedLabel(String label) {
    return '$label 복사됨';
  }

  @override
  String mcpRunning(String url) {
    return '실행 중 · $url';
  }

  @override
  String get mcpStopped => '중지됨';

  @override
  String get mcpEnableLocal => '로컬 MCP 서버 활성화';

  @override
  String get mcpEnableHint => '127.0.0.1에서만 수신하며 외부 AI 클라이언트가 재생과 검색을 제어합니다';

  @override
  String mcpSessions(int count) {
    return '$count개 세션';
  }

  @override
  String get mcpListenPort => '수신 포트';

  @override
  String get mcpPortHint => '기본값 18888 (Streamable HTTP)';

  @override
  String get mcpLazyMode => 'MCP 지연 로딩 모드';

  @override
  String mcpLazyHintOn(int core, int lazy) {
    return '초기에 핵심 도구 $core개만 노출 + 필요 시 확장 도구 $lazy개 탐색';
  }

  @override
  String mcpLazyHintOff(int total) {
    return '현재 음악 소스가 지원하는 전체 $total개 도구를 모두 노출';
  }

  @override
  String get mcpReadOnly => '읽기 전용 안전 모드';

  @override
  String get mcpReadOnlyHint => '플레이리스트 수정, 댓글 작성, 좋아요 등 쓰기 작업 차단';

  @override
  String get mcpAuthSection => '보안 인증';

  @override
  String get mcpRequireToken => 'Bearer Token 요구';

  @override
  String get mcpRequireTokenHint =>
      '활성화 시 클라이언트는 Authorization: Bearer <token> 헤더를 포함해야 합니다';

  @override
  String get mcpHttpConfigTitle => '클라이언트 설정 (Streamable HTTP)';

  @override
  String get mcpHttpConfigDesc =>
      'Antigravity, Cursor, Claude 등 HTTP MCP 지원 클라이언트용:';

  @override
  String get mcpCopyHttpConfig => 'HTTP 설정 복사';

  @override
  String get mcpHttpConfigLabel => 'Streamable HTTP 설정';

  @override
  String get mcpStdioConfigTitle => 'Stdio 브리지 설정 (자동 실행 지원)';

  @override
  String get mcpStdioConfigDesc =>
      'stdio 전용 클라이언트용. 앱이 꺼져 있을 때 요청이 오면 자동으로 백그라운드에서 실행됩니다:';

  @override
  String get mcpCopyStdioConfig => 'Stdio 브리지 설정 복사';

  @override
  String get mcpStdioConfigLabel => 'Stdio 브리지 설정';

  @override
  String mcpPortStartFailed(int port, String error) {
    return '포트 $port 시작 실패: $error';
  }

  @override
  String get tabSongs => '노래';

  @override
  String get tabAlbums => '앨범';

  @override
  String get tabPlaylists => '플레이리스트';

  @override
  String get tabArtists => '아티스트';

  @override
  String get tabArtistSearch => '아티스트';

  @override
  String get sortTitleAZ => '제목 A-Z';

  @override
  String get sortReleaseDate => '발매일';

  @override
  String get sortDefault => '기본';

  @override
  String get sortAlbumAZ => '앨범 A-Z';

  @override
  String get libraryEmptyTitle => '보관함이 비어 있습니다';

  @override
  String get libraryAddSource => '음악 소스 추가';

  @override
  String get libraryNoAlbums => '아직 앨범이 없습니다';

  @override
  String get libraryNoSongs => '아직 노래가 없습니다';

  @override
  String get libraryNoPlaylists => '아직 플레이리스트가 없습니다';

  @override
  String get libraryNoArtists => '아직 아티스트가 없습니다';

  @override
  String get libraryEarlier => '이전';

  @override
  String get libraryCreatedByMe => '내가 만든 항목';

  @override
  String get libraryCollected => '저장한 항목';

  @override
  String countTracks(int count) {
    return '$count곡';
  }

  @override
  String countSongs(int count) {
    return '$count곡';
  }

  @override
  String countAlbums(int count) {
    return '앨범 $count개';
  }

  @override
  String countPlays(String count) {
    return '$count회';
  }

  @override
  String countComments(String count) {
    return '댓글 $count개';
  }

  @override
  String durationHours(int count) {
    return '$count시간';
  }

  @override
  String durationMinutes(int count) {
    return '$count분';
  }

  @override
  String albumTracksDuration(int tracks, int minutes) {
    return '$tracks곡 · $minutes분';
  }

  @override
  String get albumNotFound => '앨범을 찾을 수 없습니다';

  @override
  String get albumKindAlbum => '앨범';

  @override
  String get albumKindSingle => '싱글';

  @override
  String get albumKindCompilation => '컴필레이션';

  @override
  String get albumTracksTitle => '트랙';

  @override
  String albumReleasedIn(int year) {
    return '$year년 발매';
  }

  @override
  String albumReleasedOn(String date) {
    return '$date 발매';
  }

  @override
  String artistFollowed(String name) {
    return '$name을(를) 팔로우했습니다';
  }

  @override
  String get artistUnfollowed => '팔로우를 취소했습니다';

  @override
  String get artistFollowFailed => '팔로우할 수 없습니다. 나중에 다시 시도하세요';

  @override
  String get artistUnfollowFailed => '팔로우 취소할 수 없습니다. 나중에 다시 시도하세요';

  @override
  String get artistSimilar => '비슷한 아티스트';

  @override
  String artistHotTracksOf(String name) {
    return '$name의 인기곡';
  }

  @override
  String get artistLatestRelease => '최신 발매';

  @override
  String get artistHotTracks => '인기곡';

  @override
  String get artistSinglesAndEps => '싱글 및 EP';

  @override
  String get playlistSearchPlaceholder => '플레이리스트 내 검색';

  @override
  String get playlistColTitle => '제목';

  @override
  String get playlistColAlbum => '앨범';

  @override
  String get playlistColAdded => '추가된 날짜';

  @override
  String get playlistEmpty => '플레이리스트에 노래가 없습니다';

  @override
  String playlistNoMatch(String query) {
    return '\"$query\"에 대한 결과가 없습니다';
  }

  @override
  String playlistTagCount(String tag, int count) {
    return '\"$tag\"에 $count곡이 있습니다';
  }

  @override
  String get searchPlaceholder => '노래, 앨범, 아티스트, 플레이리스트 검색';

  @override
  String get searchUnsupported => '이 플러그인은 검색을 지원하지 않습니다.';

  @override
  String get searchRecent => '최근 검색';

  @override
  String get searchRecentResults => '최근 검색 결과';

  @override
  String get searchHot => '인기 검색어';

  @override
  String get searchRemoveHistory => '기록에서 삭제';

  @override
  String searchNoResults(String query) {
    return '\"$query\"에 대한 검색 결과가 없습니다';
  }

  @override
  String searchViewAllSongs(int count) {
    return '노래 $count곡 모두 보기';
  }

  @override
  String searchViewAllAlbums(int count) {
    return '앨범 $count개 모두 보기';
  }

  @override
  String searchAllCount(int count) {
    return '전체 $count';
  }

  @override
  String searchQueueName(String query) {
    return '검색 \"$query\"';
  }

  @override
  String searchMcpQueueName(String query) {
    return '검색: $query';
  }

  @override
  String get commentSortHot => '인기순';

  @override
  String get commentSortLatest => '최신순';

  @override
  String get commentWrite => '댓글 작성';

  @override
  String get commentEmpty => '아직 댓글이 없습니다';

  @override
  String get commentLoadFailed => '댓글을 불러오지 못했습니다';

  @override
  String get commentLikeFailed => '좋아요 실패';

  @override
  String get commentAnonymous => '익명';

  @override
  String get commentReply => '답글';

  @override
  String get commentPosted => '댓글이 등록되었습니다';

  @override
  String get commentReplyPosted => '답글이 등록되었습니다';

  @override
  String get commentPostFailed => '등록 실패';

  @override
  String get commentWriteTo => '작성 대상:';

  @override
  String get commentPosting => '등록 중…';

  @override
  String get commentPost => '등록';

  @override
  String get commentPlaceholder => '댓글을 입력하세요…';

  @override
  String commentReplyPlaceholder(String name) {
    return '$name님에게 답글…';
  }

  @override
  String get profileLocalUnsupported => '로컬 음악에는 프로필 페이지가 없습니다.';

  @override
  String profileSourceUnsupported(String name) {
    return '\"$name\"에는 프로필 페이지가 없습니다.';
  }

  @override
  String profileSignInHint(String name) {
    return '\"$name\"에 로그인하면 프로필을 볼 수 있습니다.';
  }

  @override
  String get profileTopArtists => '자주 듣는 아티스트';

  @override
  String get profileMostPlayed => '자주 듣는 노래';

  @override
  String get profileMyPlaylists => '내가 만든 플레이리스트';

  @override
  String signOutConfirmTitle(String name) {
    return '\"$name\"에서 로그아웃할까요?';
  }

  @override
  String get signOutConfirmMessage =>
      '로그아웃하면 이 소스의 보관함, 플레이리스트 및 추천 항목이 숨겨집니다.\n다시 로그인하면 복원됩니다.';

  @override
  String signInDialogTitle(String name) {
    return '$name 로그인';
  }

  @override
  String get signInQrFailed => 'QR 코드 생성 실패';

  @override
  String get remoteNeedSignIn => '로그인이 필요합니다';

  @override
  String remoteErrorKind(String kind) {
    return '오류 ($kind)';
  }

  @override
  String remotePluginMissing(String id) {
    return '플러그인 $id이(가) 로드되지 않았습니다. 설정에서 다시 불러올 수 있습니다.';
  }

  @override
  String get remoteSwitchToLocalHint => '설정에서 로컬 음악으로 전환할 수 있습니다';

  @override
  String get remoteNoDiscover => '이 플러그인에는 탐색 페이지가 없습니다. 검색을 이용해 보세요.';

  @override
  String get remoteNoHome => '이 플러그인에는 홈 페이지가 없습니다. 검색을 이용해 보세요.';

  @override
  String get remoteNoContent => '표시할 콘텐츠가 없습니다.';

  @override
  String get remotePlayAlbumFailed => '이 앨범을 재생할 수 없습니다. 나중에 다시 시도하세요';

  @override
  String get greetingLateNight => '늦은 밤이에요';

  @override
  String get greetingMorning => '좋은 아침입니다';

  @override
  String get greetingNoon => '좋은 점심입니다';

  @override
  String get greetingAfternoon => '좋은 오후입니다';

  @override
  String get greetingEvening => '좋은 저녁입니다';

  @override
  String get localRecentlyAdded => '최근 추가됨';

  @override
  String get localEmptyHint => '아직 노래가 없습니다. 설정에서 음악 폴더를 추가하세요';

  @override
  String get localArtistNotFound => '아티스트를 찾을 수 없습니다';

  @override
  String get localFileMovedOrDeleted => '파일이 이동되었거나 삭제되었습니다';

  @override
  String get timeJustNow => '방금 전';

  @override
  String timeMinutesAgo(int count) {
    return '$count분 전';
  }

  @override
  String timeHoursAgo(int count) {
    return '$count시간 전';
  }

  @override
  String timeDaysAgo(int count) {
    return '$count일 전';
  }

  @override
  String timeMonthsAgo(int count) {
    return '$count개월 전';
  }

  @override
  String timeYearsAgo(int count) {
    return '$count년 전';
  }

  @override
  String get timeToday => '오늘';

  @override
  String get timeYesterday => '어제';

  @override
  String dateYear(int year) {
    return '$year년';
  }

  @override
  String dateYearMonth(int year, int month) {
    return '$year년 $month월';
  }

  @override
  String dateMonthDay(int month, int day) {
    return '$month월 $day일';
  }

  @override
  String dateYearMonthDay(int year, int month, int day) {
    return '$year년 $month월 $day일';
  }

  @override
  String toastSignedInAs(String name) {
    return '로그인됨: $name';
  }

  @override
  String get toastNotSignedIn => '로그인되지 않음';

  @override
  String get toastSignOutFailed => '로그아웃 실패';

  @override
  String get toastPlayAlbumFailed => '이 앨범을 재생할 수 없습니다';

  @override
  String get toastPlayPlaylistFailed => '이 플레이리스트를 재생할 수 없습니다';

  @override
  String toastPlaybackError(String error) {
    return '재생 오류: $error';
  }

  @override
  String toastCannotPlayTrack(String title) {
    return '\"$title\"을(를) 재생할 수 없습니다';
  }

  @override
  String toastStationEmpty(String name) {
    return '$name에 노래가 없습니다';
  }

  @override
  String toastStationOpenFailed(String name) {
    return '$name을(를) 열 수 없습니다';
  }

  @override
  String toastAddedToPlaylist(String name) {
    return '\"$name\"에 추가됨';
  }

  @override
  String toastAddToPlaylistFailed(String name) {
    return '\"$name\"에 추가할 수 없습니다';
  }

  @override
  String toastPlaylistCreated(String name) {
    return '플레이리스트 \"$name\" 생성됨';
  }

  @override
  String get toastCreatePlaylistFailed => '플레이리스트를 만들 수 없습니다';

  @override
  String get toastRemovedFromPlaylist => '플레이리스트에서 삭제됨';

  @override
  String get toastRemoveFromPlaylistFailed => '플레이리스트에서 삭제할 수 없습니다';

  @override
  String get toastNoSimilarFound => '비슷한 곡을 찾지 못했습니다';

  @override
  String toastSimilarQueueName(String title) {
    return '\"$title\"과(와) 비슷한 곡';
  }

  @override
  String get toastFindSimilarFailed => '비슷한 곡을 찾을 수 없습니다';

  @override
  String toastActionFailed(String title) {
    return '\"$title\" 실패';
  }

  @override
  String get toastDisliked => '앞으로 이런 곡을 덜 추천합니다';

  @override
  String toastDislikeFailed(String name) {
    return '$name에 알릴 수 없습니다';
  }

  @override
  String get toastLikeFailed => '좋아요할 수 없습니다';

  @override
  String get toastUnlikeFailed => '좋아요 취소할 수 없습니다';

  @override
  String get toastSaveAlbumFailed => '앨범을 저장할 수 없습니다';

  @override
  String get toastUnsaveAlbumFailed => '저장을 취소할 수 없습니다';

  @override
  String toastAlbumSaved(String title) {
    return '\"$title\" 저장됨';
  }

  @override
  String get toastAlbumUnsaved => '저장 취소됨';

  @override
  String pluginErrIdTaken(String id) {
    return 'id $id이(가) 이미 사용 중입니다';
  }

  @override
  String pluginErrMinAppVersion(String required, String current) {
    return 'YesPlayMusic $required 이상이 필요합니다 (현재: $current)';
  }

  @override
  String get pluginErrEmptyLink => '링크를 입력하세요';

  @override
  String get pluginErrInvalidLink => '인식할 수 없는 링크입니다';

  @override
  String pluginErrDownloadNetwork(String error) {
    return '다운로드 실패, 네트워크를 확인하세요: $error';
  }

  @override
  String pluginErrRepoNotFound(String slug) {
    return 'GitHub 저장소 $slug을(를) 찾을 수 없습니다';
  }

  @override
  String pluginErrNoManifestInPath(String path) {
    return '$path에 plugin.json이 없습니다';
  }

  @override
  String get pluginErrNoManifestInLink => '이 링크에서 plugin.json을 찾을 수 없습니다';

  @override
  String pluginErrMissingEntry(String file) {
    return '진입 파일 $file이(가) 없습니다';
  }

  @override
  String pluginErrNotFoundUrl(String url) {
    return '$url을(를) 찾을 수 없습니다';
  }

  @override
  String get pluginErrGithubRateLimit =>
      'GitHub가 요청을 일시 거부했습니다(요청 한도 초과). 나중에 다시 시도하세요';

  @override
  String pluginErrDownloadHttp(int code) {
    return '다운로드 실패: HTTP $code';
  }

  @override
  String get pluginErrTooLarge => '플러그인이 너무 큽니다 (50 MB 초과)';

  @override
  String get pluginErrInvalidZip => '다운로드한 파일이 유효한 .zip이 아닙니다';

  @override
  String pluginErrManifestJson(String error) {
    return 'plugin.json이 유효한 JSON이 아닙니다: $error';
  }

  @override
  String get pluginErrManifestObject => 'plugin.json은 객체여야 합니다';

  @override
  String pluginErrManifestIdChars(String id) {
    return 'id \"$id\"에는 소문자, 숫자 및 . _ -만 사용할 수 있습니다';
  }

  @override
  String get pluginErrManifestIdLocal => 'id \"local\"은 예약어입니다';

  @override
  String get pluginErrManifestNoName => 'name이 없습니다';

  @override
  String pluginErrManifestMain(String file) {
    return 'main \"$file\"은(는) 플러그인 폴더 내의 .js 파일이어야 합니다';
  }

  @override
  String pluginErrManifestIcon(String file) {
    return 'icon \"$file\"은(는) 플러그인 폴더 내의 png, jpg 또는 webp 파일이어야 합니다';
  }

  @override
  String pluginErrStopped(String name) {
    return '$name이(가) 중지되었습니다';
  }

  @override
  String pluginErrNoManifestDir(String dir) {
    return '$dir: plugin.json이 없습니다';
  }

  @override
  String pluginErrMinVersionSimple(String name, String version) {
    return '$name에는 YesPlayMusic $version 이상이 필요합니다';
  }

  @override
  String pluginErrProcessExited(String name) {
    return '$name: 플러그인 프로세스가 예기치 않게 종료되었습니다';
  }

  @override
  String pluginErrNotObject(String name, String op) {
    return '$name.$op이(가) 객체를 반환하지 않았습니다';
  }

  @override
  String pluginErrNotArray(String name, String op) {
    return '$name.$op이(가) 배열을 반환하지 않았습니다';
  }

  @override
  String pluginErrInvalidStreamUrl(String name) {
    return '$name이(가) 잘못된 재생 URL을 반환했습니다';
  }

  @override
  String pluginErrDuplicateId(String id) {
    return '다른 플러그인과 id가 중복됩니다: $id';
  }

  @override
  String pluginErrTimeoutDisabled(int seconds) {
    return '플러그인이 $seconds초 이상 응답하지 않아 비활성화되었습니다';
  }

  @override
  String get pluginErrOomDisabled => '플러그인 메모리가 부족하여 비활성화되었습니다';

  @override
  String get pluginErrLoadTimeout => '불러오기 시간 초과';

  @override
  String pluginErrOpTimeout(String op, int seconds) {
    return '$op 시간 초과 ($seconds초)';
  }

  @override
  String get pluginErrClosed => '플러그인이 종료되었습니다';

  @override
  String sourceErrUnsupported(String name, String op) {
    return '$name에서 $op을(를) 지원하지 않습니다';
  }

  @override
  String sourceErrNotFound(String source) {
    return '소스를 찾을 수 없습니다: $source';
  }
}
