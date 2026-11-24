// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for French (`fr`).
class AppLocalizationsFr extends AppLocalizations {
  AppLocalizationsFr([String locale = 'fr']) : super(locale);

  @override
  String get navHome => 'Accueil';

  @override
  String get navDiscover => 'Explorer';

  @override
  String get navLibrary => 'Bibliothèque';

  @override
  String get navSearch => 'Rechercher';

  @override
  String get navSearchPage => 'Recherche';

  @override
  String get navSettings => 'Paramètres';

  @override
  String get navProfile => 'Profil';

  @override
  String get actionPlay => 'Lire';

  @override
  String get actionPause => 'Pause';

  @override
  String get actionPlayAll => 'Tout lire';

  @override
  String get actionShuffle => 'Aléatoire';

  @override
  String get actionNext => 'Suivant';

  @override
  String get actionPrev => 'Précédent';

  @override
  String get actionLike => 'J\'aime';

  @override
  String get actionUnlike => 'Ne plus aimer';

  @override
  String get actionSaveAlbum => 'Enregistrer l\'album';

  @override
  String get actionUnsave => 'Retirer de la bibliothèque';

  @override
  String get actionFollow => 'Suivre';

  @override
  String get actionFollowing => 'Suivi';

  @override
  String get actionMore => 'Plus';

  @override
  String get actionBack => 'Retour';

  @override
  String get actionClose => 'Fermer';

  @override
  String get windowMinimize => 'Réduire';

  @override
  String get windowMaximize => 'Agrandir';

  @override
  String get windowRestore => 'Niveau inférieur';

  @override
  String get actionCancel => 'Annuler';

  @override
  String get actionConfirm => 'OK';

  @override
  String get actionClear => 'Effacer';

  @override
  String get actionClearShort => 'Effacer';

  @override
  String get actionRetry => 'Réessayer';

  @override
  String get actionOpen => 'Ouvrir';

  @override
  String get actionSave => 'Enregistrer';

  @override
  String get actionSaving => 'Enregistrement…';

  @override
  String get actionDone => 'Terminé';

  @override
  String get actionApply => 'Appliquer';

  @override
  String get actionCopy => 'Copier';

  @override
  String get actionReset => 'Réinitialiser';

  @override
  String get actionAdd => 'Ajouter';

  @override
  String get actionSelect => 'Sélectionner';

  @override
  String get actionAll => 'Tout';

  @override
  String get actionCollapse => 'Réduire';

  @override
  String get actionExpandAllCategories => 'Toutes les catégories';

  @override
  String get actionPrevPage => 'Page précédente';

  @override
  String get actionNextPage => 'Page suivante';

  @override
  String get actionViewFullText => 'Lire la suite';

  @override
  String get actionShow => 'Afficher';

  @override
  String get actionHide => 'Masquer';

  @override
  String get actionReload => 'Recharger';

  @override
  String get actionInstall => 'Installer';

  @override
  String get actionUpdate => 'Mettre à jour';

  @override
  String get actionUninstall => 'Désinstaller';

  @override
  String get actionEnable => 'Activer';

  @override
  String get actionSignIn => 'Se connecter';

  @override
  String get actionSignOut => 'Se déconnecter';

  @override
  String get actionManageSources => 'Gérer les sources';

  @override
  String get actionManagePlugins => 'Gérer les plugins';

  @override
  String get actionGoSearch => 'Aller à la recherche';

  @override
  String get actionLoadMore => 'Charger plus';

  @override
  String get stateLoading => 'Chargement…';

  @override
  String get stateLoadingShort => 'Chargement…';

  @override
  String get stateLoadFailed => 'Échec du chargement';

  @override
  String get stateCouldNotLoad => 'Impossible de charger';

  @override
  String get stateSigningIn => 'Connexion…';

  @override
  String get stateSigningInShort => 'Connexion…';

  @override
  String get stateSignedIn => 'Connecté';

  @override
  String get stateNotSignedIn => 'Non connecté';

  @override
  String get stateNone => 'Aucun';

  @override
  String get statePleaseSelect => 'Sélectionner';

  @override
  String get stateCopied => 'Copié';

  @override
  String get stateSaved => 'Enregistré';

  @override
  String stateSaveFailed(String error) {
    return 'Échec de l\'enregistrement : $error';
  }

  @override
  String get miniShuffleOn => 'Aléatoire : activé';

  @override
  String get miniRepeatOn => 'Tout répéter';

  @override
  String get miniRepeatOff => 'Ne pas répéter';

  @override
  String get miniQueue => 'File d\'attente';

  @override
  String get miniOpenNowPlaying => 'Ouvrir la lecture en cours';

  @override
  String get miniMute => 'Muet';

  @override
  String get npTitle => 'Lecture en cours';

  @override
  String get npComments => 'Commentaires';

  @override
  String get npSimilar => 'Similaires';

  @override
  String npSimilarTo(String title) {
    return 'Similaires à $title';
  }

  @override
  String get npNoSimilar => 'Aucun titre similaire trouvé';

  @override
  String get npUpNext => 'À suivre';

  @override
  String get npQueueEmpty => 'Plus aucun titre dans la file d\'attente';

