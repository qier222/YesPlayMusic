// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for German (`de`).
class AppLocalizationsDe extends AppLocalizations {
  AppLocalizationsDe([String locale = 'de']) : super(locale);

  @override
  String get navHome => 'Startseite';

  @override
  String get navDiscover => 'Entdecken';

  @override
  String get navLibrary => 'Mediathek';

  @override
  String get navSearch => 'Suche';

  @override
  String get navSearchPage => 'Suche';

  @override
  String get navSettings => 'Einstellungen';

  @override
  String get navProfile => 'Profil';

  @override
  String get actionPlay => 'Wiedergabe';

  @override
  String get actionPause => 'Pause';

  @override
  String get actionPlayAll => 'Alle wiedergeben';

  @override
  String get actionShuffle => 'Zufallswiedergabe';

  @override
  String get actionNext => 'Nächster Titel';

  @override
  String get actionPrev => 'Vorheriger Titel';

  @override
  String get actionLike => 'Gefällt mir';

  @override
  String get actionUnlike => 'Gefällt mir entfernen';

  @override
  String get actionSaveAlbum => 'Album speichern';

  @override
  String get actionUnsave => 'Aus Mediathek entfernen';

  @override
  String get actionFollow => 'Folgen';

  @override
  String get actionFollowing => 'Folge ich';

  @override
  String get actionMore => 'Mehr';

  @override
  String get actionBack => 'Zurück';

  @override
  String get actionClose => 'Schließen';

  @override
  String get windowMinimize => 'Minimieren';

  @override
  String get windowMaximize => 'Maximieren';

  @override
  String get windowRestore => 'Verkleinern';

  @override
  String get actionCancel => 'Abbrechen';

  @override
  String get actionConfirm => 'OK';

  @override
  String get actionClear => 'Leeren';

  @override
  String get actionClearShort => 'Leeren';

  @override
  String get actionRetry => 'Erneut versuchen';

  @override
  String get actionOpen => 'Öffnen';

  @override
  String get actionSave => 'Speichern';

  @override
  String get actionSaving => 'Speichern…';

  @override
  String get actionDone => 'Fertig';

  @override
  String get actionApply => 'Anwenden';

  @override
  String get actionCopy => 'Kopieren';

  @override
  String get actionReset => 'Zurücksetzen';

  @override
  String get actionAdd => 'Hinzufügen';

  @override
  String get actionSelect => 'Auswählen';

  @override
  String get actionAll => 'Alle';

  @override
  String get actionCollapse => 'Einklappen';

  @override
  String get actionExpandAllCategories => 'Alle Kategorien';

  @override
  String get actionPrevPage => 'Vorherige Seite';

  @override
  String get actionNextPage => 'Nächste Seite';

  @override
  String get actionViewFullText => 'Mehr anzeigen';

  @override
  String get actionShow => 'Anzeigen';

  @override
  String get actionHide => 'Ausblenden';

  @override
  String get actionReload => 'Neu laden';

  @override
  String get actionInstall => 'Installieren';

  @override
  String get actionUpdate => 'Aktualisieren';

  @override
  String get actionUninstall => 'Deinstallieren';

  @override
  String get actionEnable => 'Aktivieren';

  @override
  String get actionSignIn => 'Anmelden';

  @override
  String get actionSignOut => 'Abmelden';

  @override
  String get actionManageSources => 'Quellen verwalten';

  @override
  String get actionManagePlugins => 'Plugins verwalten';

  @override
  String get actionGoSearch => 'Zur Suche';

  @override
  String get actionLoadMore => 'Mehr laden';

  @override
  String get stateLoading => 'Wird geladen…';

  @override
  String get stateLoadingShort => 'Laden…';

  @override
  String get stateLoadFailed => 'Laden fehlgeschlagen';

  @override
  String get stateCouldNotLoad => 'Konnte nicht geladen werden';

  @override
  String get stateSigningIn => 'Anmeldung…';

  @override
  String get stateSigningInShort => 'Anmelden…';

  @override
  String get stateSignedIn => 'Angemeldet';

  @override
  String get stateNotSignedIn => 'Nicht angemeldet';

  @override
  String get stateNone => 'Keine';

  @override
  String get statePleaseSelect => 'Auswählen';

  @override
  String get stateCopied => 'Kopiert';

  @override
  String get stateSaved => 'Gespeichert';

  @override
  String stateSaveFailed(String error) {
    return 'Speichern fehlgeschlagen: $error';
  }

  @override
  String get miniShuffleOn => 'Zufallswiedergabe: Ein';

  @override
  String get miniRepeatOn => 'Alle wiederholen';

  @override
  String get miniRepeatOff => 'Wiederholen aus';

  @override
  String get miniQueue => 'Warteschlange';

  @override
  String get miniOpenNowPlaying => 'Aktuelle Wiedergabe öffnen';

  @override
  String get miniMute => 'Stummschalten';

  @override
  String get npTitle => 'Aktuelle Wiedergabe';

  @override
  String get npComments => 'Kommentare';

  @override
  String get npSimilar => 'Ähnliche Titel';

  @override
  String npSimilarTo(String title) {
    return 'Ähnlich wie $title';
  }

  @override
  String get npNoSimilar => 'Keine ähnlichen Titel gefunden';

  @override
  String get npUpNext => 'Als Nächstes';

  @override
  String get npQueueEmpty => 'Keine weiteren Titel in der Warteschlange';

  @override
  String get npFromPrefix => 'Aus ';

  @override
  String get npViewAlbum => 'Zum Album';

  @override
  String get npViewArtist => 'Zum Künstler';

