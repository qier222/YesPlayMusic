// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Spanish Castilian (`es`).
class AppLocalizationsEs extends AppLocalizations {
  AppLocalizationsEs([String locale = 'es']) : super(locale);

  @override
  String get navHome => 'Inicio';

  @override
  String get navDiscover => 'Explorar';

  @override
  String get navLibrary => 'Biblioteca';

  @override
  String get navSearch => 'Buscar';

  @override
  String get navSearchPage => 'Búsqueda';

  @override
  String get navSettings => 'Ajustes';

  @override
  String get navProfile => 'Perfil';

  @override
  String get actionPlay => 'Reproducir';

  @override
  String get actionPause => 'Pausar';

  @override
  String get actionPlayAll => 'Reproducir todo';

  @override
  String get actionShuffle => 'Aleatorio';

  @override
  String get actionNext => 'Siguiente';

  @override
  String get actionPrev => 'Anterior';

  @override
  String get actionLike => 'Me gusta';

  @override
  String get actionUnlike => 'Quitar me gusta';

  @override
  String get actionSaveAlbum => 'Guardar álbum';

  @override
  String get actionUnsave => 'Quitar de la biblioteca';

  @override
  String get actionFollow => 'Seguir';

  @override
  String get actionFollowing => 'Siguiendo';

  @override
  String get actionMore => 'Más';

  @override
  String get actionBack => 'Atrás';

  @override
  String get actionClose => 'Cerrar';

  @override
  String get actionCancel => 'Cancelar';

  @override
  String get actionConfirm => 'Aceptar';

  @override
  String get actionClear => 'Limpiar';

  @override
  String get actionClearShort => 'Limpiar';

  @override
  String get actionRetry => 'Reintentar';

  @override
  String get actionOpen => 'Abrir';

  @override
  String get actionSave => 'Guardar';

  @override
  String get actionSaving => 'Guardando…';

  @override
  String get actionDone => 'Listo';

  @override
  String get actionApply => 'Aplicar';

  @override
  String get actionCopy => 'Copiar';

  @override
  String get actionReset => 'Restablecer';

  @override
  String get actionAdd => 'Añadir';

  @override
  String get actionSelect => 'Seleccionar';

  @override
  String get actionAll => 'Todo';

  @override
  String get actionCollapse => 'Contraer';

  @override
  String get actionExpandAllCategories => 'Todas las categorías';

  @override
  String get actionPrevPage => 'Página anterior';

  @override
  String get actionNextPage => 'Página siguiente';

  @override
  String get actionViewFullText => 'Leer más';

  @override
  String get actionShow => 'Mostrar';

  @override
  String get actionHide => 'Ocultar';

  @override
  String get actionReload => 'Recargar';

  @override
  String get actionInstall => 'Instalar';

  @override
  String get actionUpdate => 'Actualizar';

  @override
  String get actionUninstall => 'Desinstalar';

  @override
  String get actionEnable => 'Activar';

  @override
  String get actionSignIn => 'Iniciar sesión';

  @override
  String get actionSignOut => 'Cerrar sesión';

  @override
  String get actionManageSources => 'Gestionar fuentes';

  @override
  String get actionManagePlugins => 'Gestionar plugins';

  @override
  String get actionGoSearch => 'Ir a buscar';

  @override
  String get actionLoadMore => 'Cargar más';

  @override
  String get stateLoading => 'Cargando…';

  @override
  String get stateLoadingShort => 'Cargando…';

  @override
  String get stateLoadFailed => 'Error al cargar';

  @override
  String get stateCouldNotLoad => 'No se pudo cargar';

  @override
  String get stateSigningIn => 'Iniciando sesión…';

  @override
  String get stateSigningInShort => 'Iniciando…';

  @override
  String get stateSignedIn => 'Sesión iniciada';

  @override
  String get stateNotSignedIn => 'Sin iniciar sesión';

  @override
  String get stateNone => 'Ninguno';

  @override
  String get statePleaseSelect => 'Seleccionar';

  @override
  String get stateCopied => 'Copiado';

  @override
  String get stateSaved => 'Guardado';

  @override
  String stateSaveFailed(String error) {
    return 'Error al guardar: $error';
  }

  @override
  String get miniShuffleOn => 'Aleatorio: activado';

  @override
  String get miniRepeatOn => 'Repetir todo';

  @override
  String get miniRepeatOff => 'No repetir';

  @override
  String get miniQueue => 'Cola de reproducción';

  @override
  String get miniOpenNowPlaying => 'Abrir reproducción actual';

  @override
  String get miniMute => 'Silenciar';

  @override
  String get npTitle => 'Reproduciendo';

  @override
  String get npComments => 'Comentarios';