  @override
  String get npFromPrefix => 'Depuis ';

  @override
  String get npViewAlbum => 'Voir l\'album';

  @override
  String get npViewArtist => 'Voir l\'artiste';

  @override
  String get menuPlayNext => 'Lire ensuite';

  @override
  String get menuAddedNext => 'Sera lu ensuite';

  @override
  String get menuAddToQueue => 'Ajouter à la file';

  @override
  String get menuAddedToQueue => 'Ajouté à la file d\'attente';

  @override
  String get menuAddToPlaylist => 'Ajouter à une playlist';

  @override
  String get menuCreatePlaylist => 'Nouvelle playlist';

  @override
  String get menuPlaylistNamePlaceholder => 'Nom de la playlist';

  @override
  String get menuCreateAndAdd => 'Créer et ajouter';

  @override
  String get menuPlaySimilar => 'Lire des titres similaires';

  @override
  String get menuDislike => 'Je n\'aime pas';

  @override
  String get menuRemoveFromPlaylist => 'Retirer de la playlist';

  @override
  String get shortcutGroupPlayback => 'Lecture';

  @override
  String get shortcutGroupUi => 'Interface';

  @override
  String get shortcutGroupMediaKeys => 'Touches multimédias';

  @override
  String get shortcutPlayPause => 'Lecture / Pause';

  @override
  String get shortcutSpaceKey => 'Espace';

  @override
  String get shortcutSeekForward => 'Avancer de 5 s';

  @override
  String get shortcutSeekBackward => 'Reculer de 5 s';

  @override
  String get shortcutVolumeUp => 'Augmenter le volume';

  @override
  String get shortcutVolumeDown => 'Baisser le volume';

  @override
  String get shortcutMute => 'Muet';

  @override
  String get shortcutRepeat => 'Mode de répétition';

  @override
  String get shortcutLikeCurrent => 'Aimer le titre en cours';

  @override
  String get shortcutDismissOverlay => 'Fermer la lecture / boîte de dialogue';

  @override
  String get shortcutBack => 'Précédent';

  @override
  String get shortcutForward => 'Suivant';

  @override
  String get shortcutSwitchTab => 'Changer d\'onglet latéral';

  @override
  String get shortcutKeyRangeTo => 'à';

  @override
  String get shortcutMediaKeysLabel =>
      'Touches multimédias du clavier et écouteurs';

  @override
  String get shortcutTypingHintMac =>
      'Lors de la saisie, seuls ⌘F et Esc sont actifs';

  @override
  String get shortcutTypingHintOther =>
      'Lors de la saisie, seuls Ctrl+F et Esc sont actifs';

  @override
  String get menuBarSettings => 'Paramètres…';

  @override
  String get menuBarView => 'Présentation';

  @override
  String get menuBarWindow => 'Fenêtre';

  @override
  String get swatchLilac => 'Lilas';

  @override
  String get swatchSky => 'Ciel';

  @override
  String get swatchMint => 'Menthe';

  @override
  String get swatchSun => 'Soleil';

  @override
  String get swatchRose => 'Rose';

  @override
  String get swatchFlame => 'Flamme';

  @override
  String get settingsGeneral => 'Général';

  @override
  String get settingsShortcuts => 'Raccourcis';

  @override
  String get settingsPlugins => 'Plugins';

  @override
  String get settingsAbout => 'À propos';

  @override
  String get settingsAppearance => 'Apparence';

  @override
  String get settingsLyrics => 'Paroles';

  @override
  String get settingsPlayback => 'Lecture';

  @override
  String get settingsStorage => 'Stockage';

  @override
  String get settingsAccentColor => 'Couleur d\'accentuation';

  @override
  String get settingsLanguage => 'Langue';

  @override
  String get langSystem => 'Suivre le système';

  @override
  String get settingsMiniLyric =>
      'Toujours afficher les paroles dans le mini-lecteur';

  @override
  String get settingsKeepRunning =>
      'Continuer en arrière-plan après la fermeture';

  @override
  String get trayShowWindow => 'Afficher la fenêtre';

  @override
  String get trayQuit => 'Quitter';

  @override
  String aboutDownloadVersion(String version) {
    return 'Télécharger $version';
  }

  @override
  String get aboutChecking => 'Vérification…';

  @override
  String get aboutCheckUpdate => 'Vérifier les mises à jour';

  @override
  String get aboutAutoCheck => 'Vérifier automatiquement les mises à jour';

  @override
  String get aboutAnalytics =>
      'Envoyer des statistiques d’utilisation anonymes';

  @override
  String get aboutSourceAndFeedback => 'Code source et retours';

  @override
  String aboutVersion(String version) {
    return 'Version $version';
  }

  @override
  String get aboutLogs => 'Journaux';

  @override
  String get aboutLogsHint => 'À joindre pour signaler un problème';

  @override
  String get aboutOpenFolder => 'Ouvrir le dossier';

  @override
  String get aboutOpen => 'Ouvrir';

  @override
  String updaterNewVersion(String version) {
    return 'Nouvelle version $version disponible';
  }

  @override
  String get updaterUpToDate => 'Vous êtes à jour';

  @override
  String get updaterCheckFailed => 'Échec de la vérification des mises à jour';