  @override
  String get menuPlayNext => 'Als Nächstes wiedergeben';

  @override
  String get menuAddedNext => 'Wird als Nächstes gespielt';

  @override
  String get menuAddToQueue => 'Zur Warteschlange hinzufügen';

  @override
  String get menuAddedToQueue => 'Zur Warteschlange hinzugefügt';

  @override
  String get menuAddToPlaylist => 'Zur Playlist hinzufügen';

  @override
  String get menuCreatePlaylist => 'Neue Playlist';

  @override
  String get menuPlaylistNamePlaceholder => 'Name der Playlist';

  @override
  String get menuCreateAndAdd => 'Erstellen & hinzufügen';

  @override
  String get menuPlaySimilar => 'Ähnliche Titel abspielen';

  @override
  String get menuDislike => 'Gefällt mir nicht';

  @override
  String get menuRemoveFromPlaylist => 'Aus Playlist entfernen';

  @override
  String get shortcutGroupPlayback => 'Wiedergabe';

  @override
  String get shortcutGroupUi => 'Oberfläche';

  @override
  String get shortcutGroupMediaKeys => 'Medientasten';

  @override
  String get shortcutPlayPause => 'Wiedergabe / Pause';

  @override
  String get shortcutSpaceKey => 'Leertaste';

  @override
  String get shortcutSeekForward => '5 Sek. vorwärts';

  @override
  String get shortcutSeekBackward => '5 Sek. rückwärts';

  @override
  String get shortcutVolumeUp => 'Lauter';

  @override
  String get shortcutVolumeDown => 'Leiser';

  @override
  String get shortcutMute => 'Stumm';

  @override
  String get shortcutRepeat => 'Wiederholungsmodus';

  @override
  String get shortcutLikeCurrent => 'Aktuellen Titel liken';

  @override
  String get shortcutDismissOverlay => 'Wiedergabe / Dialog schließen';

  @override
  String get shortcutBack => 'Zurück';

  @override
  String get shortcutForward => 'Vorwärts';

  @override
  String get shortcutSwitchTab => 'Seitenleiste wechseln';

  @override
  String get shortcutKeyRangeTo => 'bis';

  @override
  String get shortcutMediaKeysLabel =>
      'Tastatur-Medientasten & Kopfhörertasten';

  @override
  String get shortcutTypingHintMac => 'Beim Tippen sind nur ⌘F und Esc aktiv';

  @override
  String get shortcutTypingHintOther =>
      'Beim Tippen sind nur Ctrl+F und Esc aktiv';

  @override
  String get menuBarSettings => 'Einstellungen…';

  @override
  String get menuBarView => 'Darstellung';

  @override
  String get menuBarWindow => 'Fenster';

  @override
  String get swatchLilac => 'Flieder';

  @override
  String get swatchSky => 'Himmel';

  @override
  String get swatchMint => 'Minze';

  @override
  String get swatchSun => 'Sonne';

  @override
  String get swatchRose => 'Rose';

  @override
  String get swatchFlame => 'Flamme';

  @override
  String get settingsGeneral => 'Allgemein';

  @override
  String get settingsShortcuts => 'Kurzbefehle';

  @override
  String get settingsPlugins => 'Plugins';

  @override
  String get settingsAbout => 'Über';

  @override
  String get settingsAppearance => 'Erscheinungsbild';

  @override
  String get settingsLyrics => 'Songtexte';

  @override
  String get settingsPlayback => 'Wiedergabe';

  @override
  String get settingsStorage => 'Speicher';

  @override
  String get settingsAccentColor => 'Akzentfarbe';

  @override
  String get settingsLanguage => 'Sprache';

  @override
  String get langSystem => 'Systemsprache';

  @override
  String get settingsMiniLyric => 'Songtext im Mini-Player immer anzeigen';

  @override
  String get settingsKeepRunning =>
      'Nach dem Schließen im Hintergrund weiterlaufen';

  @override
  String get trayShowWindow => 'Fenster anzeigen';

  @override
  String get trayQuit => 'Beenden';

  @override
  String get settingsDynamicIsland => 'Dynamic Island';

  @override
  String get settingsDynamicIslandHint =>
      'Zeigt die aktuelle Wiedergabe an der Notch oben am Bildschirm; zum Aufklappen mit der Maus darüberfahren';

  @override
  String aboutDownloadVersion(String version) {
    return '$version herunterladen';
  }

  @override
  String get aboutChecking => 'Wird geprüft…';

  @override
  String get aboutCheckUpdate => 'Nach Updates suchen';

  @override
  String get aboutAutoCheck => 'Automatisch nach Updates suchen';

  @override
  String get aboutAnalytics => 'Anonyme Nutzungsstatistik senden';

  @override
  String get aboutSourceAndFeedback => 'Quellcode & Feedback';

  @override
  String aboutVersion(String version) {
    return 'Version $version';
  }

  @override
  String get aboutLogs => 'Protokolldateien';

  @override
  String get aboutLogsHint => 'Bei Fehlerberichten anhängen';

  @override
  String get aboutOpenFolder => 'Ordner öffnen';

  @override
  String get aboutOpen => 'Öffnen';

  @override
  String updaterNewVersion(String version) {
    return 'Neue Version $version verfügbar';
  }

  @override
  String get updaterUpToDate => 'Auf dem neuesten Stand';

  @override
  String get updaterCheckFailed => 'Update-Prüfung fehlgeschlagen';

  @override
  String storageClearTitle(String size) {
    return '$size Cache leeren?';
  }

