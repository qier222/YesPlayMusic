<template>
  <div>
    <h1>
      <img class="head" :src="settings.user.avatarUrl | resizeImage" />{{
        settings.user.nickname
      }}'s Liked Songs
    </h1>

    <TrackList :tracks="tracks" :type="'playlist'" :id="playlist.id" />
  </div>
</template>

<script>
import { mapMutations, mapActions, mapState } from "vuex";
import NProgress from "nprogress";
import { getPlaylistDetail } from "@/api/playlist";
import { playPlaylistByID } from "@/utils/play";
import { getTrackDetail } from "@/api/track";
import { mapTrackPlayableStatus } from "@/utils/common";

import TrackList from "@/components/TrackList.vue";

export default {
  name: "Playlist",
  components: {
    TrackList,
  },
  data() {
    return {
      playlist: {
        trackIds: [],
      },
      tracks: [],
      loadingMore: false,
      lastLoadedTrackIndex: 9,
    };
  },
  created() {
    this.id = this.settings.user.likedSongPlaylistID;
    getPlaylistDetail(this.id)
      .then((data) => {
        this.playlist = data.playlist;
        this.tracks = data.playlist.tracks;
        this.tracks = mapTrackPlayableStatus(this.tracks);
        NProgress.done();
        if (this.playlist.trackCount > this.tracks.length) {
          window.addEventListener("scroll", this.handleScroll, true);
        }
        return data;
      })
      .then(() => {
        if (this.playlist.trackCount > this.tracks.length) {
          this.loadingMore = true;
          this.loadMore();
        }
      });
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll, true);
  },
  computed: {
    ...mapState(["player", "settings"]),
  },
  methods: {
    ...mapMutations([
      "updatePlayerList",
      "appendTrackToPlayerList",
      "shuffleTheList",
    ]),
    ...mapActions(["playFirstTrackOnList", "playTrackOnListByID"]),
    playPlaylistByID(trackID = "first") {
      playPlaylistByID(this.playlist.id, trackID);
    },
    shufflePlay() {
      this.playPlaylistByID();
      this.shuffleTheList();
    },
    loadMore() {
      let trackIDs = this.playlist.trackIds.filter((t, index) => {
        if (
          index > this.lastLoadedTrackIndex &&
          index <= this.lastLoadedTrackIndex + 50
        )
          return t;
      });
      trackIDs = trackIDs.map((t) => t.id);
      getTrackDetail(trackIDs.join(",")).then((data) => {
        this.tracks.push(...data.songs);
        this.tracks = mapTrackPlayableStatus(this.tracks);
        this.lastLoadedTrackIndex += trackIDs.length;
        this.loadingMore = false;
      });
    },
    handleScroll(e) {
      let dom = document.querySelector("html");
      let scrollHeight = Math.max(dom.scrollHeight, dom.scrollHeight);
      let scrollTop = e.target.scrollingElement.scrollTop;
      let clientHeight =
        dom.innerHeight || Math.min(dom.clientHeight, dom.clientHeight);
      if (clientHeight + scrollTop + 200 >= scrollHeight) {
        if (
          this.lastLoadedTrackIndex + 1 === this.playlist.trackIds.length ||
          this.loadingMore
        )
          return;
        this.loadingMore = true;
        this.loadMore();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-size: 42px;
  .head {
    height: 44px;
    margin-right: 12px;
    vertical-align: -7px;
    border-radius: 50%;
    border: rgba(0, 0, 0, 0.2);
  }
}

.playlist-info {
  display: flex;
  width: 78vw;
  margin-bottom: 72px;
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    margin-left: 56px;
    .title {
      font-size: 36px;
      font-weight: 700;
    }
    .artist {
      font-size: 18px;
      color: rgba(0, 0, 0, 0.88);
      margin-top: 24px;
    }
    .date-and-count {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.68);
      margin-top: 2px;
    }
    .description {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.68);
      margin-top: 24px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      cursor: pointer;
      &:hover {
        transition: color 0.3s;
        color: rgba(0, 0, 0, 0.88);
      }
    }
    .buttons {
      margin-top: 32px;
      display: flex;
      button {
        display: flex;
        align-items: center;
        font-size: 18px;
        font-weight: 600;
        background-color: rgba(51, 94, 234, 0.1);
        color: #335eea;
        padding: 8px 16px;
        border-radius: 8px;
        margin-right: 12px;
        .svg-icon {
          width: 16px;
          height: 16px;
          margin-right: 8px;
        }
      }
      .shuffle {
        padding: 8px 11px;
        .svg-icon {
          margin: 0;
        }
      }
    }
  }
}

.shade {
  background: rgba(255, 255, 255, 0.38);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .description-full {
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 12px 16px -8px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(12px);
    padding: 32px;
    border-radius: 12px;
    width: 50vw;
    margin: auto 0;
    font-size: 14px;
    z-index: 100;
    display: flex;
    flex-direction: column;

    .close {
      display: flex;
      justify-content: flex-end;
      font-size: 16px;
      margin-top: 20px;
      color: #335eea;
      cursor: pointer;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