  @override
  String get npSimilar => 'Similares';

  @override
  String npSimilarTo(String title) {
    return 'Similares a $title';
  }

  @override
  String get npNoSimilar => 'No se encontraron canciones similares';

  @override
  String get npUpNext => 'A continuación';

  @override
  String get npQueueEmpty => 'No hay más canciones en la cola';

  @override
  String get npFromPrefix => 'De ';

  @override
  String get npViewAlbum => 'Ver álbum';

  @override
  String get npViewArtist => 'Ver artista';

  @override
  String get menuPlayNext => 'Reproducir a continuación';

  @override
  String get menuAddedNext => 'Se reproducirá a continuación';

  @override
  String get menuAddToQueue => 'Añadir a la cola';

  @override
  String get menuAddedToQueue => 'Añadido a la cola';

  @override
  String get menuAddToPlaylist => 'Añadir a playlist';

  @override
  String get menuCreatePlaylist => 'Nueva playlist';

  @override
  String get menuPlaylistNamePlaceholder => 'Nombre de la playlist';

  @override
  String get menuCreateAndAdd => 'Crear y añadir';

  @override
  String get menuPlaySimilar => 'Reproducir canciones similares';

  @override
  String get menuDislike => 'No me gusta';

  @override
  String get menuRemoveFromPlaylist => 'Quitar de la playlist';

  @override
  String get shortcutGroupPlayback => 'Reproducción';

  @override
  String get shortcutGroupUi => 'Interfaz';

  @override
  String get shortcutGroupMediaKeys => 'Teclas multimedia';

  @override
  String get shortcutPlayPause => 'Reproducir / Pausar';

  @override
  String get shortcutSpaceKey => 'Espacio';

  @override
  String get shortcutSeekForward => 'Avanzar 5 s';

  @override
  String get shortcutSeekBackward => 'Retroceder 5 s';

  @override
  String get shortcutVolumeUp => 'Subir volumen';

  @override
  String get shortcutVolumeDown => 'Bajar volumen';

  @override
  String get shortcutMute => 'Silenciar';

  @override
  String get shortcutRepeat => 'Modo de repetición';

  @override
  String get shortcutLikeCurrent => 'Me gusta a la canción actual';

  @override
  String get shortcutDismissOverlay => 'Cerrar reproducción / diálogo';

  @override
  String get shortcutBack => 'Atrás';

  @override
  String get shortcutForward => 'Adelante';

  @override
  String get shortcutSwitchTab => 'Cambiar pestaña lateral';

  @override
  String get shortcutKeyRangeTo => 'a';

  @override
  String get shortcutMediaKeysLabel =>
      'Teclas multimedia del teclado y auriculares';

  @override
  String get shortcutTypingHintMac => 'Al escribir, solo funcionan ⌘F y Esc';

  @override
  String get shortcutTypingHintOther =>
      'Al escribir, solo funcionan Ctrl+F y Esc';

  @override
  String get menuBarSettings => 'Ajustes…';

  @override
  String get menuBarView => 'Visualización';

  @override
  String get menuBarWindow => 'Ventana';

  @override
  String get swatchLilac => 'Lila';

  @override
  String get swatchSky => 'Cielo';

  @override
  String get swatchMint => 'Menta';

  @override
  String get swatchSun => 'Sol';

  @override
  String get swatchRose => 'Rosa';

  @override
  String get swatchFlame => 'Llama';

  @override
  String get settingsGeneral => 'General';

  @override
  String get settingsShortcuts => 'Atajos';

  @override
  String get settingsPlugins => 'Plugins';

  @override
  String get settingsAbout => 'Acerca de';

  @override
  String get settingsAppearance => 'Apariencia';

  @override
  String get settingsLyrics => 'Letras';

  @override
  String get settingsStorage => 'Almacenamiento';

  @override
  String get settingsAccentColor => 'Color de acento';

  @override
  String get settingsLanguage => 'Idioma';

  @override
  String get langSystem => 'Seguir al sistema';

  @override
  String get settingsMiniLyric => 'Mostrar letra actual en el minirreproductor';

  @override
  String aboutDownloadVersion(String version) {
    return 'Descargar $version';
  }

  @override
  String get aboutChecking => 'Comprobando…';

  @override
  String get aboutCheckUpdate => 'Buscar actualizaciones';

  @override
  String get aboutAutoCheck => 'Buscar actualizaciones automáticamente';

  @override
  String get aboutAnalytics => 'Enviar estadísticas de uso anónimas';

  @override
  String get aboutSourceAndFeedback => 'Código fuente y comentarios';

  @override
  String aboutVersion(String version) {
    return 'Versión $version';
  }

  @override
  String get aboutLogs => 'Registros';