  @override
  String get storageClearMessage =>
      'API-, Audio- und Bild-Caches werden gelöscht\nund bei Bedarf neu geladen.';

  @override
  String storageCleared(String size) {
    return '$size Cache geleert';
  }

  @override
  String storageLimit(String size) {
    return '/ $size Limit';
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
    return 'Bilder $size';
  }

  @override
  String get storageClearing => 'Wird geleert…';

  @override
  String get storageClearCache => 'Cache leeren';

  @override
  String get sourceMusicSource => 'Musikquelle';

  @override
  String get sourceLocal => 'Lokale Musik';

  @override
  String get sourceLocalDesc => 'Audiodateien auf diesem Computer abspielen';

  @override
  String get sourceBuiltIn => 'Integriert';

  @override
  String get sourceInUse => 'Aktiv';

  @override
  String get sourceScanning => 'Wird gescannt…';

  @override
  String get sourceNoFolders => 'Keine Ordner hinzugefügt';

  @override
  String sourceFolderAlbums(int folders, int albums) {
    return '$folders Ordner, $albums Alben';
  }

  @override
  String get sourceAddFolderEllipsis => 'Musikordner hinzufügen…';

  @override
  String get sourceAddFolder => 'Ordner hinzufügen';

  @override
  String get sourceAddMusicFolder => 'Musikordner hinzufügen';

  @override
  String get sourceRescan => 'Neu scannen';

  @override
  String get sourceMusicFolders => 'Musikordner';

  @override
  String get sourceNoFoldersAdded => 'Noch keine Musikordner hinzugefügt';

  @override
  String get sourceOpenInFileManager => 'Im Dateimanager öffnen';

  @override
  String get sourceShowInFileManager => 'Im Dateimanager anzeigen';

  @override
  String get sourceStopScanningFolder => 'Diesen Ordner nicht mehr scannen';

  @override
  String sourceSwitchedTo(String name) {
    return 'Gewechselt zu „$name“';
  }

  @override
  String get sourceFolderAlreadyScanned =>
      'Dieser Ordner wird bereits gescannt';

  @override
  String get sourceNoMusicFound => 'Keine Musik gefunden';

