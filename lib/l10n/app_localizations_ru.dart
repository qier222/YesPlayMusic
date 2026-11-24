// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Russian (`ru`).
class AppLocalizationsRu extends AppLocalizations {
  AppLocalizationsRu([String locale = 'ru']) : super(locale);

  @override
  String get navHome => 'Главная';

  @override
  String get navDiscover => 'Обзор';

  @override
  String get navLibrary => 'Медиатека';

  @override
  String get navSearch => 'Поиск';

  @override
  String get navSearchPage => 'Поиск';

  @override
  String get navSettings => 'Настройки';

  @override
  String get navProfile => 'Профиль';

  @override
  String get actionPlay => 'Воспроизвести';

  @override
  String get actionPause => 'Пауза';

  @override
  String get actionPlayAll => 'Воспроизвести всё';

  @override
  String get actionShuffle => 'Перемешать';

  @override
  String get actionNext => 'Следующий';

  @override
  String get actionPrev => 'Предыдущий';

  @override
  String get actionLike => 'Нравится';

  @override
  String get actionUnlike => 'Убрать из любимых';

  @override
  String get actionSaveAlbum => 'Сохранить альбом';

  @override
  String get actionUnsave => 'Удалить из медиатеки';

  @override
  String get actionFollow => 'Подписаться';

  @override
  String get actionFollowing => 'Вы подписаны';

  @override
  String get actionMore => 'Ещё';

  @override
  String get actionBack => 'Назад';

  @override
  String get actionClose => 'Закрыть';

  @override
  String get actionCancel => 'Отмена';

  @override
  String get actionConfirm => 'ОК';

  @override
  String get actionClear => 'Очистить';

  @override
  String get actionClearShort => 'Очистить';

  @override
  String get actionRetry => 'Повторить';

  @override
  String get actionOpen => 'Открыть';

  @override
  String get actionSave => 'Сохранить';

  @override
  String get actionSaving => 'Сохранение…';

  @override
  String get actionDone => 'Готово';

  @override
  String get actionApply => 'Применить';

  @override
  String get actionCopy => 'Копировать';

  @override
  String get actionReset => 'Сбросить';

  @override
  String get actionAdd => 'Добавить';

  @override
  String get actionSelect => 'Выбрать';

  @override
  String get actionAll => 'Все';

  @override
  String get actionCollapse => 'Свернуть';

  @override
  String get actionExpandAllCategories => 'Все категории';

  @override
  String get actionPrevPage => 'Назад';

  @override
  String get actionNextPage => 'Вперёд';

  @override
  String get actionViewFullText => 'Читать полностью';

  @override
  String get actionShow => 'Показать';

  @override
  String get actionHide => 'Скрыть';

  @override
  String get actionReload => 'Перезагрузить';

  @override
  String get actionInstall => 'Установить';

  @override
  String get actionUpdate => 'Обновить';

  @override
  String get actionUninstall => 'Удалить';

  @override
  String get actionEnable => 'Включить';

  @override
  String get actionSignIn => 'Войти';

  @override
  String get actionSignOut => 'Выйти';

  @override
  String get actionManageSources => 'Управление источниками';

  @override
  String get actionManagePlugins => 'Управление плагинами';

  @override
  String get actionGoSearch => 'Перейти к поиску';

  @override
  String get actionLoadMore => 'Загрузить ещё';

  @override
  String get stateLoading => 'Загрузка…';

  @override
  String get stateLoadingShort => 'Загрузка…';

  @override
  String get stateLoadFailed => 'Ошибка загрузки';

  @override
  String get stateCouldNotLoad => 'Не удалось загрузить';

  @override
  String get stateSigningIn => 'Вход…';

  @override
  String get stateSigningInShort => 'Вход…';

  @override
  String get stateSignedIn => 'Выполнен вход';

  @override
  String get stateNotSignedIn => 'Вход не выполнен';

  @override
  String get stateNone => 'Нет';

  @override
  String get statePleaseSelect => 'Выберите';

  @override
  String get stateCopied => 'Скопировано';

  @override
  String get stateSaved => 'Сохранено';

  @override
  String stateSaveFailed(String error) {
    return 'Ошибка сохранения: $error';
  }

  @override
  String get miniShuffleOn => 'Перемешивание: вкл.';

  @override
  String get miniRepeatOn => 'Повторять всё';

  @override
  String get miniRepeatOff => 'Без повтора';

  @override
  String get miniQueue => 'Очередь';

  @override
  String get miniOpenNowPlaying => 'Открыть текущий трек';

  @override
  String get miniMute => 'Без звука';

  @override
  String get npTitle => 'Сейчас играет';

  @override
  String get npComments => 'Комментарии';

  @override
  String get npSimilar => 'Похожие';

  @override
  String npSimilarTo(String title) {
    return 'Похожие на $title';
  }

  @override
  String get npNoSimilar => 'Похожие треки не найдены';