  @override
  String get aboutLogsHint => 'Adjúntalos al informar un problema';

  @override
  String get aboutOpenFolder => 'Abrir carpeta';

  @override
  String get aboutOpen => 'Abrir';

  @override
  String updaterNewVersion(String version) {
    return 'Nueva versión $version disponible';
  }

  @override
  String get updaterUpToDate => 'Tienes la última versión';

  @override
  String get updaterCheckFailed => 'Error al buscar actualizaciones';

  @override
  String storageClearTitle(String size) {
    return '¿Borrar $size de caché?';
  }

  @override
  String get storageClearMessage =>
      'Se borrarán las cachés de API, audio e imágenes\ny se volverán a descargar cuando sea necesario.';

  @override
  String storageCleared(String size) {
    return 'Se borraron $size de caché';
  }

  @override
  String storageLimit(String size) {
    return '/ límite $size';
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
    return 'Imágenes $size';
  }

  @override
  String get storageClearing => 'Borrando…';

  @override
  String get storageClearCache => 'Borrar caché';

  @override
  String get sourceMusicSource => 'Fuente de música';

  @override
  String get sourceLocal => 'Música local';

  @override
  String get sourceLocalDesc => 'Reproduce archivos de audio de tu ordenador';

  @override
  String get sourceBuiltIn => 'Integrado';

  @override
  String get sourceInUse => 'En uso';

  @override
  String get sourceScanning => 'Escaneando…';

  @override
  String get sourceNoFolders => 'Sin carpetas añadidas';

  @override
  String sourceFolderAlbums(int folders, int albums) {
    return '$folders carpetas, $albums álbumes';
  }

  @override
  String get sourceAddFolderEllipsis => 'Añadir carpeta de música…';

  @override
  String get sourceAddFolder => 'Añadir carpeta';

  @override
  String get sourceAddMusicFolder => 'Añadir carpeta de música';

  @override
  String get sourceRescan => 'Reescanear';

  @override
  String get sourceMusicFolders => 'Carpetas de música';

  @override
  String get sourceNoFoldersAdded => 'Aún no se han añadido carpetas de música';

  @override
  String get sourceOpenInFileManager => 'Abrir en el gestor de archivos';

  @override
  String get sourceShowInFileManager => 'Mostrar en el gestor de archivos';

  @override
  String get sourceStopScanningFolder => 'Dejar de escanear esta carpeta';

  @override
  String sourceSwitchedTo(String name) {
    return 'Cambiado a «$name»';
  }

  @override
  String get sourceFolderAlreadyScanned =>
      'Esta carpeta ya está incluida en el escaneo';

  @override
  String get sourceNoMusicFound => 'No se encontró música';

  @override
  String get sourceNotFound => 'Fuente de música no encontrada';

  @override
  String pluginsLoadedToast(int count) {
    return '$count plugins cargados';
  }

  @override
  String get pluginFind => 'Buscar plugins';

  @override
  String get pluginInstallTitle => 'Instalar plugin';

  @override
  String get pluginTabInstalled => 'Instalados';

  @override
  String get pluginTabOfficial => 'Oficiales';

  @override
  String get pluginOpenDir => 'Abrir carpeta de plugins';

  @override
  String get pluginThirdPartyHint =>
      'Los plugins de terceros son mantenidos por sus respectivos autores';

  @override
  String get pluginDevDocs => 'Documentación de plugins ›';

  @override
  String get pluginComingSoon => 'Próximamente';

  @override
  String get pluginInstallFromLink => 'Instalar desde enlace';

  @override
  String get pluginInstallFromLinkHint =>
      'Repositorio de GitHub, Release o .zip';

  @override
  String pluginUninstallTitle(String name) {
    return '¿Desinstalar «$name»?';
  }

  @override
  String get pluginUninstallMessage =>
      'Se eliminarán los ajustes y la sesión del plugin';

  @override
  String pluginUninstalled(String name) {
    return '«$name» desinstalado';
  }

  @override
  String pluginUpdateAvailable(String version) {
    return 'Actualización a $version';
  }

  @override
  String pluginNeedSetting(String field) {
    return 'Requiere $field';
  }

  @override
  String pluginSignedInAs(String name) {
    return 'Conectado como $name';
  }

  @override
  String pluginDisabledToast(String name) {
    return '«$name» desactivado';
  }

  @override
  String pluginEnabledToast(String name) {
    return '«$name» activado';
  }

  @override
  String get pluginHasUpdate => 'Actualización';

  @override
  String get pluginSignInAccount => 'Iniciar sesión';

  @override
  String get pluginSettingsEllipsis => 'Ajustes del plugin…';

  @override
  String get pluginDisable => 'Desactivar plugin';

  @override
  String get pluginReload => 'Recargar plugins';