  @override
  String storageClearTitle(String size) {
    return 'Effacer $size de cache ?';
  }

  @override
  String get storageClearMessage =>
      'Les caches API, audio et images seront effacés\net téléchargés à nouveau si besoin.';

  @override
  String storageCleared(String size) {
    return '$size de cache effacés';
  }

  @override
  String storageLimit(String size) {
    return '/ limite $size';
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
  String get storageClearing => 'Suppression…';

  @override
  String get storageClearCache => 'Vider le cache';

  @override
  String get sourceMusicSource => 'Source musicale';

  @override
  String get sourceLocal => 'Musique locale';

  @override
  String get sourceLocalDesc =>
      'Lire les fichiers audio stockés sur votre ordinateur';

  @override
  String get sourceBuiltIn => 'Intégré';

  @override
  String get sourceInUse => 'Actif';

  @override
  String get sourceScanning => 'Analyse…';

  @override
  String get sourceNoFolders => 'Aucun dossier ajouté';

  @override
  String sourceFolderAlbums(int folders, int albums) {
    return '$folders dossiers, $albums albums';
  }

  @override
  String get sourceAddFolderEllipsis => 'Ajouter un dossier musical…';

  @override
  String get sourceAddFolder => 'Ajouter un dossier';

  @override
  String get sourceAddMusicFolder => 'Ajouter un dossier musical';

  @override
  String get sourceRescan => 'Réanalyser';

  @override
  String get sourceMusicFolders => 'Dossiers musicaux';

  @override
  String get sourceNoFoldersAdded => 'Aucun dossier musical ajouté';

  @override
  String get sourceOpenInFileManager =>
      'Ouvrir dans le gestionnaire de fichiers';

  @override
  String get sourceShowInFileManager =>
      'Afficher dans le gestionnaire de fichiers';

  @override
  String get sourceStopScanningFolder => 'Ne plus analyser ce dossier';

  @override
  String sourceSwitchedTo(String name) {
    return 'Basculé sur « $name »';
  }

  @override
  String get sourceFolderAlreadyScanned =>
      'Ce dossier est déjà inclus dans l\'analyse';

  @override
  String get sourceNoMusicFound => 'Aucune musique trouvée';

  @override
  String sourceScanningCount(int count) {
    final intl.NumberFormat countNumberFormat =
        intl.NumberFormat.decimalPattern(localeName);
    final String countString = countNumberFormat.format(count);

    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$countString titres',
      one: '1 titre',
    );
    return 'Analyse… $_temp0';
  }