  @override
  String sourceScanningCount(int count) {
    final intl.NumberFormat countNumberFormat =
        intl.NumberFormat.decimalPattern(localeName);
    final String countString = countNumberFormat.format(count);

    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$countString Titel',
      one: '1 Titel',
    );
    return 'Wird gescannt… $_temp0';
  }

  @override
  String sourceFoldersUnreadable(int count) {
    final intl.NumberFormat countNumberFormat =
        intl.NumberFormat.decimalPattern(localeName);
    final String countString = countNumberFormat.format(count);

    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other:
          '$countString Ordner konnten nicht gelesen werden und wurden übersprungen',
      one: '1 Ordner konnte nicht gelesen werden und wurde übersprungen',
    );
    return '$_temp0';
  }

  @override
  String get sourceFolderUnreadable => 'Nicht lesbar, übersprungen';

  @override
  String get sourceCancelScan => 'Scan abbrechen';

  @override
  String get sourceNotFound => 'Musikquelle nicht gefunden';

  @override
  String pluginsLoadedToast(int count) {
    return '$count Plugins geladen';
  }

  @override
  String get pluginFind => 'Plugins suchen';

  @override
  String get pluginInstallTitle => 'Plugin installieren';

  @override
  String get pluginTabInstalled => 'Installiert';

  @override
  String get pluginTabOfficial => 'Offiziell';

  @override
  String get pluginOpenDir => 'Plugin-Ordner öffnen';

  @override
  String get pluginThirdPartyHint =>
      'Drittanbieter-Plugins werden von ihren jeweiligen Autoren gepflegt';

  @override
  String get pluginDevDocs => 'Plugin-Dokumentation ›';

  @override
  String get pluginComingSoon => 'Demnächst';

  @override
  String get pluginInstallFromLink => 'Über Link installieren';

  @override
  String get pluginInstallFromLinkHint =>
      'GitHub-Repository, Release oder .zip';

  @override
  String pluginUninstallTitle(String name) {
    return '„$name“ deinstallieren?';
  }

  @override
  String get pluginUninstallMessage =>
      'Einstellungen und Anmeldedaten des Plugins werden gelöscht';

  @override
  String pluginUninstalled(String name) {
    return '„$name“ deinstalliert';
  }

  @override
  String pluginUpdateAvailable(String version) {
    return 'Update auf $version verfügbar';
  }

  @override
  String pluginNeedSetting(String field) {
    return '$field erforderlich';
  }

  @override
  String pluginSignedInAs(String name) {
    return 'Angemeldet als $name';
  }

  @override
  String pluginDisabledToast(String name) {
    return '„$name“ deaktiviert';
  }

  @override
  String pluginEnabledToast(String name) {
    return '„$name“ aktiviert';
  }

  @override
  String get pluginHasUpdate => 'Update';

  @override
  String get pluginSignInAccount => 'Anmelden';

  @override
  String get pluginSettingsEllipsis => 'Plugin-Einstellungen…';

  @override
  String get pluginDisable => 'Plugin deaktivieren';

  @override
  String get pluginReload => 'Plugins neu laden';

  @override
  String get pluginUninstallEllipsis => 'Plugin deinstallieren…';

  @override
  String get pluginDeleteEllipsis => 'Plugin löschen…';

  @override
  String get pluginDisabledBadge => 'Deaktiviert';

  @override
  String get pluginNotLoadedBadge => 'Nicht geladen';

  @override
  String get pluginNotLoadedStatus => 'Plugin konnte nicht geladen werden';

  @override
  String get pluginEmptyTitle => 'Keine Plugins installiert';

  @override
  String get pluginEmptyHint => 'GitHub-Links unterstützt';

  @override
  String get pluginSettingsTitle => 'Plugin-Einstellungen';

  @override
  String get pluginTestConnection => 'Verbindung testen';

  @override
  String get pluginTesting => 'Wird getestet …';

  @override
  String get pluginTestOk => 'Verbunden';

  @override
  String get pluginSectionAccount => 'Konto';

  @override
  String get pluginSectionCapabilities => 'Funktionen';

  @override
  String get pluginSectionPermissions => 'Berechtigungen';

  @override
  String get pluginDisabledHint =>
      'Plugin ist deaktiviert. Zum Anwenden aktivieren';

  @override
  String get pluginUninstallBtn => 'Plugin deinstallieren';

  @override
  String get pluginSignInSyncHint =>
      'Anmelden, um Favoriten und Playlists zu synchronisieren';

  @override
  String get pluginGetIt => 'Holen ›';

  @override
  String pluginUpdatedToast(String name) {
    return '„$name“ aktualisiert';
  }

  @override
  String pluginInstalledToast(String name) {
    return '„$name“ installiert';
  }

  @override
  String pluginInstallFailed(String error) {
    return 'Installation fehlgeschlagen: $error';
  }

  @override
  String get pluginInstallPrompt =>
      'GitHub-Repository-URL oder\nPlugin-Download-Link einfügen';

  @override
  String get pluginInstallPlaceholder => 'github.com/besitzer/repo';

  @override
  String get pluginInstallSupportHint =>
      'Unterstützt GitHub-Repos, Releases, plugin.json und .zip-Links';

  @override
  String get pluginReading => 'Wird gelesen…';

  @override
  String get pluginNextStep => 'Weiter';

  @override
  String get pluginInstallFromLocal => 'Aus lokalem Ordner installieren…';

  @override
  String pluginPublishedAgo(String ago) {
    return ', veröffentlicht $ago';
  }

  @override
  String get pluginLocalFolder => 'Lokaler Ordner';

  @override
  String get pluginLatestCode => 'Neuester Code';

  @override
  String pluginInstalledVersion(String version) {
    return 'Installiert $version';
  }

  @override
  String get pluginPermissionsNeeded => 'Erforderliche Berechtigungen';

  @override
  String get pluginPermNoNetwork => 'Kein Netzwerkzugriff';

  @override
  String get pluginPermNoNetworkDetail =>
      'Stellt keine Verbindung zu Websites her';

  @override
  String get pluginPermAnyWebsite => 'Beliebige Websites';

  @override
  String get pluginPermAnyWebsiteDetail =>
      'Kann sich mit beliebigen Websites verbinden';

  @override
  String get pluginPermAnyWebsiteFull =>
      'Kann auf beliebige Websites zugreifen';

  @override
  String get pluginPermNetwork => 'Netzwerkzugriff';

  @override
  String get pluginPermSignInDetail =>
      'Öffnet eine Anmeldeseite und liest Cookies nach der Anmeldung';

  @override
  String get pluginPermProcess => 'Lokale Programme ausführen';

  @override
  String get pluginPermProcessBadge => 'Erlaubnis erforderlich';

  @override
  String pluginPermProcessDetail(String programs) {
    return '$programs. Standardmäßig aus; in Plugin-Einstellungen aktivierbar';
  }

  @override
  String get pluginPermIpc => 'Mit lokalen Apps verbinden';

  @override
  String pluginPermIpcDetail(String names) {
    return 'Kommuniziert mit anderen Apps auf diesem Computer: $names';
  }

  @override
  String get pluginPermStorage => 'Daten speichern';

  @override
  String get pluginPermStorageDetail =>
      'Speichert Einstellungen, Anmeldestatus und Cache';

  @override
  String get pluginCapabilitiesProvided => 'Bereitgestellte Funktionen';

  @override
  String get pluginNavIconHint =>
      'Einträge mit Symbol erscheinen in der Seitenleiste';

  @override
  String get pluginTrustHint =>
      'Installieren Sie nur Plugins aus vertrauenswürdigen Quellen';

  @override
  String get pluginInstalling => 'Wird installiert…';

  @override
  String get pluginYourServer => 'Ihr konfigurierter Server';

  @override
  String pluginCanAccessHosts(String hosts) {
    return 'Zugriff auf $hosts';
  }

  @override
  String pluginCanAccessHostsMore(String hosts, int count) {
    return 'Zugriff auf $hosts (insgesamt $count)';
  }

  @override
  String get pluginOnlyYourServer =>
      'Greift nur auf den in den Einstellungen angegebenen Server zu';

  @override
  String pluginAndYourServer(String hosts) {
    return '$hosts sowie der in den Einstellungen angegebene Server';
  }

  @override
  String get pluginAnyProgram => 'Beliebiges lokales Programm';

  @override
  String get officialJellyfinDesc => 'Mit einem Jellyfin-Server verbinden';

  @override
  String get officialPlexDesc => 'Mit Plex Media Server verbinden';

  @override
  String get officialSubsonicDesc =>
      'Mit Navidrome und anderen Subsonic-Servern verbinden';

  @override
  String get officialEmbyDesc => 'Mit einem Emby-Server verbinden';

  @override
  String get officialLastfmDesc => 'Gehörte Titel bei Last.fm scrobbeln';

  @override
  String get officialListenbrainzDesc =>
      'Bei ListenBrainz oder eigenem Server scrobbeln';

  @override
  String get officialDiscordDesc => 'Zeigt auf Discord, was du hörst';

  @override
  String get officialWebdavDesc =>
      'Musik von WebDAV-Servern wie NAS, Nextcloud oder OpenList abspielen';

  @override
  String get capSuggest => 'Vorschläge';

  @override
  String get capLyrics => 'Songtexte';

  @override
  String get capPlaylist => 'Playlists';

  @override
  String get capEditPlaylist => 'Playlists bearbeiten';

  @override
  String get capFavorites => 'Favoriten';

  @override
  String get capAlbum => 'Alben';

  @override
  String get capArtist => 'Künstler';

  @override
  String get capRadio => 'Radio';

  @override
  String get capSimilar => 'Ähnliche';

  @override
  String get capHistory => 'Verlauf';

  @override
  String get capScrobble => 'Scrobbeln';

  @override
  String get capPlaybackStatus => 'Wiedergabestatus';

  @override
  String get capDislike => 'Kein Interesse';

  @override
  String get capTrackMenu => 'Titelmenü';

  @override
  String get mcpPortRangeError => 'Port muss zwischen 1024 und 65535 liegen';

  @override
  String mcpPortUpdated(int port) {
    return 'Port auf $port aktualisiert';
  }

  @override
  String mcpCopiedLabel(String label) {
    return '$label kopiert';
  }

  @override
  String mcpRunning(String url) {
    return 'Läuft · $url';
  }

  @override
  String get mcpStopped => 'Gestoppt';

  @override
  String get mcpEnableLocal => 'Lokalen MCP-Server aktivieren';

  @override
  String get mcpEnableHint =>
      'Lauscht nur auf 127.0.0.1 für externe KI-Clients zur Steuerung';

  @override
  String mcpSessions(int count) {
    return '$count Sitzungen';
  }

  @override
  String get mcpListenPort => 'Port';

  @override
  String get mcpPortHint => 'Standard 18888 (Streamable HTTP)';

  @override
  String get mcpLazyMode => 'MCP Lazy-Loading-Modus';

  @override
  String mcpLazyHintOn(int core, int lazy) {
    return 'Zeigt anfangs $core Kern-Tools + $lazy erweiterte Tools bei Bedarf';
  }

  @override
  String mcpLazyHintOff(int total) {
    return 'Zeigt alle $total von der aktuellen Quelle unterstützten Tools';
  }

  @override
  String get mcpReadOnly => 'Schreibgeschützter Modus';

  @override
  String get mcpReadOnlyHint =>
      'Blockiert Schreibaktionen wie Playlist-Änderungen, Kommentare und Likes';

  @override
  String get mcpAuthSection => 'Authentifizierung';

  @override
  String get mcpRequireToken => 'Bearer Token erforderlich';

  @override
  String get mcpRequireTokenHint =>
      'Clients müssen den Header Authorization: Bearer <token> senden';

  @override
  String get mcpHttpConfigTitle => 'Client-Konfiguration (Streamable HTTP)';

  @override
  String get mcpHttpConfigDesc =>
      'Für HTTP-MCP-Clients wie Antigravity, Cursor und Claude:';

  @override
  String get mcpCopyHttpConfig => 'HTTP-Konfig kopieren';

  @override
  String get mcpHttpConfigLabel => 'Streamable-HTTP-Konfiguration';

  @override
  String get mcpStdioConfigTitle => 'Stdio-Bridge-Konfiguration (Auto-Wake)';

  @override
  String get mcpStdioConfigDesc =>
      'Für reine stdio-Clients; startet die App bei Anfragen automatisch im Hintergrund:';

  @override
  String get mcpCopyStdioConfig => 'Stdio-Bridge-Konfig kopieren';

  @override
  String get mcpStdioConfigLabel => 'Stdio-Bridge-Konfiguration';

  @override
  String mcpPortStartFailed(int port, String error) {
    return 'Start auf Port $port fehlgeschlagen: $error';
  }

  @override
  String get tabSongs => 'Titel';

  @override
  String get tabAlbums => 'Alben';

  @override
  String get tabPlaylists => 'Playlists';

  @override
  String get tabArtists => 'Künstler';

  @override
  String get tabArtistSearch => 'Künstler';

  @override
  String get sortTitleAZ => 'Titel A-Z';

  @override
  String get sortReleaseDate => 'Erscheinungsdatum';

  @override
  String get sortDefault => 'Standard';

  @override
  String get sortAlbumAZ => 'Album A-Z';

  @override
  String get libraryEmptyTitle => 'Ihre Mediathek ist leer';

  @override
  String get libraryAddSource => 'Musikquelle hinzufügen';

  @override
  String get libraryNoAlbums => 'Noch keine Alben';

  @override
  String get libraryNoSongs => 'Noch keine Titel';

  @override
  String get libraryNoPlaylists => 'Noch keine Playlists';

  @override
  String get libraryNoArtists => 'Noch keine Künstler';

  @override
  String get libraryEarlier => 'Älter';

  @override
  String get libraryCreatedByMe => 'Von mir erstellt';

  @override
  String get libraryCollected => 'Gespeichert';

  @override
  String countTracks(int count) {
    return '$count Titel';
  }

  @override
  String countSongs(int count) {
    return '$count Titel';
  }

  @override
  String countAlbums(int count) {
    return '$count Alben';
  }

  @override
  String countPlays(String count) {
    return '$count× gespielt';
  }

  @override
  String countComments(String count) {
    return '$count Kommentare';
  }

  @override
  String durationHours(int count) {
    return '$count Std.';
  }

  @override
  String durationMinutes(int count) {
    return '$count Min.';
  }

  @override
  String albumTracksDuration(int tracks, int minutes) {
    return '$tracks Titel · $minutes Min.';
  }

  @override
  String get albumNotFound => 'Album nicht gefunden';

  @override
  String get albumKindAlbum => 'Album';

  @override
  String get albumKindSingle => 'Single';

  @override
  String get albumKindCompilation => 'Kompilation';

  @override
  String get albumTracksTitle => 'Titel';

  @override
  String albumReleasedIn(int year) {
    return 'Veröffentlicht $year';
  }

  @override
  String albumReleasedOn(String date) {
    return 'Veröffentlicht am $date';
  }

  @override
  String artistFollowed(String name) {
    return 'Sie folgen nun $name';
  }

  @override
  String get artistUnfollowed => 'Entfolgt';

  @override
  String get artistFollowFailed =>
      'Folgen fehlgeschlagen, später erneut versuchen';

  @override
  String get artistUnfollowFailed =>
      'Entfolgen fehlgeschlagen, später erneut versuchen';

  @override
  String get artistSimilar => 'Ähnliche Künstler';

  @override
  String artistHotTracksOf(String name) {
    return 'Beliebte Titel von $name';
  }

  @override
  String get artistLatestRelease => 'Neueste Veröffentlichung';

  @override
  String get artistHotTracks => 'Beliebte Titel';

  @override
  String get artistSinglesAndEps => 'Singles & EPs';

  @override
  String get playlistSearchPlaceholder => 'In Playlist suchen';

  @override
  String get playlistColTitle => 'Titel';

  @override
  String get playlistColAlbum => 'Album';

  @override
  String get playlistColAdded => 'Hinzugefügt';

  @override
  String get playlistEmpty => 'Keine Titel in dieser Playlist';

  @override
  String playlistNoMatch(String query) {
    return 'Keine Treffer für „$query“';
  }

  @override
  String playlistTagCount(String tag, int count) {
    return '„$tag“ hat $count Titel';
  }

  @override
  String get searchPlaceholder => 'Titel, Alben, Künstler und Playlists suchen';

  @override
  String get searchUnsupported => 'Dieses Plugin unterstützt keine Suche.';

  @override
  String get searchRecent => 'Letzte Suchen';

  @override
  String get searchRecentResults => 'Letzte Ergebnisse';

  @override
  String get searchHot => 'Trends';

  @override
  String get searchRemoveHistory => 'Aus Verlauf entfernen';

  @override
  String searchNoResults(String query) {
    return 'Keine Ergebnisse für „$query“';
  }

  @override
  String searchViewAllSongs(int count) {
    return 'Alle $count Titel anzeigen';
  }

  @override
  String searchViewAllAlbums(int count) {
    return 'Alle $count Alben anzeigen';
  }

  @override
  String searchAllCount(int count) {
    return 'Alle $count';
  }

  @override
  String searchQueueName(String query) {
    return 'Suche „$query“';
  }

  @override
  String searchMcpQueueName(String query) {
    return 'Suche: $query';
  }

  @override
  String get commentSortHot => 'Beliebt';

  @override
  String get commentSortLatest => 'Neueste';

  @override
  String get commentWrite => 'Kommentieren';

  @override
  String get commentEmpty => 'Noch keine Kommentare';

  @override
  String get commentLoadFailed => 'Kommentare konnten nicht geladen werden';

  @override
  String get commentLikeFailed => 'Like fehlgeschlagen';

  @override
  String get commentAnonymous => 'Anonym';

  @override
  String get commentReply => 'Antworten';

  @override
  String get commentPosted => 'Kommentar gepostet';

  @override
  String get commentReplyPosted => 'Antwort gepostet';

  @override
  String get commentPostFailed => 'Posten fehlgeschlagen';

  @override
  String get commentWriteTo => 'Kommentar zu';

  @override
  String get commentPosting => 'Wird gepostet…';

  @override
  String get commentPost => 'Posten';

  @override
  String get commentPlaceholder => 'Kommentar schreiben…';

  @override
  String commentReplyPlaceholder(String name) {
    return '$name antworten…';
  }

  @override
  String get profileLocalUnsupported => 'Lokale Musik hat keine Profilseite.';

  @override
  String profileSourceUnsupported(String name) {
    return '„$name“ hat keine Profilseite.';
  }

  @override
  String profileSignInHint(String name) {
    return 'Melden Sie sich bei „$name“ an, um Ihr Profil zu sehen.';
  }

  @override
  String get profileTopArtists => 'Meistgehörte Künstler';

  @override
  String get profileMostPlayed => 'Meistgehört';

  @override
  String get profileMyPlaylists => 'Meine Playlists';

  @override
  String signOutConfirmTitle(String name) {
    return 'Von „$name“ abmelden?';
  }

  @override
  String get signOutConfirmMessage =>
      'Mediathek, Playlists und Empfehlungen dieser Quelle werden ausgeblendet,\nbis Sie sich erneut anmelden.';

  @override
  String signInDialogTitle(String name) {
    return 'Bei $name anmelden';
  }

  @override
  String get signInQrFailed => 'QR-Code konnte nicht erstellt werden';

  @override
  String get remoteNeedSignIn => 'Anmeldung erforderlich';

  @override
  String remoteErrorKind(String kind) {
    return 'Fehler ($kind)';
  }

  @override
  String remotePluginMissing(String id) {
    return 'Plugin $id ist nicht geladen. Sie können es in den Einstellungen neu laden.';
  }

  @override
  String get remoteSwitchToLocalHint =>
      'Sie können in den Einstellungen zur lokalen Musik wechseln';

  @override
  String get remoteNoDiscover =>
      'Dieses Plugin hat keine Entdecken-Seite. Nutzen Sie die Suche.';

  @override
  String get remoteNoHome =>
      'Dieses Plugin hat keine Startseite. Nutzen Sie die Suche.';

  @override
  String get remoteNoContent => 'Hier gibt es noch nichts.';

  @override
  String get remotePlayAlbumFailed =>
      'Album konnte nicht abgespielt werden, später erneut versuchen';

  @override
  String get greetingLateNight => 'Spät in der Nacht';

  @override
  String get greetingMorning => 'Guten Morgen';

  @override
  String get greetingNoon => 'Guten Tag';

  @override
  String get greetingAfternoon => 'Guten Nachmittag';

  @override
  String get greetingEvening => 'Guten Abend';

  @override
  String get localRecentlyAdded => 'Zuletzt hinzugefügt';

  @override
  String get localEmptyHint =>
      'Noch keine Titel. Fügen Sie in den Einstellungen einen Musikordner hinzu';

  @override
  String get localArtistNotFound => 'Künstler nicht gefunden';

  @override
  String get localFileMovedOrDeleted => 'Datei wurde verschoben oder gelöscht';

  @override
  String get timeJustNow => 'Gerade eben';

  @override
  String timeMinutesAgo(int count) {
    return 'vor $count Min.';
  }

  @override
  String timeHoursAgo(int count) {
    return 'vor $count Std.';
  }

  @override
  String timeDaysAgo(int count) {
    return 'vor $count T.';
  }

  @override
  String timeMonthsAgo(int count) {
    return 'vor $count Mon.';
  }

  @override
  String timeYearsAgo(int count) {
    return 'vor $count J.';
  }

  @override
  String get timeToday => 'Heute';

  @override
  String get timeYesterday => 'Gestern';

  @override
  String dateYear(int year) {
    return '$year';
  }

  @override
  String dateYearMonth(int year, int month) {
    return '$month.$year';
  }

  @override
  String dateMonthDay(int month, int day) {
    return '$day.$month.';
  }

  @override
  String dateYearMonthDay(int year, int month, int day) {
    return '$day.$month.$year';
  }

  @override
  String toastSignedInAs(String name) {
    return 'Angemeldet: $name';
  }

  @override
  String get toastNotSignedIn => 'Nicht angemeldet';

  @override
  String get toastSignOutFailed => 'Abmeldung fehlgeschlagen';

  @override
  String get toastPlayAlbumFailed => 'Album konnte nicht abgespielt werden';

  @override
  String get toastPlayPlaylistFailed =>
      'Playlist konnte nicht abgespielt werden';

  @override
  String toastPlaybackError(String error) {
    return 'Wiedergabefehler: $error';
  }

  @override
  String toastCannotPlayTrack(String title) {
    return '„$title“ kann nicht abgespielt werden';
  }

  @override
  String toastStationEmpty(String name) {
    return 'Keine Titel in $name';
  }

  @override
  String toastStationOpenFailed(String name) {
    return '$name konnte nicht geöffnet werden';
  }

  @override
  String toastAddedToPlaylist(String name) {
    return 'Zu „$name“ hinzugefügt';
  }

  @override
  String toastAddToPlaylistFailed(String name) {
    return 'Konnte nicht zu „$name“ hinzugefügt werden';
  }

  @override
  String toastPlaylistCreated(String name) {
    return 'Playlist „$name“ erstellt';
  }

  @override
  String get toastCreatePlaylistFailed =>
      'Playlist konnte nicht erstellt werden';

  @override
  String get toastRemovedFromPlaylist => 'Aus Playlist entfernt';

  @override
  String get toastRemoveFromPlaylistFailed =>
      'Konnte nicht aus Playlist entfernt werden';

  @override
  String get toastNoSimilarFound => 'Keine ähnlichen Titel gefunden';

  @override
  String toastSimilarQueueName(String title) {
    return 'Ähnlich wie „$title“';
  }

  @override
  String get toastFindSimilarFailed =>
      'Ähnliche Titel konnten nicht gefunden werden';

  @override
  String toastActionFailed(String title) {
    return '„$title“ fehlgeschlagen';
  }

  @override
  String get toastDisliked => 'Wir empfehlen weniger ähnliche Titel';

  @override
  String toastDislikeFailed(String name) {
    return '$name konnte nicht benachrichtigt werden';
  }

  @override
  String get toastLikeFailed => 'Titel konnte nicht geliked werden';

  @override
  String get toastUnlikeFailed => 'Like konnte nicht entfernt werden';

  @override
  String get toastSaveAlbumFailed => 'Album konnte nicht gespeichert werden';

  @override
  String get toastUnsaveAlbumFailed => 'Album konnte nicht entfernt werden';

  @override
  String toastAlbumSaved(String title) {
    return '„$title“ gespeichert';
  }

  @override
  String get toastAlbumUnsaved => 'Aus Mediathek entfernt';

  @override
  String pluginErrIdTaken(String id) {
    return 'id $id ist bereits vergeben';
  }

  @override
  String pluginErrMinAppVersion(String required, String current) {
    return 'Erfordert YesPlayMusic $required oder neuer (aktuell: $current)';
  }

  @override
  String get pluginErrEmptyLink => 'Bitte einen Link eingeben';

  @override
  String get pluginErrInvalidLink => 'Unbekannter Link';

  @override
  String pluginErrDownloadNetwork(String error) {
    return 'Download fehlgeschlagen, Netzwerk prüfen: $error';
  }

  @override
  String pluginErrRepoNotFound(String slug) {
    return 'GitHub-Repository $slug nicht gefunden';
  }

  @override
  String pluginErrNoManifestInPath(String path) {
    return 'Keine plugin.json in $path';
  }

  @override
  String get pluginErrNoManifestInLink =>
      'Keine plugin.json unter diesem Link gefunden';

  @override
  String pluginErrMissingEntry(String file) {
    return 'Einstiegsdatei $file fehlt im Plugin';
  }

  @override
  String pluginErrNotFoundUrl(String url) {
    return 'Nicht gefunden: $url';
  }

  @override
  String get pluginErrGithubRateLimit =>
      'GitHub hat die Anfrage vorübergehend abgelehnt (Rate-Limit). Später erneut versuchen';

  @override
  String pluginErrDownloadHttp(int code) {
    return 'Download fehlgeschlagen: HTTP $code';
  }

  @override
  String get pluginErrTooLarge => 'Plugin zu groß (über 50 MB)';

  @override
  String get pluginErrInvalidZip =>
      'Heruntergeladene Datei ist kein gültiges .zip-Archiv';

  @override
  String pluginErrManifestJson(String error) {
    return 'plugin.json ist kein gültiges JSON: $error';
  }

  @override
  String get pluginErrManifestObject => 'plugin.json muss ein JSON-Objekt sein';

  @override
  String pluginErrManifestIdChars(String id) {
    return 'id „$id“ darf nur Kleinbuchstaben, Ziffern und . _ - enthalten';
  }

  @override
  String get pluginErrManifestIdLocal => 'id „local“ ist reserviert';

  @override
  String get pluginErrManifestNoName => 'name fehlt';

  @override
  String pluginErrManifestMain(String file) {
    return 'main „$file“ muss eine .js-Datei im Plugin-Ordner sein';
  }

  @override
  String pluginErrManifestIcon(String file) {
    return 'icon „$file“ muss eine png-, jpg- oder webp-Datei im Plugin-Ordner sein';
  }

  @override
  String pluginErrStopped(String name) {
    return '$name wurde gestoppt';
  }

  @override
  String pluginErrNoManifestDir(String dir) {
    return '$dir: plugin.json fehlt';
  }

  @override
  String pluginErrMinVersionSimple(String name, String version) {
    return '$name erfordert YesPlayMusic $version oder neuer';
  }

  @override
  String pluginErrProcessExited(String name) {
    return '$name: Plugin-Prozess unerwartet beendet';
  }

  @override
  String pluginErrNotObject(String name, String op) {
    return '$name.$op gab kein Objekt zurück';
  }

  @override
  String pluginErrNotArray(String name, String op) {
    return '$name.$op gab kein Array zurück';
  }

  @override
  String pluginErrInvalidStreamUrl(String name) {
    return '$name gab eine ungültige Stream-URL zurück';
  }

  @override
  String pluginErrDuplicateId(String id) {
    return 'Doppelte Plugin-ID: $id';
  }

  @override
  String pluginErrTimeoutDisabled(int seconds) {
    return 'Plugin antwortete $seconds Sek. nicht und wurde deaktiviert';
  }

  @override
  String get pluginErrOomDisabled =>
      'Plugin hatte keinen Speicher mehr und wurde deaktiviert';

  @override
  String get pluginErrLoadTimeout => 'Zeitüberschreitung beim Laden';

  @override
  String pluginErrOpTimeout(String op, int seconds) {
    return 'Zeitüberschreitung bei $op ($seconds Sek.)';
  }

  @override
  String get pluginErrClosed => 'Plugin ist geschlossen';

  @override
  String sourceErrUnsupported(String name, String op) {
    return '$name unterstützt $op nicht';
  }

  @override
  String sourceErrNotFound(String source) {
    return 'Quelle nicht gefunden: $source';
  }

  @override
  String get actionReplace => 'Ersetzen';

  @override
  String pluginIdConflict(String name, String source) {
    return '„$name“ ist bereits aus $source installiert – eine andere Quelle mit derselben ID. Beim Ersetzen werden seine Einstellungen, Anmeldung und erteilten Berechtigungen gelöscht.';
  }

  @override
  String pluginIdConflictUnknown(String name) {
    return '„$name“ ist bereits mit derselben ID installiert, aber es lässt sich nicht bestätigen, dass es aus derselben Quelle stammt. Beim Ersetzen werden seine Einstellungen, Anmeldung und erteilten Berechtigungen gelöscht.';
  }

  @override
  String get pluginCheckUpdate => 'Nach Updates suchen';

  @override
  String pluginUpToDate(String name) {
    return '„$name“ ist aktuell';
  }

  @override
  String pluginUpdateFoundToast(String name, String version) {
    return '„$name“ kann auf $version aktualisiert werden';
  }

  @override
  String pluginUpdateCheckFailed(String error) {
    return 'Suche nach Updates fehlgeschlagen: $error';
  }

  @override
  String get pluginSectionUpdates => 'Updates';

  @override
  String get pluginAutoUpdate => 'Automatisch aktualisieren';

  @override
  String get pluginAutoUpdateDetail =>
      'Installiert neue Versionen im Hintergrund. Versionen, die neue Berechtigungen anfordern, musst du weiterhin selbst bestätigen.';

  @override
  String get pluginAutoUpdateUnsupported =>
      'Nur verfügbar für Plugins, die von GitHub installiert wurden oder ein GitHub-Repository in plugin.json angeben.';

  @override
  String pluginAutoUpdatedToast(String name, String version) {
    return '„$name“ wurde auf $version aktualisiert';
  }
}