  @override
  String get pluginUninstallEllipsis => 'Desinstalar plugin…';

  @override
  String get pluginDeleteEllipsis => 'Eliminar plugin…';

  @override
  String get pluginDisabledBadge => 'Desactivado';

  @override
  String get pluginNotLoadedBadge => 'No cargado';

  @override
  String get pluginNotLoadedStatus => 'El plugin no se cargó';

  @override
  String get pluginEmptyTitle => 'No hay plugins instalados';

  @override
  String get pluginEmptyHint => 'Compatible con enlaces de GitHub';

  @override
  String get pluginSettingsTitle => 'Ajustes del plugin';

  @override
  String get pluginSectionAccount => 'Cuenta';

  @override
  String get pluginSectionCapabilities => 'Capacidades';

  @override
  String get pluginSectionPermissions => 'Permisos';

  @override
  String get pluginDisabledHint =>
      'El plugin está desactivado. Actívalo para aplicarlo';

  @override
  String get pluginUninstallBtn => 'Desinstalar plugin';

  @override
  String get pluginSignInSyncHint =>
      'Inicia sesión para sincronizar favoritos y playlists';

  @override
  String get pluginGetIt => 'Obtener ›';

  @override
  String pluginUpdatedToast(String name) {
    return '«$name» actualizado';
  }

  @override
  String pluginInstalledToast(String name) {
    return '«$name» instalado';
  }

  @override
  String pluginInstallFailed(String error) {
    return 'Error al instalar: $error';
  }

  @override
  String get pluginInstallPrompt =>
      'Pega la URL de un repositorio de GitHub\no un enlace de descarga del plugin';

  @override
  String get pluginInstallPlaceholder => 'github.com/autor/repo';

  @override
  String get pluginInstallSupportHint =>
      'Admite repositorios de GitHub, Releases, plugin.json y enlaces .zip';

  @override
  String get pluginReading => 'Leyendo…';

  @override
  String get pluginNextStep => 'Siguiente';

  @override
  String get pluginInstallFromLocal => 'Instalar desde carpeta local…';

  @override
  String pluginPublishedAgo(String ago) {
    return ', publicado $ago';
  }

  @override
  String get pluginLocalFolder => 'Carpeta local';

  @override
  String get pluginLatestCode => 'Último código';

  @override
  String pluginInstalledVersion(String version) {
    return 'Instalado $version';
  }

  @override
  String get pluginPermissionsNeeded => 'Permisos necesarios';

  @override
  String get pluginPermNoNetwork => 'Sin acceso a la red';

  @override
  String get pluginPermNoNetworkDetail => 'No se conecta a ningún sitio web';

  @override
  String get pluginPermAnyWebsite => 'Cualquier sitio web';

  @override
  String get pluginPermAnyWebsiteDetail =>
      'Puede conectarse a cualquier sitio web';

  @override
  String get pluginPermAnyWebsiteFull => 'Puede acceder a cualquier sitio web';

  @override
  String get pluginPermNetwork => 'Acceso a la red';

  @override
  String get pluginPermSignInDetail =>
      'Abre una página de inicio de sesión y lee las cookies';

  @override
  String get pluginPermProcess => 'Ejecutar programas locales';

  @override
  String get pluginPermProcessBadge => 'Requiere permiso';

  @override
  String pluginPermProcessDetail(String programs) {
    return '$programs. Desactivado por defecto; activable en ajustes del plugin';
  }

  @override
  String get pluginPermStorage => 'Guardar datos';

  @override
  String get pluginPermStorageDetail => 'Guarda ajustes, sesión y caché';

  @override
  String get pluginCapabilitiesProvided => 'Capacidades ofrecidas';

  @override
  String get pluginNavIconHint =>
      'Los elementos con icono se añaden a la barra lateral';

  @override
  String get pluginTrustHint => 'Instala solo plugins de fuentes de confianza';

  @override
  String get pluginInstalling => 'Instalando…';

  @override
  String get pluginYourServer => 'tu servidor configurado';

  @override
  String pluginCanAccessHosts(String hosts) {
    return 'Accede a $hosts';
  }

  @override
  String pluginCanAccessHostsMore(String hosts, int count) {
    return 'Accede a $hosts ($count en total)';
  }

  @override
  String get pluginOnlyYourServer =>
      'Solo accede al servidor configurado en los ajustes';

  @override
  String pluginAndYourServer(String hosts) {
    return '$hosts, y el servidor configurado en los ajustes';
  }

  @override
  String get pluginAnyProgram => 'Cualquier programa local';

  @override
  String get officialJellyfinDesc => 'Conectar a un servidor Jellyfin';

  @override
  String get officialPlexDesc => 'Conectar a Plex Media Server';

