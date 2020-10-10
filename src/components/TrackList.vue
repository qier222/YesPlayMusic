<template>
  <div class="track-list" :style="listStyles">
    <ContextMenu ref="menu">
      <div class="item" @click="play">Play</div>
      <div class="item" @click="playNext">Play Next</div>
    </ContextMenu>
    <TrackListItem
      v-for="track in tracks"
      :track="track"
      :key="track.id"
      @dblclick.native="playThisList(track.id)"
      @click.right.native="openMenu($event, track)"
    />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import {
  playPlaylistByID,
  playAlbumByID,
  playAList,
  appendTrackToPlayerList,
} from "@/utils/play";

import TrackListItem from "@/components/TrackListItem.vue";
import ContextMenu from "@/components/ContextMenu.vue";

export default {
  name: "TrackList",
  components: {
    TrackListItem,
    ContextMenu,
  },
  props: {
    tracks: Array,
    type: String,
    id: Number,
    itemWidth: {
      type: Number,
      default: -1,
    },
    dbclickTrackFunc: {
      type: String,
      default: "none",
    },
  },
  data() {
    return {
      clickTrack: null,
      listStyles: {},
    };
  },
  created() {
    if (this.type === "tracklist")
      this.listStyles = { display: "flex", flexWrap: "wrap" };
  },
  methods: {
    ...mapActions(["nextTrack"]),
    openMenu(e, track) {
      if (!track.playable) {
        return;
      }
      this.clickTrack = track;
      this.$refs.menu.openMenu(e);
    },
    playThisList(trackID) {
      if (this.type === "playlist") {
        playPlaylistByID(this.id, trackID);
      } else if (this.type === "album") {
        playAlbumByID(this.id, trackID);
      } else if (this.type === "tracklist") {
        if (this.dbclickTrackFunc === "none") {
          playAList(this.tracks, this.tracks[0].ar[0].id, "artist", trackID);
        } else {
          if (this.dbclickTrackFunc === "playPlaylistByID")
            playPlaylistByID(this.id, trackID);
        }
      }
    },
    play() {
      appendTrackToPlayerList(this.clickTrack, true);
    },
    playNext() {
      appendTrackToPlayerList(this.clickTrack);
    },
  },
};
</script>

<style lang="scss" scoped></style>
