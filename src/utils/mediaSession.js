import store from "@/store";

export function initMediaSession() {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", function() {
      store.state.howler.play();
    });
    navigator.mediaSession.setActionHandler("pause", function() {
      store.state.howler.pause();
    });
    navigator.mediaSession.setActionHandler("previoustrack", function() {
      store.dispatch("previousTrack");
    });
    navigator.mediaSession.setActionHandler("nexttrack", function() {
      store.dispatch("nextTrack");
    });
    navigator.mediaSession.setActionHandler("stop", () => {
      store.state.howler.stop();
    });
  }
}

export function updateMediaSessionMetaData(track) {
  if ("mediaSession" in navigator) {
    let artists = track.artists.map((a) => a.name);
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: track.name,
      artist: artists.join(","),
      album: track.album.name,
      artwork: [
        {
          src: track.album.picUrl + "?param=512y512",
          type: "image/jpg",
          sizes: "512x512",
        },
      ],
    });
  }
}
