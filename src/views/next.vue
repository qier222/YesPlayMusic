<template>
  <div class="next-tracks" :class="{ open: open }">
    <h1>{{ $t("next.nowPlaying") }}</h1>
    <TrackList
      :tracks="[currentTrack]"
      type="playlist"
      dbclickTrackFunc="none"
      :withoutPadding="true"
    />
    <h1 v-show="playNextList.length > 0">插队播放</h1>
    <TrackList
      :tracks="playNextTracks"
      type="playlist"
      :highlightPlayingTrack="false"
      dbclickTrackFunc="playTrackOnListByID"
      itemKey="id+index"
      v-show="playNextList.length > 0"
      :withoutPadding="true"
    />
    <h1>{{ $t("next.nextUp") }}</h1>
    <TrackList
      :tracks="filteredTracks"
      type="playlist"
      :highlightPlayingTrack="false"
      dbclickTrackFunc="playTrackOnListByID"
      :withoutPadding="true"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { getTrackDetail } from "@/api/track";
import TrackList from "@/components/TrackList.vue";

export default {
  name: "Next",
  components: {
    TrackList,
  },
  props: {
    open: { type: Boolean, default: false },
  },
  data() {
    return {
      tracks: [],
    };
  },
  computed: {
    ...mapState(["player"]),
    currentTrack() {
      return this.player.currentTrack;
    },
    playerShuffle() {
      return this.player.shuffle;
    },
    filteredTracks() {
      let trackIDs = this.player.list.slice(
        this.player.current + 1,
        this.player.current + 100
      );
      return this.tracks.filter((t) => trackIDs.includes(t.id));
    },
    playNextList() {
      return this.player.playNextList;
    },
    playNextTracks() {
      return this.playNextList.map((tid) => {
        return this.tracks.find((t) => t.id === tid);
      });
    },
  },
  watch: {
    currentTrack() {
      this.loadTracks();
    },
    playerShuffle() {
      this.loadTracks();
    },
    playNextList() {
      this.loadTracks();
    },
  },
  methods: {
    ...mapActions(["playTrackOnListByID"]),
    loadTracks() {
      // 获取播放列表当前歌曲后100首歌
      let trackIDs = this.player.list.slice(
        this.player.current + 1,
        this.player.current + 100
      );

      // 将playNextList的歌曲加进trackIDs
      trackIDs.push(...this.playNextList);

      // 获取已经加载了的歌曲
      let loadedTrackIDs = this.tracks.map((t) => t.id);

      if (trackIDs.length > 0) {
        getTrackDetail(trackIDs.join(",")).then((data) => {
          let newTracks = data.songs.filter(
            (t) => !loadedTrackIDs.includes(t.id)
          );
          this.tracks.push(...newTracks);
        });
      }
    },
  },
  activated() {
    this.loadTracks();
  },
};
</script>

<style lang="scss" scoped>
.next-tracks {
  $width: 400px;
  $paddingX: 20px;
  position: fixed;
  right: -$width;
  top: 65px;
  [data-electron-platform-win32="yes"] {
    & {
      top: calc(65px + 20px);
    }
  }
  bottom: 64px;
  width: $width - 2 * $paddingX;
  max-width: calc(100vw - #{2 * $paddingX});
  background-color: var(--color-navbar-bg);
  backdrop-filter: saturate(180%) blur(20px);
  padding: 0 $paddingX;
  overflow-y: auto;
  border-left: 1px solid var(--color-secondary-bg-for-transparent);
  transition-property: right;
  transition-duration: 0.4s;
  transition-timing-function: cubic-bezier(0.2, 0, 0, 1);

  &.open {
    right: 0;
  }

  h1 {
    margin-top: 18px;
    margin-bottom: 18px;
    cursor: default;
    font-size: 24px;
    color: var(--color-text);
  }

  ::v-deep .actions {
    width: auto;
  }

  ::v-deep .album {
    display: none;
  }
}
</style>