  @override
  String get npUpNext => 'Далее';

  @override
  String get npQueueEmpty => 'В очереди больше нет треков';

  @override
  String get npFromPrefix => 'Из ';

  @override
  String get npViewAlbum => 'К альбому';

  @override
  String get npViewArtist => 'К исполнителю';

  @override
  String get menuPlayNext => 'Воспроизвести следующим';

  @override
  String get menuAddedNext => 'Будет воспроизведён следующим';

  @override
  String get menuAddToQueue => 'Добавить в очередь';

  @override
  String get menuAddedToQueue => 'Добавлено в очередь';

  @override
  String get menuAddToPlaylist => 'Добавить в плейлист';

  @override
  String get menuCreatePlaylist => 'Новый плейлист';

  @override
  String get menuPlaylistNamePlaceholder => 'Название плейлиста';

  @override
  String get menuCreateAndAdd => 'Создать и добавить';

  @override
  String get menuPlaySimilar => 'Воспроизвести похожие';

  @override
  String get menuDislike => 'Не нравится';

  @override
  String get menuRemoveFromPlaylist => 'Удалить из плейлиста';

  @override
  String get shortcutGroupPlayback => 'Воспроизведение';

  @override
  String get shortcutGroupUi => 'Интерфейс';

  @override
  String get shortcutGroupMediaKeys => 'Медиаклавиши';

  @override
  String get shortcutPlayPause => 'Воспроизведение / Пауза';

  @override
  String get shortcutSpaceKey => 'Пробел';

  @override
  String get shortcutSeekForward => 'Вперёд на 5 с';

  @override
  String get shortcutSeekBackward => 'Назад на 5 с';

  @override
  String get shortcutVolumeUp => 'Громче';

  @override
  String get shortcutVolumeDown => 'Тише';

  @override
  String get shortcutMute => 'Без звука';

  @override
  String get shortcutRepeat => 'Режим повтора';

  @override
  String get shortcutLikeCurrent => 'Лайкнуть текущий трек';

  @override
  String get shortcutDismissOverlay => 'Закрыть экран / окно';

  @override
  String get shortcutBack => 'Назад';

  @override
  String get shortcutForward => 'Вперёд';

  @override
  String get shortcutSwitchTab => 'Переключить вкладку';

  @override
  String get shortcutKeyRangeTo => 'до';

  @override
  String get shortcutMediaKeysLabel => 'Медиаклавиши клавиатуры и наушников';

  @override
  String get shortcutTypingHintMac =>
      'При вводе текста работают только ⌘F и Esc';

  @override
  String get shortcutTypingHintOther =>
      'При вводе текста работают только Ctrl+F и Esc';

  @override
  String get menuBarSettings => 'Настройки…';

  @override
  String get menuBarView => 'Вид';

  @override
  String get menuBarWindow => 'Окно';

  @override
  String get swatchLilac => 'Сирень';

  @override
  String get swatchSky => 'Небо';

  @override
  String get swatchMint => 'Мята';

  @override
  String get swatchSun => 'Солнце';

  @override
  String get swatchRose => 'Роза';

  @override
  String get swatchFlame => 'Пламя';

  @override
  String get settingsGeneral => 'Основные';

  @override
  String get settingsShortcuts => 'Горячие клавиши';

  @override
  String get settingsPlugins => 'Плагины';

  @override
  String get settingsAbout => 'О программе';

  @override
  String get settingsAppearance => 'Внешний вид';

  @override
  String get settingsLyrics => 'Тексты песен';

  @override
  String get settingsPlayback => 'Воспроизведение';

  @override
  String get settingsStorage => 'Хранилище';

  @override
  String get settingsAccentColor => 'Акцентный цвет';

  @override
  String get settingsLanguage => 'Язык';

  @override
  String get langSystem => 'Как в системе';

  @override
  String get settingsMiniLyric => 'Всегда показывать текст в мини-плеере';

  @override
  String get settingsKeepRunning => 'Работать в фоне после закрытия окна';

  @override
  String get trayShowWindow => 'Показать окно';

  @override
  String get trayQuit => 'Выйти';

  @override
  String aboutDownloadVersion(String version) {
    return 'Скачать $version';
  }

  @override
  String get aboutChecking => 'Проверка…';

  @override
  String get aboutCheckUpdate => 'Проверить обновления';

  @override
  String get aboutAutoCheck => 'Проверять обновления автоматически';

  @override
  String get aboutAnalytics => 'Отправлять анонимную статистику';

  @override
  String get aboutSourceAndFeedback => 'Исходный код и обратная связь';

  @override
  String aboutVersion(String version) {
    return 'Версия $version';
  }

  @override
  String get aboutLogs => 'Журналы';

  @override
  String get aboutLogsHint => 'Приложите к сообщению о проблеме';

  @override
  String get aboutOpenFolder => 'Открыть папку';

  @override
  String get aboutOpen => 'Открыть';