  @override
  String get officialSubsonicDesc =>
      'Conectar a Navidrome y otros servidores Subsonic';

  @override
  String get officialEmbyDesc => 'Conectar a un servidor Emby';

  @override
  String get capSuggest => 'Sugerencias';

  @override
  String get capLyrics => 'Letras';

  @override
  String get capPlaylist => 'Playlists';

  @override
  String get capEditPlaylist => 'Editar playlists';

  @override
  String get capFavorites => 'Favoritos';

  @override
  String get capAlbum => 'Álbumes';

  @override
  String get capArtist => 'Artistas';

  @override
  String get capRadio => 'Radio';

  @override
  String get capSimilar => 'Similares';

  @override
  String get capHistory => 'Historial';

  @override
  String get capDislike => 'No me interesa';

  @override
  String get capTrackMenu => 'Menú de canción';

  @override
  String get mcpPortRangeError => 'El puerto debe estar entre 1024 y 65535';

  @override
  String mcpPortUpdated(int port) {
    return 'Puerto actualizado a $port';
  }

  @override
  String mcpCopiedLabel(String label) {
    return '$label copiado';
  }

  @override
  String mcpRunning(String url) {
    return 'En ejecución · $url';
  }

  @override
  String get mcpStopped => 'Detenido';

  @override
  String get mcpEnableLocal => 'Activar servidor MCP local';

  @override
  String get mcpEnableHint =>
      'Solo escucha en 127.0.0.1 para clientes de IA externos';

  @override
  String mcpSessions(int count) {
    return '$count sesiones';
  }

  @override
  String get mcpListenPort => 'Puerto de escucha';

  @override
  String get mcpPortHint => 'Por defecto 18888 (Streamable HTTP)';

  @override
  String get mcpLazyMode => 'Modo carga diferida MCP';

  @override
  String mcpLazyHintOn(int core, int lazy) {
    return 'Expone inicialmente $core herramientas básicas + $lazy extendidas bajo demanda';
  }

  @override
  String mcpLazyHintOff(int total) {
    return 'Expone las $total herramientas soportadas por la fuente actual';
  }

  @override
  String get mcpReadOnly => 'Modo seguro de solo lectura';

  @override
  String get mcpReadOnlyHint =>
      'Bloquea acciones de escritura como editar playlists, comentar o dar me gusta';

  @override
  String get mcpAuthSection => 'Autenticación';

  @override
  String get mcpRequireToken => 'Requerir Bearer Token';

  @override
  String get mcpRequireTokenHint =>
      'Los clientes deben enviar la cabecera Authorization: Bearer <token>';

  @override
  String get mcpHttpConfigTitle => 'Configuración de cliente (Streamable HTTP)';

  @override
  String get mcpHttpConfigDesc =>
      'Para clientes MCP HTTP como Antigravity, Cursor y Claude:';

  @override
  String get mcpCopyHttpConfig => 'Copiar config HTTP';

  @override
  String get mcpHttpConfigLabel => 'Configuración Streamable HTTP';

  @override
  String get mcpStdioConfigTitle =>
      'Configuración puente Stdio (autoactivación)';

  @override
  String get mcpStdioConfigDesc =>
      'Para clientes solo stdio; inicia la app en segundo plano automáticamente si está cerrada:';

  @override
  String get mcpCopyStdioConfig => 'Copiar config Stdio';

  @override
  String get mcpStdioConfigLabel => 'Configuración puente Stdio';

  @override
  String mcpPortStartFailed(int port, String error) {
    return 'Error al iniciar en el puerto $port: $error';
  }

  @override
  String get tabSongs => 'Canciones';

  @override
  String get tabAlbums => 'Álbumes';

  @override
  String get tabPlaylists => 'Playlists';

  @override
  String get tabArtists => 'Artistas';

  @override
  String get tabArtistSearch => 'Artistas';

  @override
  String get sortTitleAZ => 'Título A-Z';

  @override
  String get sortReleaseDate => 'Fecha de lanzamiento';

  @override
  String get sortDefault => 'Predeterminado';

  @override
  String get sortAlbumAZ => 'Álbum A-Z';

  @override
  String get libraryEmptyTitle => 'Tu biblioteca está vacía';

  @override
  String get libraryAddSource => 'Añadir fuente';

  @override
  String get libraryNoAlbums => 'Aún no hay álbumes';

  @override
  String get libraryNoSongs => 'Aún no hay canciones';

  @override
  String get libraryNoPlaylists => 'Aún no hay playlists';

  @override
  String get libraryNoArtists => 'Aún no hay artistas';

  @override
  String get libraryEarlier => 'Anteriores';

  @override
  String get libraryCreatedByMe => 'Creadas por mí';

