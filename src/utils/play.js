import store from "@/store";
import { getAlbum } from "@/api/album";
import { getPlaylistDetail } from "@/api/playlist";
import { getTrackDetail } from "@/api/track";
import { getArtist } from "@/api/artist";
import { trackFee } from "@/utils/common";

export function playAList(list, id, type, trackID = "first") {
  let filteredList = list.map((track, index) => {
    return {
      sort: index,
      name: track.name,
      id: track.id,
      artists: track.ar,
      album: track.al,
      time: track.dt,
      playable: trackFee(track).playable,
    };
  });

  store.commit("updatePlayerList", filteredList);

  if (trackID === "first") store.dispatch("playFirstTrackOnList");
  else store.dispatch("playTrackOnListByID", trackID);

  store.commit("updateListInfo", { type, id });
}

export function playAlbumByID(id, trackID = "first") {
  getAlbum(id).then((data) => {
    playAList(data.songs, id, "album", trackID);
  });
}

export function playPlaylistByID(id, trackID = "first") {
  getPlaylistDetail(id).then((data) => {
    let trackIDs = data.playlist.trackIds.map((t) => t.id);
    getTrackDetail(trackIDs.join(",")).then((data) => {
      playAList(data.songs, id, "playlist", trackID);
    });
  });
}

export function playArtistByID(id, trackID = "first") {
  getArtist(id).then((data) => {
    playAList(data.hotSongs, id, "artist", trackID);
  });
}

export function appendTrackToPlayerList(track, playNext = false) {
  let filteredTrack = {
    sort: 0,
    name: track.name,
    id: track.id,
    artists: track.ar,
    album: track.al,
    time: track.dt,
    playable: track.playable,
  };

  store.commit("appendTrackToPlayerList", {
    track: filteredTrack,
    playNext,
  });
  if (playNext) {
    store.dispatch("nextTrack", true);
  }
}