  @override
  String updaterNewVersion(String version) {
    return 'Доступна новая версия $version';
  }

  @override
  String get updaterUpToDate => 'Установлена последняя версия';

  @override
  String get updaterCheckFailed => 'Не удалось проверить обновления';

  @override
  String storageClearTitle(String size) {
    return 'Очистить $size кэша?';
  }

  @override
  String get storageClearMessage =>
      'Кэш API, аудио и изображений будет очищен\nи загружен заново при необходимости.';

  @override
  String storageCleared(String size) {
    return 'Очищено $size кэша';
  }

  @override
  String storageLimit(String size) {
    return '/ лимит $size';
  }

  @override
  String storageApi(String size) {
    return 'API $size';
  }

  @override
  String storageAudio(String size) {
    return 'Аудио $size';
  }

  @override
  String storageImage(String size) {
    return 'Изображения $size';
  }

  @override
  String get storageClearing => 'Очистка…';

  @override
  String get storageClearCache => 'Очистить кэш';

  @override
  String get sourceMusicSource => 'Источник музыки';

  @override
  String get sourceLocal => 'Локальная музыка';

  @override
  String get sourceLocalDesc => 'Воспроизведение аудиофайлов с компьютера';

  @override
  String get sourceBuiltIn => 'Встроенный';

  @override
  String get sourceInUse => 'Активен';

  @override
  String get sourceScanning => 'Сканирование…';

  @override
  String get sourceNoFolders => 'Папки не добавлены';

  @override
  String sourceFolderAlbums(int folders, int albums) {
    return 'Папок: $folders, альбомов: $albums';
  }

  @override
  String get sourceAddFolderEllipsis => 'Добавить папку с музыкой…';

  @override
  String get sourceAddFolder => 'Добавить папку';

  @override
  String get sourceAddMusicFolder => 'Добавить папку с музыкой';

  @override
  String get sourceRescan => 'Пересканировать';

  @override
  String get sourceMusicFolders => 'Папки с музыкой';

  @override
  String get sourceNoFoldersAdded => 'Папки с музыкой ещё не добавлены';

  @override
  String get sourceOpenInFileManager => 'Открыть в проводнике';

  @override
  String get sourceShowInFileManager => 'Показать в проводнике';

  @override
  String get sourceStopScanningFolder => 'Больше не сканировать эту папку';

  @override
  String sourceSwitchedTo(String name) {
    return 'Переключено на «$name»';
  }

  @override
  String get sourceFolderAlreadyScanned => 'Эта папка уже сканируется';

  @override
  String get sourceNoMusicFound => 'Музыка не найдена';