  @override
  String get libraryCollected => 'Guardadas';

  @override
  String countTracks(int count) {
    return '$count canciones';
  }

  @override
  String countSongs(int count) {
    return '$count canciones';
  }

  @override
  String countAlbums(int count) {
    return '$count álbumes';
  }

  @override
  String countPlays(String count) {
    return '$count reproducciones';
  }

  @override
  String countComments(String count) {
    return '$count comentarios';
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
    return '$tracks canciones · $minutes min';
  }

  @override
  String get albumNotFound => 'Álbum no encontrado';

  @override
  String get albumKindAlbum => 'Álbum';

  @override
  String get albumKindSingle => 'Sencillo';

  @override
  String get albumKindCompilation => 'Recopilatorio';

  @override
  String get albumTracksTitle => 'Canciones';

  @override
  String albumReleasedIn(int year) {
    return 'Publicado en $year';
  }

  @override
  String albumReleasedOn(String date) {
    return 'Publicado el $date';
  }

  @override
  String artistFollowed(String name) {
    return 'Siguiendo a $name';
  }

  @override
  String get artistUnfollowed => 'Dejaste de seguir';

  @override
  String get artistFollowFailed => 'No se pudo seguir, inténtalo más tarde';

  @override
  String get artistUnfollowFailed =>
      'No se pudo dejar de seguir, inténtalo más tarde';

  @override
  String get artistSimilar => 'Artistas similares';

  @override
  String artistHotTracksOf(String name) {
    return 'Populares de $name';
  }

  @override
  String get artistLatestRelease => 'Último lanzamiento';

  @override
  String get artistHotTracks => 'Populares';

  @override
  String get artistSinglesAndEps => 'Sencillos y EP';

  @override
  String get playlistSearchPlaceholder => 'Buscar en la playlist';

  @override
  String get playlistColTitle => 'Título';

  @override
  String get playlistColAlbum => 'Álbum';

  @override
  String get playlistColAdded => 'Fecha añadida';

  @override
  String get playlistEmpty => 'No hay canciones en esta playlist';

  @override
  String playlistNoMatch(String query) {
    return 'Sin resultados para «$query»';
  }

  @override
  String playlistTagCount(String tag, int count) {
    return '«$tag» tiene $count canciones';
  }

  @override
  String get searchPlaceholder =>
      'Buscar canciones, álbumes, artistas y playlists';

  @override
  String get searchUnsupported => 'Este plugin no admite búsqueda.';

  @override
  String get searchRecent => 'Búsquedas recientes';

  @override
  String get searchRecentResults => 'Resultados recientes';

  @override
  String get searchHot => 'Tendencias';

  @override
  String get searchRemoveHistory => 'Eliminar del historial';

  @override
  String searchNoResults(String query) {
    return 'Sin resultados para «$query»';
  }

  @override
  String searchViewAllSongs(int count) {
    return 'Ver las $count canciones';
  }

  @override
  String searchViewAllAlbums(int count) {
    return 'Ver los $count álbumes';
  }

  @override
  String searchAllCount(int count) {
    return 'Todo ($count)';
  }

  @override
  String searchQueueName(String query) {
    return 'Buscar «$query»';
  }

  @override
  String searchMcpQueueName(String query) {
    return 'Buscar: $query';
  }

  @override
  String get commentSortHot => 'Destacados';

  @override
  String get commentSortLatest => 'Recientes';

  @override
  String get commentWrite => 'Escribir comentario';

  @override
  String get commentEmpty => 'Aún no hay comentarios';

  @override
  String get commentLoadFailed => 'Error al cargar comentarios';

  @override
  String get commentLikeFailed => 'Error al dar me gusta';

  @override
  String get commentAnonymous => 'Anónimo';

  @override
  String get commentReply => 'Responder';

  @override
  String get commentPosted => 'Comentario publicado';

  @override
  String get commentReplyPosted => 'Respuesta publicada';

  @override
  String get commentPostFailed => 'Error al publicar';

  @override
  String get commentWriteTo => 'Comentar en';

  @override
  String get commentPosting => 'Publicando…';

  @override
  String get commentPost => 'Publicar';

  @override
  String get commentPlaceholder => 'Escribe un comentario…';

  @override
  String commentReplyPlaceholder(String name) {
    return 'Responder a $name…';
  }

  @override
  String get profileLocalUnsupported =>
      'La música local no tiene página de perfil.';

  @override
  String profileSourceUnsupported(String name) {
    return '«$name» no tiene página de perfil.';
  }

  @override
  String profileSignInHint(String name) {
    return 'Inicia sesión en «$name» para ver tu perfil.';
  }

  @override
  String get profileTopArtists => 'Artistas más escuchados';

