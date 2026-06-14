export const DEFAULT_DESKTOP_LYRICS_SETTINGS = {
  enabled: false,
  visible: false,
  alwaysOnTop: true,
  locked: false,
  fontSize: 34,
  opacity: 0.92,
  currentColor: '#ffffff',
  nextColor: '#d6e0ff',
  x: null,
  y: null,
  width: 760,
  height: 150,
};

export function normalizeDesktopLyricsSettings(settings = {}) {
  return {
    ...DEFAULT_DESKTOP_LYRICS_SETTINGS,
    ...settings,
  };
}

export function updateDesktopLyricsSettings(settings, patch) {
  return normalizeDesktopLyricsSettings({
    ...settings,
    ...patch,
  });
}