  @override
  String sourceScanningCount(int count) {
    final intl.NumberFormat countNumberFormat =
        intl.NumberFormat.decimalPattern(localeName);
    final String countString = countNumberFormat.format(count);

    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$countString трека',
      many: '$countString треков',
      few: '$countString трека',
      one: '1 трек',
    );
    return 'Сканирование… $_temp0';
  }

  @override
  String sourceFoldersUnreadable(int count) {
    final intl.NumberFormat countNumberFormat =
        intl.NumberFormat.decimalPattern(localeName);
    final String countString = countNumberFormat.format(count);

    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'Не удалось прочитать $countString папки, они пропущены',
      many: 'Не удалось прочитать $countString папок, они пропущены',
      few: 'Не удалось прочитать $countString папки, они пропущены',
      one: 'Не удалось прочитать 1 папку, она пропущена',
    );
    return '$_temp0';
  }

  @override
  String get sourceFolderUnreadable => 'Не читается, пропущена';

  @override
  String get sourceCancelScan => 'Отменить сканирование';

  @override
  String get sourceNotFound => 'Источник музыки не найден';

  @override
  String pluginsLoadedToast(int count) {
    return 'Загружено плагинов: $count';
  }

  @override
  String get pluginFind => 'Найти плагины';

  @override
  String get pluginInstallTitle => 'Установить плагин';

  @override
  String get pluginTabInstalled => 'Установленные';

  @override
  String get pluginTabOfficial => 'Официальные';

  @override
  String get pluginOpenDir => 'Открыть папку плагинов';

  @override
  String get pluginThirdPartyHint =>
      'Сторонние плагины поддерживаются их авторами';

  @override
  String get pluginDevDocs => 'Документация плагинов ›';

  @override
  String get pluginComingSoon => 'Скоро';

  @override
  String get pluginInstallFromLink => 'Установить по ссылке';

  @override
  String get pluginInstallFromLinkHint =>
      'Репозиторий GitHub, Release или .zip';

  @override
  String pluginUninstallTitle(String name) {
    return 'Удалить «$name»?';
  }

  @override
  String get pluginUninstallMessage =>
      'Настройки и данные входа плагина будут удалены';

  @override
  String pluginUninstalled(String name) {
    return '«$name» удалён';
  }

  @override
  String pluginUpdateAvailable(String version) {
    return 'Доступно обновление $version';
  }

  @override
  String pluginNeedSetting(String field) {
    return 'Требуется $field';
  }

  @override
  String pluginSignedInAs(String name) {
    return 'Вход выполнен: $name';
  }

  @override
  String pluginDisabledToast(String name) {
    return '«$name» отключён';
  }

  @override
  String pluginEnabledToast(String name) {
    return '«$name» включён';
  }

  @override
  String get pluginHasUpdate => 'Обновление';

  @override
  String get pluginSignInAccount => 'Войти в аккаунт';

  @override
  String get pluginSettingsEllipsis => 'Настройки плагина…';

  @override
  String get pluginDisable => 'Отключить плагин';

  @override
  String get pluginReload => 'Перезагрузить плагины';

  @override
  String get pluginUninstallEllipsis => 'Удалить плагин…';

  @override
  String get pluginDeleteEllipsis => 'Удалить плагин…';

  @override
  String get pluginDisabledBadge => 'Отключён';

  @override
  String get pluginNotLoadedBadge => 'Не загружен';

  @override
  String get pluginNotLoadedStatus => 'Плагин не загружен';

  @override
  String get pluginEmptyTitle => 'Плагины не установлены';

  @override
  String get pluginEmptyHint => 'Поддерживаются ссылки GitHub';

  @override
  String get pluginSettingsTitle => 'Настройки плагина';

  @override
  String get pluginSectionAccount => 'Аккаунт';

  @override
  String get pluginSectionCapabilities => 'Возможности';

  @override
  String get pluginSectionPermissions => 'Разрешения';

  @override
  String get pluginDisabledHint => 'Плагин отключён. Включите для применения';

  @override
  String get pluginUninstallBtn => 'Удалить плагин';

  @override
  String get pluginSignInSyncHint =>
      'Войдите для синхронизации избранного и плейлистов';

  @override
  String get pluginGetIt => 'Получить ›';

  @override
  String pluginUpdatedToast(String name) {
    return '«$name» обновлён';
  }

  @override
  String pluginInstalledToast(String name) {
    return '«$name» установлен';
  }

  @override
  String pluginInstallFailed(String error) {
    return 'Ошибка установки: $error';
  }

  @override
  String get pluginInstallPrompt =>
      'Вставьте URL репозитория GitHub\nили ссылку для скачивания плагина';

  @override
  String get pluginInstallPlaceholder => 'github.com/автор/репозиторий';

  @override
  String get pluginInstallSupportHint =>
      'Поддерживаются репозитории GitHub, Releases, plugin.json и .zip';

  @override
  String get pluginReading => 'Чтение…';

  @override
  String get pluginNextStep => 'Далее';

  @override
  String get pluginInstallFromLocal => 'Установить из локальной папки…';

  @override
  String pluginPublishedAgo(String ago) {
    return ', опубликовано $ago';
  }

  @override
  String get pluginLocalFolder => 'Локальная папка';

  @override
  String get pluginLatestCode => 'Последний код';

  @override
  String pluginInstalledVersion(String version) {
    return 'Установлено $version';
  }

  @override
  String get pluginPermissionsNeeded => 'Требуемые разрешения';

  @override
  String get pluginPermNoNetwork => 'Без доступа к сети';

  @override
  String get pluginPermNoNetworkDetail => 'Не подключается к сайтам';

  @override
  String get pluginPermAnyWebsite => 'Любые сайты';

  @override
  String get pluginPermAnyWebsiteDetail => 'Может подключаться к любым сайтам';

  @override
  String get pluginPermAnyWebsiteFull => 'Может обращаться к любым сайтам';

  @override
  String get pluginPermNetwork => 'Доступ к сети';

  @override
  String get pluginPermSignInDetail =>
      'Открывает страницу входа и читает cookie после входа';

  @override
  String get pluginPermProcess => 'Запуск локальных программ';

  @override
  String get pluginPermProcessBadge => 'Требуется разрешение';

  @override
  String pluginPermProcessDetail(String programs) {
    return '$programs. По умолчанию выкл.; включается в настройках плагина';
  }

  @override
  String get pluginPermStorage => 'Хранение данных';

  @override
  String get pluginPermStorageDetail => 'Сохраняет настройки, сессию и кэш';

  @override
  String get pluginCapabilitiesProvided => 'Предоставляемые возможности';

  @override
  String get pluginNavIconHint =>
      'Пункты со значками добавляются на боковую панель';

  @override
  String get pluginTrustHint =>
      'Устанавливайте плагины только из надёжных источников';

  @override
  String get pluginInstalling => 'Установка…';

  @override
  String get pluginYourServer => 'ваш сервер';

  @override
  String pluginCanAccessHosts(String hosts) {
    return 'Доступ к $hosts';
  }

  @override
  String pluginCanAccessHostsMore(String hosts, int count) {
    return 'Доступ к $hosts (всего $count)';
  }

  @override
  String get pluginOnlyYourServer =>
      'Доступ только к серверу, указанному в настройках';

  @override
  String pluginAndYourServer(String hosts) {
    return '$hosts, а также сервер из настроек';
  }

  @override
  String get pluginAnyProgram => 'Любая локальная программа';

  @override
  String get officialJellyfinDesc => 'Подключение к серверу Jellyfin';

  @override
  String get officialPlexDesc => 'Подключение к Plex Media Server';

  @override
  String get officialSubsonicDesc =>
      'Подключение к Navidrome и серверам Subsonic';

  @override
  String get officialEmbyDesc => 'Подключение к серверу Emby';

  @override
  String get capSuggest => 'Подсказки';

  @override
  String get capLyrics => 'Тексты';

  @override
  String get capPlaylist => 'Плейлисты';

  @override
  String get capEditPlaylist => 'Редактирование плейлистов';

  @override
  String get capFavorites => 'Избранное';

  @override
  String get capAlbum => 'Альбомы';

  @override
  String get capArtist => 'Исполнители';

  @override
  String get capRadio => 'Радио';

  @override
  String get capSimilar => 'Похожие';

  @override
  String get capHistory => 'История';

  @override
  String get capDislike => 'Не интересно';

  @override
  String get capTrackMenu => 'Меню трека';

  @override
  String get mcpPortRangeError => 'Порт должен быть от 1024 до 65535';

  @override
  String mcpPortUpdated(int port) {
    return 'Порт обновлён на $port';
  }

  @override
  String mcpCopiedLabel(String label) {
    return 'Скопировано: $label';
  }

  @override
  String mcpRunning(String url) {
    return 'Работает · $url';
  }

  @override
  String get mcpStopped => 'Остановлен';

  @override
  String get mcpEnableLocal => 'Включить локальный MCP-сервер';

  @override
  String get mcpEnableHint =>
      'Слушает только 127.0.0.1 для внешних ИИ-клиентов';

  @override
  String mcpSessions(int count) {
    return 'Сессий: $count';
  }

  @override
  String get mcpListenPort => 'Порт';

  @override
  String get mcpPortHint => 'По умолчанию 18888 (Streamable HTTP)';

  @override
  String get mcpLazyMode => 'Режим отложенной загрузки MCP';

  @override
  String mcpLazyHintOn(int core, int lazy) {
    return 'Сначала $core основных инструментов + $lazy расширенных по запросу';
  }

  @override
  String mcpLazyHintOff(int total) {
    return 'Открывает все $total инструментов текущего источника';
  }

  @override
  String get mcpReadOnly => 'Безопасный режим только для чтения';

  @override
  String get mcpReadOnlyHint =>
      'Блокирует изменения плейлистов, комментарии и лайки';

  @override
  String get mcpAuthSection => 'Аутентификация';

  @override
  String get mcpRequireToken => 'Требовать Bearer Token';

  @override
  String get mcpRequireTokenHint =>
      'Клиенты должны передавать заголовок Authorization: Bearer <token>';

  @override
  String get mcpHttpConfigTitle => 'Настройка клиента (Streamable HTTP)';

  @override
  String get mcpHttpConfigDesc =>
      'Для HTTP MCP-клиентов (Antigravity, Cursor, Claude и др.):';

  @override
  String get mcpCopyHttpConfig => 'Копировать HTTP-конфиг';

  @override
  String get mcpHttpConfigLabel => 'Конфигурация Streamable HTTP';

  @override
  String get mcpStdioConfigTitle => 'Настройка Stdio-моста (автозапуск)';

  @override
  String get mcpStdioConfigDesc =>
      'Для stdio-клиентов; автоматически запускает приложение в фоне при запросе:';

  @override
  String get mcpCopyStdioConfig => 'Копировать Stdio-конфиг';

  @override
  String get mcpStdioConfigLabel => 'Конфигурация Stdio-моста';

  @override
  String mcpPortStartFailed(int port, String error) {
    return 'Не удалось запустить на порту $port: $error';
  }

  @override
  String get tabSongs => 'Треки';

  @override
  String get tabAlbums => 'Альбомы';

  @override
  String get tabPlaylists => 'Плейлисты';

  @override
  String get tabArtists => 'Исполнители';

  @override
  String get tabArtistSearch => 'Исполнители';

  @override
  String get sortTitleAZ => 'Название А-Я';

  @override
  String get sortReleaseDate => 'Дата выхода';

  @override
  String get sortDefault => 'По умолчанию';

  @override
  String get sortAlbumAZ => 'Альбом А-Я';

  @override
  String get libraryEmptyTitle => 'Медиатека пуста';

  @override
  String get libraryAddSource => 'Добавить источник';

  @override
  String get libraryNoAlbums => 'Альбомов пока нет';

  @override
  String get libraryNoSongs => 'Треков пока нет';

  @override
  String get libraryNoPlaylists => 'Плейлистов пока нет';

  @override
  String get libraryNoArtists => 'Исполнителей пока нет';

  @override
  String get libraryEarlier => 'Ранее';

  @override
  String get libraryCreatedByMe => 'Мои';

  @override
  String get libraryCollected => 'Сохранённые';

  @override
  String countTracks(int count) {
    return '$count треков';
  }

  @override
  String countSongs(int count) {
    return '$count треков';
  }

  @override
  String countAlbums(int count) {
    return '$count альбомов';
  }

  @override
  String countPlays(String count) {
    return '$count прослуш.';
  }

  @override
  String countComments(String count) {
    return '$count коммент.';
  }

  @override
  String durationHours(int count) {
    return '$count ч';
  }

  @override
  String durationMinutes(int count) {
    return '$count мин';
  }

  @override
  String albumTracksDuration(int tracks, int minutes) {
    return '$tracks треков · $minutes мин';
  }

  @override
  String get albumNotFound => 'Альбом не найден';

  @override
  String get albumKindAlbum => 'Альбом';

  @override
  String get albumKindSingle => 'Сингл';

  @override
  String get albumKindCompilation => 'Сборник';

  @override
  String get albumTracksTitle => 'Треки';

  @override
  String albumReleasedIn(int year) {
    return 'Выпущен в $year';
  }

  @override
  String albumReleasedOn(String date) {
    return 'Выпущен $date';
  }

  @override
  String artistFollowed(String name) {
    return 'Вы подписались на $name';
  }

  @override
  String get artistUnfollowed => 'Подписка отменена';

  @override
  String get artistFollowFailed => 'Не удалось подписаться, попробуйте позже';

  @override
  String get artistUnfollowFailed => 'Не удалось отписаться, попробуйте позже';

  @override
  String get artistSimilar => 'Похожие исполнители';

  @override
  String artistHotTracksOf(String name) {
    return 'Популярные треки $name';
  }

  @override
  String get artistLatestRelease => 'Последний релиз';

  @override
  String get artistHotTracks => 'Популярные треки';

  @override
  String get artistSinglesAndEps => 'Синглы и EP';

  @override
  String get playlistSearchPlaceholder => 'Поиск в плейлисте';

  @override
  String get playlistColTitle => 'Название';

  @override
  String get playlistColAlbum => 'Альбом';

  @override
  String get playlistColAdded => 'Добавлен';

  @override
  String get playlistEmpty => 'В плейлисте пока нет треков';

  @override
  String playlistNoMatch(String query) {
    return 'Ничего не найдено по запросу «$query»';
  }

  @override
  String playlistTagCount(String tag, int count) {
    return '«$tag»: $count треков';
  }

  @override
  String get searchPlaceholder =>
      'Поиск треков, альбомов, исполнителей и плейлистов';

  @override
  String get searchUnsupported => 'Этот плагин не поддерживает поиск.';

  @override
  String get searchRecent => 'Недавние запросы';

  @override
  String get searchRecentResults => 'Недавние результаты';

  @override
  String get searchHot => 'Популярное';

  @override
  String get searchRemoveHistory => 'Удалить из истории';

  @override
  String searchNoResults(String query) {
    return 'Ничего не найдено по запросу «$query»';
  }

  @override
  String searchViewAllSongs(int count) {
    return 'Показать все $count треков';
  }

  @override
  String searchViewAllAlbums(int count) {
    return 'Показать все $count альбомов';
  }

  @override
  String searchAllCount(int count) {
    return 'Все ($count)';
  }

  @override
  String searchQueueName(String query) {
    return 'Поиск «$query»';
  }

  @override
  String searchMcpQueueName(String query) {
    return 'Поиск: $query';
  }

  @override
  String get commentSortHot => 'Популярные';

  @override
  String get commentSortLatest => 'Новые';

  @override
  String get commentWrite => 'Написать комментарий';

  @override
  String get commentEmpty => 'Комментариев пока нет';

  @override
  String get commentLoadFailed => 'Не удалось загрузить комментарии';

  @override
  String get commentLikeFailed => 'Не удалось поставить лайк';

  @override
  String get commentAnonymous => 'Аноним';

  @override
  String get commentReply => 'Ответить';

  @override
  String get commentPosted => 'Комментарий опубликован';

  @override
  String get commentReplyPosted => 'Ответ опубликован';

  @override
  String get commentPostFailed => 'Не удалось опубликовать';

  @override
  String get commentWriteTo => 'Комментарий к';

  @override
  String get commentPosting => 'Публикация…';

  @override
  String get commentPost => 'Отправить';

  @override
  String get commentPlaceholder => 'Напишите комментарий…';

  @override
  String commentReplyPlaceholder(String name) {
    return 'Ответить $name…';
  }

  @override
  String get profileLocalUnsupported =>
      'У локальной музыки нет страницы профиля.';

  @override
  String profileSourceUnsupported(String name) {
    return 'У «$name» нет страницы профиля.';
  }

  @override
  String profileSignInHint(String name) {
    return 'Войдите в «$name», чтобы открыть профиль.';
  }

  @override
  String get profileTopArtists => 'Любимые исполнители';

  @override
  String get profileMostPlayed => 'Чаще всего слушаете';

  @override
  String get profileMyPlaylists => 'Мои плейлисты';

  @override
  String signOutConfirmTitle(String name) {
    return 'Выйти из «$name»?';
  }

  @override
  String get signOutConfirmMessage =>
      'Медиатека, плейлисты и рекомендации этого источника будут скрыты\nдо повторного входа.';

  @override
  String signInDialogTitle(String name) {
    return 'Вход в $name';
  }

  @override
  String get signInQrFailed => 'Не удалось создать QR-код';

  @override
  String get remoteNeedSignIn => 'Требуется вход';

  @override
  String remoteErrorKind(String kind) {
    return 'Ошибка ($kind)';
  }

  @override
  String remotePluginMissing(String id) {
    return 'Плагин $id не загружен. Перезагрузите его в настройках.';
  }

  @override
  String get remoteSwitchToLocalHint =>
      'В настройках можно переключиться на локальную музыку';

  @override
  String get remoteNoDiscover =>
      'У плагина нет раздела «Обзор». Воспользуйтесь поиском.';

  @override
  String get remoteNoHome =>
      'У плагина нет главной страницы. Воспользуйтесь поиском.';

  @override
  String get remoteNoContent => 'Здесь пока ничего нет.';

  @override
  String get remotePlayAlbumFailed =>
      'Не удалось воспроизвести альбом, попробуйте позже';

  @override
  String get greetingLateNight => 'Доброй ночи';

  @override
  String get greetingMorning => 'Доброе утро';

  @override
  String get greetingNoon => 'Добрый день';

  @override
  String get greetingAfternoon => 'Добрый день';

  @override
  String get greetingEvening => 'Добрый вечер';

  @override
  String get localRecentlyAdded => 'Недавно добавленные';

  @override
  String get localEmptyHint =>
      'Треков пока нет. Добавьте папку с музыкой в настройках';

  @override
  String get localArtistNotFound => 'Исполнитель не найден';

  @override
  String get localFileMovedOrDeleted => 'Файл перемещён или удалён';

  @override
  String get timeJustNow => 'Только что';

  @override
  String timeMinutesAgo(int count) {
    return '$count мин. назад';
  }

  @override
  String timeHoursAgo(int count) {
    return '$count ч. назад';
  }

  @override
  String timeDaysAgo(int count) {
    return '$count дн. назад';
  }

  @override
  String timeMonthsAgo(int count) {
    return '$count мес. назад';
  }

  @override
  String timeYearsAgo(int count) {
    return '$count г. назад';
  }

  @override
  String get timeToday => 'Сегодня';

  @override
  String get timeYesterday => 'Вчера';

  @override
  String dateYear(int year) {
    return '$year г.';
  }

  @override
  String dateYearMonth(int year, int month) {
    return '$month.$year';
  }

  @override
  String dateMonthDay(int month, int day) {
    return '$day.$month';
  }

  @override
  String dateYearMonthDay(int year, int month, int day) {
    return '$day.$month.$year';
  }

  @override
  String toastSignedInAs(String name) {
    return 'Выполнен вход: $name';
  }

  @override
  String get toastNotSignedIn => 'Вход не выполнен';

  @override
  String get toastSignOutFailed => 'Не удалось выйти';

  @override
  String get toastPlayAlbumFailed => 'Не удалось воспроизвести альбом';

  @override
  String get toastPlayPlaylistFailed => 'Не удалось воспроизвести плейлист';

  @override
  String toastPlaybackError(String error) {
    return 'Ошибка воспроизведения: $error';
  }

  @override
  String toastCannotPlayTrack(String title) {
    return 'Невозможно воспроизвести «$title»';
  }

  @override
  String toastStationEmpty(String name) {
    return 'В «$name» нет треков';
  }

  @override
  String toastStationOpenFailed(String name) {
    return 'Не удалось открыть «$name»';
  }

  @override
  String toastAddedToPlaylist(String name) {
    return 'Добавлено в «$name»';
  }

  @override
  String toastAddToPlaylistFailed(String name) {
    return 'Не удалось добавить в «$name»';
  }

  @override
  String toastPlaylistCreated(String name) {
    return 'Плейлист «$name» создан';
  }

  @override
  String get toastCreatePlaylistFailed => 'Не удалось создать плейлист';

  @override
  String get toastRemovedFromPlaylist => 'Удалено из плейлиста';

  @override
  String get toastRemoveFromPlaylistFailed => 'Не удалось удалить из плейлиста';

  @override
  String get toastNoSimilarFound => 'Похожие треки не найдены';

  @override
  String toastSimilarQueueName(String title) {
    return 'Похожие на «$title»';
  }

  @override
  String get toastFindSimilarFailed => 'Не удалось найти похожие треки';

  @override
  String toastActionFailed(String title) {
    return '«$title» не удалось';
  }

  @override
  String get toastDisliked => 'Мы будем реже рекомендовать такие треки';

  @override
  String toastDislikeFailed(String name) {
    return 'Не удалось уведомить $name';
  }

  @override
  String get toastLikeFailed => 'Не удалось добавить в любимые';

  @override
  String get toastUnlikeFailed => 'Не удалось убрать из любимых';

  @override
  String get toastSaveAlbumFailed => 'Не удалось сохранить альбом';

  @override
  String get toastUnsaveAlbumFailed => 'Не удалось удалить альбом';

  @override
  String toastAlbumSaved(String title) {
    return '«$title» сохранён';
  }

  @override
  String get toastAlbumUnsaved => 'Удалено из медиатеки';

  @override
  String pluginErrIdTaken(String id) {
    return 'id $id уже занят';
  }

  @override
  String pluginErrMinAppVersion(String required, String current) {
    return 'Требуется YesPlayMusic $required или новее (текущая: $current)';
  }

  @override
  String get pluginErrEmptyLink => 'Введите ссылку';

  @override
  String get pluginErrInvalidLink => 'Нераспознанная ссылка';

  @override
  String pluginErrDownloadNetwork(String error) {
    return 'Ошибка загрузки, проверьте сеть: $error';
  }

  @override
  String pluginErrRepoNotFound(String slug) {
    return 'Репозиторий GitHub $slug не найден';
  }

  @override
  String pluginErrNoManifestInPath(String path) {
    return 'В $path нет plugin.json';
  }

  @override
  String get pluginErrNoManifestInLink =>
      'По этой ссылке не найден plugin.json';

  @override
  String pluginErrMissingEntry(String file) {
    return 'Отсутствует входной файл $file';
  }

  @override
  String pluginErrNotFoundUrl(String url) {
    return 'Не найдено: $url';
  }

  @override
  String get pluginErrGithubRateLimit =>
      'GitHub временно отклонил запрос (превышен лимит). Попробуйте позже';

  @override
  String pluginErrDownloadHttp(int code) {
    return 'Ошибка загрузки: HTTP $code';
  }

  @override
  String get pluginErrTooLarge => 'Плагин слишком большой (более 50 МБ)';

  @override
  String get pluginErrInvalidZip =>
      'Скачанный файл не является корректным .zip';

  @override
  String pluginErrManifestJson(String error) {
    return 'plugin.json не является корректным JSON: $error';
  }

  @override
  String get pluginErrManifestObject => 'plugin.json должен быть объектом JSON';

  @override
  String pluginErrManifestIdChars(String id) {
    return 'id «$id» может содержать только строчные буквы, цифры и . _ -';
  }

  @override
  String get pluginErrManifestIdLocal => 'id «local» зарезервирован';

  @override
  String get pluginErrManifestNoName => 'Отсутствует поле name';

  @override
  String pluginErrManifestMain(String file) {
    return 'main «$file» должен быть файлом .js в папке плагина';
  }

  @override
  String pluginErrManifestIcon(String file) {
    return 'icon «$file» должен быть файлом png, jpg или webp в папке плагина';
  }

  @override
  String pluginErrStopped(String name) {
    return '$name остановлен';
  }

  @override
  String pluginErrNoManifestDir(String dir) {
    return '$dir: отсутствует plugin.json';
  }

  @override
  String pluginErrMinVersionSimple(String name, String version) {
    return '$name требует YesPlayMusic $version или новее';
  }

  @override
  String pluginErrProcessExited(String name) {
    return '$name: процесс плагина неожиданно завершился';
  }

  @override
  String pluginErrNotObject(String name, String op) {
    return '$name.$op вернул не объект';
  }

  @override
  String pluginErrNotArray(String name, String op) {
    return '$name.$op вернул не массив';
  }

  @override
  String pluginErrInvalidStreamUrl(String name) {
    return '$name вернул некорректный URL потока';
  }

  @override
  String pluginErrDuplicateId(String id) {
    return 'Дублирующийся id плагина: $id';
  }

  @override
  String pluginErrTimeoutDisabled(int seconds) {
    return 'Плагин не отвечал более $seconds с и был отключён';
  }

  @override
  String get pluginErrOomDisabled =>
      'Плагину не хватило памяти, он был отключён';

  @override
  String get pluginErrLoadTimeout => 'Превышено время загрузки';

  @override
  String pluginErrOpTimeout(String op, int seconds) {
    return 'Тайм-аут $op ($seconds с)';
  }

  @override
  String get pluginErrClosed => 'Плагин закрыт';

  @override
  String sourceErrUnsupported(String name, String op) {
    return '$name не поддерживает $op';
  }

  @override
  String sourceErrNotFound(String source) {
    return 'Источник не найден: $source';
  }
}