  @override
  String get profileMostPlayed => 'Más escuchadas';

  @override
  String get profileMyPlaylists => 'Mis playlists';

  @override
  String signOutConfirmTitle(String name) {
    return '¿Cerrar sesión en «$name»?';
  }

  @override
  String get signOutConfirmMessage =>
      'Tu biblioteca, playlists y recomendaciones de esta fuente se ocultarán\nhasta que vuelvas a iniciar sesión.';

  @override
  String signInDialogTitle(String name) {
    return 'Iniciar sesión en $name';
  }

  @override
  String get signInQrFailed => 'Error al generar el código QR';

  @override
  String get remoteNeedSignIn => 'Inicio de sesión requerido';

  @override
  String remoteErrorKind(String kind) {
    return 'Error ($kind)';
  }

  @override
  String remotePluginMissing(String id) {
    return 'El plugin $id no está cargado. Puedes recargarlo en Ajustes.';
  }

  @override
  String get remoteSwitchToLocalHint =>
      'Puedes volver a Música local en Ajustes';

  @override
  String get remoteNoDiscover =>
      'Este plugin no tiene página Explorar. Prueba la búsqueda.';

  @override
  String get remoteNoHome =>
      'Este plugin no tiene página de inicio. Prueba la búsqueda.';

  @override
  String get remoteNoContent => 'Nada por aquí todavía.';

  @override
  String get remotePlayAlbumFailed =>
      'No se pudo reproducir este álbum, inténtalo más tarde';

  @override
  String get greetingLateNight => 'Buenas noches';

  @override
  String get greetingMorning => 'Buenos días';

  @override
  String get greetingNoon => 'Buenas tardes';

  @override
  String get greetingAfternoon => 'Buenas tardes';

  @override
  String get greetingEvening => 'Buenas noches';

  @override
  String get localRecentlyAdded => 'Añadidos recientemente';

  @override
  String get localEmptyHint =>
      'Aún no hay canciones. Añade una carpeta de música en Ajustes';

  @override
  String get localArtistNotFound => 'Artista no encontrado';

  @override
  String get localFileMovedOrDeleted => 'El archivo se movió o eliminó';

  @override
  String get timeJustNow => 'Ahora mismo';

  @override
  String timeMinutesAgo(int count) {
    return 'hace $count min';
  }

  @override
  String timeHoursAgo(int count) {
    return 'hace $count h';
  }

  @override
  String timeDaysAgo(int count) {
    return 'hace $count d';
  }

  @override
  String timeMonthsAgo(int count) {
    return 'hace $count mes(es)';
  }

  @override
  String timeYearsAgo(int count) {
    return 'hace $count año(s)';
  }

  @override
  String get timeToday => 'Hoy';

