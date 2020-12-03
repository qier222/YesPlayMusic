import store from "@/store";
import { getAlbum } from "@/api/album";
import { getPlaylistDetail } from "@/api/playlist";
import { getArtist } from "@/api/artist";

export function playAList(list, id, type, trackID = "first") {
  let filteredList = list.map((id, index) => {
    return { sort: index, id };
  });
  store.commit("updatePlayerList", filteredList);
  if (store.state.player.shuffle) store.commit("shuffleTheListBeforePlay");

  if (trackID === "first") store.dispatch("playFirstTrackOnList");
  else store.dispatch("playTrackOnListByID", trackID);

  store.commit("updateListInfo", { type, id });
}

export function playAlbumByID(id, trackID = "first") {
  getAlbum(id).then((data) => {
    let trackIDs = data.songs.map((t) => t.id);
    playAList(trackIDs, id, "album", trackID);
  });
}

export function playPlaylistByID(id, trackID = "first", noCache = false) {
  getPlaylistDetail(id, noCache).then((data) => {
    let trackIDs = data.playlist.trackIds.map((t) => t.id);
    playAList(trackIDs, id, "playlist", trackID);
  });
}

export function playArtistByID(id, trackID = "first") {
  getArtist(id).then((data) => {
    let trackIDs = data.hotSongs.map((t) => t.id);
    playAList(trackIDs, id, "artist", trackID);
  });
}

export function appendTrackToPlayerList(trackID, playNext = false) {
  let filteredTrack = {
    sort: 0,
    id: trackID,
  };

  store.commit("appendTrackToPlayerList", {
    track: filteredTrack,
    playNext,
  });
  if (playNext) {
    store.dispatch("nextTrack", true);
  }
}