  @override
  String sourceFoldersUnreadable(int count) {
    final intl.NumberFormat countNumberFormat =
        intl.NumberFormat.decimalPattern(localeName);
    final String countString = countNumberFormat.format(count);

    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$countString dossiers illisibles ont été ignorés',
      one: '1 dossier illisible a été ignoré',
    );
    return '$_temp0';
  }

  @override
  String get sourceFolderUnreadable => 'Illisible, ignoré';

  @override
  String get sourceCancelScan => 'Annuler l\'analyse';

  @override
  String get sourceNotFound => 'Source musicale introuvable';

  @override
  String pluginsLoadedToast(int count) {
    return '$count plugins chargés';
  }

  @override
  String get pluginFind => 'Rechercher des plugins';

  @override
  String get pluginInstallTitle => 'Installer un plugin';

  @override
  String get pluginTabInstalled => 'Installés';

  @override
  String get pluginTabOfficial => 'Officiels';

  @override
  String get pluginOpenDir => 'Ouvrir le dossier des plugins';

  @override
  String get pluginThirdPartyHint =>
      'Les plugins tiers sont maintenus par leurs auteurs respectifs';

  @override
  String get pluginDevDocs => 'Documentation des plugins ›';

  @override
  String get pluginComingSoon => 'Bientôt disponible';

  @override
  String get pluginInstallFromLink => 'Installer via un lien';

  @override
  String get pluginInstallFromLinkHint => 'Dépôt GitHub, Release ou .zip';

  @override
  String pluginUninstallTitle(String name) {
    return 'Désinstaller « $name » ?';
  }

  @override
  String get pluginUninstallMessage =>
      'Les paramètres et la session du plugin seront supprimés';

  @override
  String pluginUninstalled(String name) {
    return '« $name » désinstallé';
  }

  @override
  String pluginUpdateAvailable(String version) {
    return 'Mise à jour : $version';
  }

  @override
  String pluginNeedSetting(String field) {
    return '$field requis';
  }

  @override
  String pluginSignedInAs(String name) {
    return 'Connecté en tant que $name';
  }

  @override
  String pluginDisabledToast(String name) {
    return '« $name » désactivé';
  }

  @override
  String pluginEnabledToast(String name) {
    return '« $name » activé';
  }

  @override
  String get pluginHasUpdate => 'Mise à jour';

  @override
  String get pluginSignInAccount => 'Se connecter';

  @override
  String get pluginSettingsEllipsis => 'Paramètres du plugin…';

  @override
  String get pluginDisable => 'Désactiver le plugin';

  @override
  String get pluginReload => 'Recharger les plugins';

  @override
  String get pluginUninstallEllipsis => 'Désinstaller le plugin…';

  @override
  String get pluginDeleteEllipsis => 'Supprimer le plugin…';

  @override
  String get pluginDisabledBadge => 'Désactivé';

  @override
  String get pluginNotLoadedBadge => 'Non chargé';

  @override
  String get pluginNotLoadedStatus => 'Le plugin n\'a pas été chargé';

  @override
  String get pluginEmptyTitle => 'Aucun plugin installé';

  @override
  String get pluginEmptyHint => 'Liens GitHub pris en charge';

  @override
  String get pluginSettingsTitle => 'Paramètres du plugin';

  @override
  String get pluginSectionAccount => 'Compte';

  @override
  String get pluginSectionCapabilities => 'Fonctionnalités';

  @override
  String get pluginSectionPermissions => 'Permissions';

  @override
  String get pluginDisabledHint =>
      'Le plugin est désactivé. Activez-le pour appliquer';

  @override
  String get pluginUninstallBtn => 'Désinstaller le plugin';

  @override
  String get pluginSignInSyncHint =>
      'Connectez-vous pour synchroniser vos favoris et playlists';

  @override
  String get pluginGetIt => 'Obtenir ›';

  @override
  String pluginUpdatedToast(String name) {
    return '« $name » mis à jour';
  }

  @override
  String pluginInstalledToast(String name) {
    return '« $name » installé';
  }

  @override
  String pluginInstallFailed(String error) {
    return 'Échec de l\'installation : $error';
  }

  @override
  String get pluginInstallPrompt =>
      'Collez l\'URL d\'un dépôt GitHub\nou un lien de téléchargement de plugin';

  @override
  String get pluginInstallPlaceholder => 'github.com/auteur/depot';

  @override
  String get pluginInstallSupportHint =>
      'Prend en charge les dépôts GitHub, Releases, plugin.json et liens .zip';

  @override
  String get pluginReading => 'Lecture…';

  @override
  String get pluginNextStep => 'Suivant';

  @override
  String get pluginInstallFromLocal => 'Installer depuis un dossier local…';

  @override
  String pluginPublishedAgo(String ago) {
    return ', publié $ago';
  }

  @override
  String get pluginLocalFolder => 'Dossier local';

  @override
  String get pluginLatestCode => 'Dernier code';

  @override
  String pluginInstalledVersion(String version) {
    return 'Installé $version';
  }

  @override
  String get pluginPermissionsNeeded => 'Permissions requises';

  @override
  String get pluginPermNoNetwork => 'Aucun accès réseau';

  @override
  String get pluginPermNoNetworkDetail => 'Ne se connecte à aucun site web';

  @override
  String get pluginPermAnyWebsite => 'Accès à tout site web';

  @override
  String get pluginPermAnyWebsiteDetail =>
      'Peut se connecter à n\'importe quel site';

  @override
  String get pluginPermAnyWebsiteFull =>
      'Peut accéder à n\'importe quel site web';

  @override
  String get pluginPermNetwork => 'Accès réseau';

  @override
  String get pluginPermSignInDetail =>
      'Ouvre une page de connexion et lit les cookies après connexion';

  @override
  String get pluginPermProcess => 'Exécuter des programmes locaux';

  @override
  String get pluginPermProcessBadge => 'Autorisation requise';

  @override
  String pluginPermProcessDetail(String programs) {
    return '$programs. Désactivé par défaut ; activable dans les paramètres du plugin';
  }

  @override
  String get pluginPermStorage => 'Stockage de données';

  @override
  String get pluginPermStorageDetail =>
      'Enregistre les paramètres, la session et le cache';

  @override
  String get pluginCapabilitiesProvided => 'Fonctionnalités fournies';

  @override
  String get pluginNavIconHint =>
      'Les éléments avec icône sont ajoutés à la barre latérale';

  @override
  String get pluginTrustHint =>
      'N\'installez que des plugins provenant de sources fiables';

  @override
  String get pluginInstalling => 'Installation…';

  @override
  String get pluginYourServer => 'votre serveur configuré';

  @override
  String pluginCanAccessHosts(String hosts) {
    return 'Accède à $hosts';
  }

  @override
  String pluginCanAccessHostsMore(String hosts, int count) {
    return 'Accède à $hosts ($count au total)';
  }

  @override
  String get pluginOnlyYourServer =>
      'Accède uniquement au serveur configuré dans les paramètres';

  @override
  String pluginAndYourServer(String hosts) {
    return '$hosts, ainsi que le serveur configuré dans les paramètres';
  }

  @override
  String get pluginAnyProgram => 'Tout programme local';

  @override
  String get officialJellyfinDesc => 'Se connecter à un serveur Jellyfin';

  @override
  String get officialPlexDesc => 'Se connecter à Plex Media Server';

  @override
  String get officialSubsonicDesc =>
      'Se connecter à Navidrome et autres serveurs Subsonic';

  @override
  String get officialEmbyDesc => 'Se connecter à un serveur Emby';

  @override
  String get capSuggest => 'Suggestions';

  @override
  String get capLyrics => 'Paroles';

  @override
  String get capPlaylist => 'Playlists';

  @override
  String get capEditPlaylist => 'Modifier les playlists';

  @override
  String get capFavorites => 'Favoris';

  @override
  String get capAlbum => 'Albums';

  @override
  String get capArtist => 'Artistes';

  @override
  String get capRadio => 'Radio';

  @override
  String get capSimilar => 'Similaires';

  @override
  String get capHistory => 'Historique';

  @override
  String get capDislike => 'Pas intéressé';

  @override
  String get capTrackMenu => 'Menu du titre';

  @override
  String get mcpPortRangeError =>
      'Le port doit être compris entre 1024 et 65535';

  @override
  String mcpPortUpdated(int port) {
    return 'Port mis à jour vers $port';
  }

  @override
  String mcpCopiedLabel(String label) {
    return '$label copié';
  }

  @override
  String mcpRunning(String url) {
    return 'En cours · $url';
  }

  @override
  String get mcpStopped => 'Arrêté';

  @override
  String get mcpEnableLocal => 'Activer le serveur MCP local';

  @override
  String get mcpEnableHint =>
      'Écoute uniquement sur 127.0.0.1 pour les clients IA externes';

  @override
  String mcpSessions(int count) {
    return '$count sessions';
  }

  @override
  String get mcpListenPort => 'Port d\'écoute';

  @override
  String get mcpPortHint => 'Par défaut 18888 (Streamable HTTP)';

  @override
  String get mcpLazyMode => 'Mode chargement différé MCP';

  @override
  String mcpLazyHintOn(int core, int lazy) {
    return 'Expose initialement $core outils principaux + $lazy outils étendus à la demande';
  }

  @override
  String mcpLazyHintOff(int total) {
    return 'Expose les $total outils pris en charge par la source actuelle';
  }

  @override
  String get mcpReadOnly => 'Mode lecture seule sécurisé';

  @override
  String get mcpReadOnlyHint =>
      'Bloque les actions d\'écriture (playlists, commentaires, favoris)';

  @override
  String get mcpAuthSection => 'Authentification';

  @override
  String get mcpRequireToken => 'Exiger un Bearer Token';

  @override
  String get mcpRequireTokenHint =>
      'Les clients doivent envoyer l\'en-tête Authorization: Bearer <token>';

  @override
  String get mcpHttpConfigTitle => 'Configuration client (Streamable HTTP)';

  @override
  String get mcpHttpConfigDesc =>
      'Pour les clients MCP HTTP tels qu\'Antigravity, Cursor et Claude :';

  @override
  String get mcpCopyHttpConfig => 'Copier la config HTTP';

  @override
  String get mcpHttpConfigLabel => 'Configuration Streamable HTTP';

  @override
  String get mcpStdioConfigTitle => 'Configuration pont Stdio (réveil auto)';

  @override
  String get mcpStdioConfigDesc =>
      'Pour les clients stdio uniquement ; lance l\'application en arrière-plan si besoin :';

  @override
  String get mcpCopyStdioConfig => 'Copier la config Stdio';

  @override
  String get mcpStdioConfigLabel => 'Configuration pont Stdio';

  @override
  String mcpPortStartFailed(int port, String error) {
    return 'Échec du démarrage sur le port $port : $error';
  }

  @override
  String get tabSongs => 'Titres';

  @override
  String get tabAlbums => 'Albums';

  @override
  String get tabPlaylists => 'Playlists';

  @override
  String get tabArtists => 'Artistes';

  @override
  String get tabArtistSearch => 'Artistes';

  @override
  String get sortTitleAZ => 'Titre A-Z';

  @override
  String get sortReleaseDate => 'Date de sortie';

  @override
  String get sortDefault => 'Par défaut';

  @override
  String get sortAlbumAZ => 'Album A-Z';

  @override
  String get libraryEmptyTitle => 'Votre bibliothèque est vide';

  @override
  String get libraryAddSource => 'Ajouter une source';

  @override
  String get libraryNoAlbums => 'Aucun album';

  @override
  String get libraryNoSongs => 'Aucun titre';

  @override
  String get libraryNoPlaylists => 'Aucune playlist';

  @override
  String get libraryNoArtists => 'Aucun artiste';

  @override
  String get libraryEarlier => 'Plus ancien';

  @override
  String get libraryCreatedByMe => 'Créées par moi';

  @override
  String get libraryCollected => 'Enregistrées';

  @override
  String countTracks(int count) {
    return '$count titres';
  }

  @override
  String countSongs(int count) {
    return '$count titres';
  }

  @override
  String countAlbums(int count) {
    return '$count albums';
  }

  @override
  String countPlays(String count) {
    return '$count écoutes';
  }

  @override
  String countComments(String count) {
    return '$count commentaires';
  }

  @override
  String durationHours(int count) {
    return '$count h';
  }

  @override
  String durationMinutes(int count) {
    return '$count min';
  }

  @override
  String albumTracksDuration(int tracks, int minutes) {
    return '$tracks titres · $minutes min';
  }

  @override
  String get albumNotFound => 'Album introuvable';

  @override
  String get albumKindAlbum => 'Album';

  @override
  String get albumKindSingle => 'Single';

  @override
  String get albumKindCompilation => 'Compilation';

  @override
  String get albumTracksTitle => 'Titres';

  @override
  String albumReleasedIn(int year) {
    return 'Sorti en $year';
  }

  @override
  String albumReleasedOn(String date) {
    return 'Sorti le $date';
  }

  @override
  String artistFollowed(String name) {
    return 'Vous suivez $name';
  }

  @override
  String get artistUnfollowed => 'Vous ne suivez plus cet artiste';

  @override
  String get artistFollowFailed => 'Impossible de suivre, réessayez plus tard';

  @override
  String get artistUnfollowFailed =>
      'Impossible de ne plus suivre, réessayez plus tard';

  @override
  String get artistSimilar => 'Artistes similaires';

  @override
  String artistHotTracksOf(String name) {
    return 'Titres populaires de $name';
  }

  @override
  String get artistLatestRelease => 'Dernière sortie';

  @override
  String get artistHotTracks => 'Titres populaires';

  @override
  String get artistSinglesAndEps => 'Singles & EP';

  @override
  String get playlistSearchPlaceholder => 'Rechercher dans la playlist';

  @override
  String get playlistColTitle => 'Titre';

  @override
  String get playlistColAlbum => 'Album';

  @override
  String get playlistColAdded => 'Date d\'ajout';

  @override
  String get playlistEmpty => 'Aucun titre dans cette playlist';

  @override
  String playlistNoMatch(String query) {
    return 'Aucun résultat pour « $query »';
  }

  @override
  String playlistTagCount(String tag, int count) {
    return '« $tag » contient $count titres';
  }

  @override
  String get searchPlaceholder =>
      'Rechercher titres, albums, artistes et playlists';

  @override
  String get searchUnsupported =>
      'Ce plugin ne prend pas en charge la recherche.';

  @override
  String get searchRecent => 'Recherches récentes';

  @override
  String get searchRecentResults => 'Résultats récents';

  @override
  String get searchHot => 'Tendances';

  @override
  String get searchRemoveHistory => 'Supprimer de l\'historique';

  @override
  String searchNoResults(String query) {
    return 'Aucun résultat pour « $query »';
  }

  @override
  String searchViewAllSongs(int count) {
    return 'Voir les $count titres';
  }

  @override
  String searchViewAllAlbums(int count) {
    return 'Voir les $count albums';
  }

  @override
  String searchAllCount(int count) {
    return 'Tout ($count)';
  }

  @override
  String searchQueueName(String query) {
    return 'Recherche « $query »';
  }

  @override
  String searchMcpQueueName(String query) {
    return 'Recherche : $query';
  }

  @override
  String get commentSortHot => 'Populaires';

  @override
  String get commentSortLatest => 'Récents';

  @override
  String get commentWrite => 'Écrire un commentaire';

  @override
  String get commentEmpty => 'Aucun commentaire';

  @override
  String get commentLoadFailed => 'Échec du chargement des commentaires';

  @override
  String get commentLikeFailed => 'Impossible d\'aimer';

  @override
  String get commentAnonymous => 'Anonyme';

  @override
  String get commentReply => 'Répondre';

  @override
  String get commentPosted => 'Commentaire publié';

  @override
  String get commentReplyPosted => 'Réponse publiée';

  @override
  String get commentPostFailed => 'Échec de la publication';

  @override
  String get commentWriteTo => 'Commenter';

  @override
  String get commentPosting => 'Publication…';

  @override
  String get commentPost => 'Publier';

  @override
  String get commentPlaceholder => 'Écrire un commentaire…';

  @override
  String commentReplyPlaceholder(String name) {
    return 'Répondre à $name…';
  }

  @override
  String get profileLocalUnsupported =>
      'La musique locale n\'a pas de page de profil.';

  @override
  String profileSourceUnsupported(String name) {
    return '« $name » n\'a pas de page de profil.';
  }

  @override
  String profileSignInHint(String name) {
    return 'Connectez-vous à « $name » pour voir votre profil.';
  }

  @override
  String get profileTopArtists => 'Artistes les plus écoutés';

  @override
  String get profileMostPlayed => 'Les plus écoutés';

  @override
  String get profileMyPlaylists => 'Mes playlists';

  @override
  String signOutConfirmTitle(String name) {
    return 'Se déconnecter de « $name » ?';
  }

  @override
  String get signOutConfirmMessage =>
      'Votre bibliothèque, vos playlists et recommandations de cette source seront masquées\njusqu\'à votre prochaine connexion.';

  @override
  String signInDialogTitle(String name) {
    return 'Connexion à $name';
  }

  @override
  String get signInQrFailed => 'Échec de la génération du QR code';

  @override
  String get remoteNeedSignIn => 'Connexion requise';

  @override
  String remoteErrorKind(String kind) {
    return 'Erreur ($kind)';
  }

  @override
  String remotePluginMissing(String id) {
    return 'Le plugin $id n\'est pas chargé. Vous pouvez le recharger dans les paramètres.';
  }

  @override
  String get remoteSwitchToLocalHint =>
      'Vous pouvez revenir à la musique locale dans les paramètres';

  @override
  String get remoteNoDiscover =>
      'Ce plugin n\'a pas de page Explorer. Essayez la recherche.';

  @override
  String get remoteNoHome =>
      'Ce plugin n\'a pas de page d\'accueil. Essayez la recherche.';

  @override
  String get remoteNoContent => 'Rien ici pour le moment.';

  @override
  String get remotePlayAlbumFailed =>
      'Impossible de lire cet album, réessayez plus tard';

  @override
  String get greetingLateNight => 'Bonne nuit';

  @override
  String get greetingMorning => 'Bonjour';

  @override
  String get greetingNoon => 'Bon appétit';

  @override
  String get greetingAfternoon => 'Bon après-midi';

  @override
  String get greetingEvening => 'Bonsoir';

  @override
  String get localRecentlyAdded => 'Récemment ajoutés';

  @override
  String get localEmptyHint =>
      'Aucun titre. Ajoutez un dossier musical dans les paramètres';

  @override
  String get localArtistNotFound => 'Artiste introuvable';

  @override
  String get localFileMovedOrDeleted => 'Le fichier a été déplacé ou supprimé';

  @override
  String get timeJustNow => 'À l\'instant';

  @override
  String timeMinutesAgo(int count) {
    return 'il y a $count min';
  }

  @override
  String timeHoursAgo(int count) {
    return 'il y a $count h';
  }

  @override
  String timeDaysAgo(int count) {
    return 'il y a $count j';
  }

  @override
  String timeMonthsAgo(int count) {
    return 'il y a $count mois';
  }

  @override
  String timeYearsAgo(int count) {
    return 'il y a $count an(s)';
  }

  @override
  String get timeToday => 'Aujourd\'hui';

  @override
  String get timeYesterday => 'Hier';

  @override
  String dateYear(int year) {
    return '$year';
  }

  @override
  String dateYearMonth(int year, int month) {
    return '$month/$year';
  }

  @override
  String dateMonthDay(int month, int day) {
    return '$day/$month';
  }

  @override
  String dateYearMonthDay(int year, int month, int day) {
    return '$day/$month/$year';
  }

  @override
  String toastSignedInAs(String name) {
    return 'Connecté : $name';
  }

  @override
  String get toastNotSignedIn => 'Non connecté';

  @override
  String get toastSignOutFailed => 'Échec de la déconnexion';

  @override
  String get toastPlayAlbumFailed => 'Impossible de lire cet album';

  @override
  String get toastPlayPlaylistFailed => 'Impossible de lire cette playlist';

  @override
  String toastPlaybackError(String error) {
    return 'Erreur de lecture : $error';
  }

  @override
  String toastCannotPlayTrack(String title) {
    return 'Impossible de lire « $title »';
  }

  @override
  String toastStationEmpty(String name) {
    return 'Aucun titre dans $name';
  }

  @override
  String toastStationOpenFailed(String name) {
    return 'Impossible d\'ouvrir $name';
  }

  @override
  String toastAddedToPlaylist(String name) {
    return 'Ajouté à « $name »';
  }

  @override
  String toastAddToPlaylistFailed(String name) {
    return 'Impossible d\'ajouter à « $name »';
  }

  @override
  String toastPlaylistCreated(String name) {
    return 'Playlist « $name » créée';
  }

  @override
  String get toastCreatePlaylistFailed => 'Impossible de créer la playlist';

  @override
  String get toastRemovedFromPlaylist => 'Retiré de la playlist';

  @override
  String get toastRemoveFromPlaylistFailed =>
      'Impossible de retirer de la playlist';

  @override
  String get toastNoSimilarFound => 'Aucun titre similaire trouvé';

  @override
  String toastSimilarQueueName(String title) {
    return 'Similaires à « $title »';
  }

  @override
  String get toastFindSimilarFailed =>
      'Impossible de trouver des titres similaires';

  @override
  String toastActionFailed(String title) {
    return 'Échec de « $title »';
  }

  @override
  String get toastDisliked => 'Nous recommanderons moins de titres similaires';

  @override
  String toastDislikeFailed(String name) {
    return 'Impossible d\'informer $name';
  }

  @override
  String get toastLikeFailed => 'Impossible d\'aimer ce titre';

  @override
  String get toastUnlikeFailed => 'Impossible de retirer le j\'aime';

  @override
  String get toastSaveAlbumFailed => 'Impossible d\'enregistrer cet album';

  @override
  String get toastUnsaveAlbumFailed => 'Impossible de retirer cet album';

  @override
  String toastAlbumSaved(String title) {
    return '« $title » enregistré';
  }

  @override
  String get toastAlbumUnsaved => 'Retiré de la bibliothèque';

  @override
  String pluginErrIdTaken(String id) {
    return 'L\'id $id est déjà utilisé';
  }

  @override
  String pluginErrMinAppVersion(String required, String current) {
    return 'Nécessite YesPlayMusic $required ou ultérieur (actuel : $current)';
  }

  @override
  String get pluginErrEmptyLink => 'Veuillez saisir un lien';

  @override
  String get pluginErrInvalidLink => 'Lien non reconnu';

  @override
  String pluginErrDownloadNetwork(String error) {
    return 'Échec du téléchargement, vérifiez votre réseau : $error';
  }

  @override
  String pluginErrRepoNotFound(String slug) {
    return 'Dépôt GitHub $slug introuvable';
  }

  @override
  String pluginErrNoManifestInPath(String path) {
    return 'Aucun plugin.json dans $path';
  }

  @override
  String get pluginErrNoManifestInLink => 'Aucun plugin.json trouvé à ce lien';

  @override
  String pluginErrMissingEntry(String file) {
    return 'Fichier d\'entrée $file manquant';
  }

  @override
  String pluginErrNotFoundUrl(String url) {
    return 'Introuvable : $url';
  }

  @override
  String get pluginErrGithubRateLimit =>
      'GitHub a temporairement refusé la requête (limite atteinte). Réessayez plus tard';

  @override
  String pluginErrDownloadHttp(int code) {
    return 'Échec du téléchargement : HTTP $code';
  }

  @override
  String get pluginErrTooLarge => 'Plugin trop volumineux (plus de 50 Mo)';

  @override
  String get pluginErrInvalidZip =>
      'Le fichier téléchargé n\'est pas une archive .zip valide';

  @override
  String pluginErrManifestJson(String error) {
    return 'plugin.json n\'est pas un JSON valide : $error';
  }

  @override
  String get pluginErrManifestObject => 'plugin.json doit être un objet JSON';

  @override
  String pluginErrManifestIdChars(String id) {
    return 'id \"$id\" ne peut contenir que des minuscules, chiffres et . _ -';
  }

  @override
  String get pluginErrManifestIdLocal => 'id \"local\" est réservé';

  @override
  String get pluginErrManifestNoName => 'Champ name manquant';

  @override
  String pluginErrManifestMain(String file) {
    return 'main \"$file\" doit être un fichier .js dans le dossier du plugin';
  }

  @override
  String pluginErrManifestIcon(String file) {
    return 'icon \"$file\" doit être un fichier png, jpg ou webp dans le dossier du plugin';
  }

  @override
  String pluginErrStopped(String name) {
    return '$name s\'est arrêté';
  }

  @override
  String pluginErrNoManifestDir(String dir) {
    return '$dir : plugin.json manquant';
  }

  @override
  String pluginErrMinVersionSimple(String name, String version) {
    return '$name nécessite YesPlayMusic $version ou ultérieur';
  }

  @override
  String pluginErrProcessExited(String name) {
    return '$name : le processus du plugin s\'est arrêté de manière inattendue';
  }

  @override
  String pluginErrNotObject(String name, String op) {
    return '$name.$op n\'a pas renvoyé un objet';
  }

  @override
  String pluginErrNotArray(String name, String op) {
    return '$name.$op n\'a pas renvoyé un tableau';
  }

  @override
  String pluginErrInvalidStreamUrl(String name) {
    return '$name a renvoyé une URL de lecture invalide';
  }

  @override
  String pluginErrDuplicateId(String id) {
    return 'id de plugin en double : $id';
  }

  @override
  String pluginErrTimeoutDisabled(int seconds) {
    return 'Le plugin n\'a pas répondu sous $seconds s et a été désactivé';
  }

  @override
  String get pluginErrOomDisabled =>
      'Le plugin a manqué de mémoire et a été désactivé';

  @override
  String get pluginErrLoadTimeout => 'Délai de chargement dépassé';

  @override
  String pluginErrOpTimeout(String op, int seconds) {
    return 'Délai dépassé pour $op ($seconds s)';
  }

  @override
  String get pluginErrClosed => 'Le plugin est fermé';

  @override
  String sourceErrUnsupported(String name, String op) {
    return '$name ne prend pas en charge $op';
  }

  @override
  String sourceErrNotFound(String source) {
    return 'Source introuvable : $source';
  }

  @override
  String get actionReplace => 'Remplacer';

  @override
  String pluginIdConflict(String name, String source) {
    return '« $name » est déjà installé depuis $source, une autre source avec le même identifiant. Le remplacer efface ses réglages, sa connexion et les autorisations accordées.';
  }

  @override
  String pluginIdConflictUnknown(String name) {
    return '« $name » est déjà installé avec le même identifiant, mais rien ne confirme qu’il vienne de la même source. Le remplacer efface ses réglages, sa connexion et les autorisations accordées.';
  }

  @override
  String get pluginCheckUpdate => 'Rechercher des mises à jour';

  @override
  String pluginUpToDate(String name) {
    return '« $name » est à jour';
  }

  @override
  String pluginUpdateFoundToast(String name, String version) {
    return '« $name » peut être mis à jour vers $version';
  }

  @override
  String pluginUpdateCheckFailed(String error) {
    return 'Impossible de rechercher des mises à jour : $error';
  }

  @override
  String get pluginSectionUpdates => 'Mises à jour';

  @override
  String get pluginAutoUpdate => 'Mettre à jour automatiquement';

  @override
  String get pluginAutoUpdateDetail =>
      'Installe les nouvelles versions en arrière-plan. Les versions qui demandent de nouvelles autorisations nécessitent toujours votre confirmation.';

  @override
  String get pluginAutoUpdateUnsupported =>
      'Disponible uniquement pour les plugins installés depuis GitHub ou indiquant un dépôt GitHub dans plugin.json.';

  @override
  String pluginAutoUpdatedToast(String name, String version) {
    return '« $name » a été mis à jour vers $version';
  }
}