  @override
  String get timeYesterday => 'Ayer';

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
    return 'Sesión iniciada: $name';
  }

  @override
  String get toastNotSignedIn => 'Sin iniciar sesión';

  @override
  String get toastSignOutFailed => 'Error al cerrar sesión';

  @override
  String get toastPlayAlbumFailed => 'No se pudo reproducir este álbum';

  @override
  String get toastPlayPlaylistFailed => 'No se pudo reproducir esta playlist';

  @override
  String toastPlaybackError(String error) {
    return 'Error de reproducción: $error';
  }

  @override
  String toastCannotPlayTrack(String title) {
    return 'No se puede reproducir «$title»';
  }

  @override
  String toastStationEmpty(String name) {
    return 'No hay canciones en $name';
  }

  @override
  String toastStationOpenFailed(String name) {
    return 'No se pudo abrir $name';
  }

  @override
  String toastAddedToPlaylist(String name) {
    return 'Añadido a «$name»';
  }

  @override
  String toastAddToPlaylistFailed(String name) {
    return 'No se pudo añadir a «$name»';
  }

  @override
  String toastPlaylistCreated(String name) {
    return 'Playlist «$name» creada';
  }

  @override
  String get toastCreatePlaylistFailed => 'No se pudo crear la playlist';

  @override
  String get toastRemovedFromPlaylist => 'Quitado de la playlist';

  @override
  String get toastRemoveFromPlaylistFailed =>
      'No se pudo quitar de la playlist';

  @override
  String get toastNoSimilarFound => 'No se encontraron canciones similares';

  @override
  String toastSimilarQueueName(String title) {
    return 'Similares a «$title»';
  }

  @override
  String get toastFindSimilarFailed =>
      'No se pudieron buscar canciones similares';

  @override
  String toastActionFailed(String title) {
    return '«$title» falló';
  }

  @override
  String get toastDisliked => 'Recomendaremos menos canciones como esta';

  @override
  String toastDislikeFailed(String name) {
    return 'No se pudo avisar a $name';
  }

  @override
  String get toastLikeFailed => 'No se pudo dar me gusta';

  @override
  String get toastUnlikeFailed => 'No se pudo quitar me gusta';

  @override
  String get toastSaveAlbumFailed => 'No se pudo guardar este álbum';

  @override
  String get toastUnsaveAlbumFailed => 'No se pudo quitar este álbum';

  @override
  String toastAlbumSaved(String title) {
    return '«$title» guardado';
  }

  @override
  String get toastAlbumUnsaved => 'Quitado de la biblioteca';

  @override
  String pluginErrIdTaken(String id) {
    return 'El id $id ya está en uso';
  }

  @override
  String pluginErrMinAppVersion(String required, String current) {
    return 'Requiere YesPlayMusic $required o superior (actual: $current)';
  }

  @override
  String get pluginErrEmptyLink => 'Introduce un enlace';

  @override
  String get pluginErrInvalidLink => 'Enlace no reconocido';

  @override
  String pluginErrDownloadNetwork(String error) {
    return 'Error de descarga, comprueba tu red: $error';
  }

  @override
  String pluginErrRepoNotFound(String slug) {
    return 'Repositorio de GitHub $slug no encontrado';
  }

  @override
  String pluginErrNoManifestInPath(String path) {
    return 'No hay plugin.json en $path';
  }

  @override
  String get pluginErrNoManifestInLink =>
      'No se encontró plugin.json en este enlace';

  @override
  String pluginErrMissingEntry(String file) {
    return 'Falta el archivo de entrada $file';
  }

  @override
  String pluginErrNotFoundUrl(String url) {
    return 'No encontrado: $url';
  }

  @override
  String get pluginErrGithubRateLimit =>
      'GitHub rechazó temporalmente la solicitud (límite alcanzado). Inténtalo más tarde';

  @override
  String pluginErrDownloadHttp(int code) {
    return 'Error de descarga: HTTP $code';
  }

  @override
  String get pluginErrTooLarge => 'Plugin demasiado grande (más de 50 MB)';

  @override
  String get pluginErrInvalidZip =>
      'El archivo descargado no es un .zip válido';

  @override
  String pluginErrManifestJson(String error) {
    return 'plugin.json no es un JSON válido: $error';
  }

  @override
  String get pluginErrManifestObject => 'plugin.json debe ser un objeto JSON';

  @override
  String pluginErrManifestIdChars(String id) {
    return 'id \"$id\" solo puede usar minúsculas, dígitos y . _ -';
  }

  @override
  String get pluginErrManifestIdLocal => 'id \"local\" está reservado';

  @override
  String get pluginErrManifestNoName => 'Falta name';

  @override
  String pluginErrManifestMain(String file) {
    return 'main \"$file\" debe ser un archivo .js dentro de la carpeta del plugin';
  }

  @override
  String pluginErrManifestIcon(String file) {
    return 'icon \"$file\" debe ser un archivo png, jpg o webp dentro de la carpeta del plugin';
  }

  @override
  String pluginErrStopped(String name) {
    return '$name se ha detenido';
  }

  @override
  String pluginErrNoManifestDir(String dir) {
    return '$dir: falta plugin.json';
  }

  @override
  String pluginErrMinVersionSimple(String name, String version) {
    return '$name requiere YesPlayMusic $version o superior';
  }

  @override
  String pluginErrProcessExited(String name) {
    return '$name: el proceso del plugin se cerró inesperadamente';
  }

  @override
  String pluginErrNotObject(String name, String op) {
    return '$name.$op no devolvió un objeto';
  }

  @override
  String pluginErrNotArray(String name, String op) {
    return '$name.$op no devolvió un array';
  }

  @override
  String pluginErrInvalidStreamUrl(String name) {
    return '$name devolvió una URL de reproducción no válida';
  }

  @override
  String pluginErrDuplicateId(String id) {
    return 'id de plugin duplicado: $id';
  }

  @override
  String pluginErrTimeoutDisabled(int seconds) {
    return 'El plugin no respondió en $seconds s y se desactivó';
  }

  @override
  String get pluginErrOomDisabled =>
      'El plugin se quedó sin memoria y se desactivó';

  @override
  String get pluginErrLoadTimeout => 'Tiempo de carga agotado';

  @override
  String pluginErrOpTimeout(String op, int seconds) {
    return 'Tiempo agotado para $op ($seconds s)';
  }

  @override
  String get pluginErrClosed => 'El plugin está cerrado';

  @override
  String sourceErrUnsupported(String name, String op) {
    return '$name no admite $op';
  }

  @override
  String sourceErrNotFound(String source) {
    return 'No se encontró la fuente $source';
  }
}
