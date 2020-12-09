<template>
  <div class="track-list" :style="listStyles">
    <ContextMenu ref="menu">
      <div class="item-info">
        <img :src="rightClickedTrack.al.picUrl | resizeImage(224)" />
        <div class="info">
          <div class="title">{{ rightClickedTrack.name }}</div>
          <div class="subtitle">{{ rightClickedTrack.ar[0].name }}</div>
        </div>
      </div>
      <hr />
      <div class="item" @click="play">{{ $t("contextMenu.play") }}</div>
      <div class="item" @click="playNext">{{ $t("contextMenu.playNext") }}</div>
      <div
        class="item"
        @click="like"
        v-show="!isRightClickedTrackLiked && accountLogin"
      >
        {{ $t("contextMenu.saveToMyLikedSongs") }}
      </div>
      <div
        class="item"
        @click="like"
        v-show="isRightClickedTrackLiked && accountLogin"
      >
        {{ $t("contextMenu.removeFromMyLikedSongs") }}
      </div>
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
import { mapActions, mapMutations, mapState } from "vuex";
import { likeATrack } from "@/api/track";
import {
  playPlaylistByID,
  playAlbumByID,
  playAList,
  appendTrackToPlayerList,
} from "@/utils/play";
import { isAccountLoggedIn } from "@/utils/auth";

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
      default: "default",
    },
    albumObject: {
      type: Object,
      default: () => {
        return {
          artist: {
            name: "",
          },
        };
      },
    },
  },
  data() {
    return {
      rightClickedTrack: {
        id: 0,
        name: "",
        ar: [{ name: "" }],
        al: { picUrl: "" },
      },
      listStyles: {},
    };
  },
  created() {
    if (this.type === "tracklist")
      this.listStyles = { display: "flex", flexWrap: "wrap" };
  },
  computed: {
    ...mapState(["liked"]),
    isRightClickedTrackLiked() {
      return this.liked.songs.includes(this.rightClickedTrack?.id);
    },
    accountLogin() {
      return isAccountLoggedIn();
    },
  },
  methods: {
    ...mapMutations(["updateLikedSongs"]),
    ...mapActions(["nextTrack", "playTrackOnListByID", "showToast"]),
    openMenu(e, track) {
      if (!track.playable) {
        return;
      }
      this.rightClickedTrack = track;
      this.$refs.menu.openMenu(e);
    },
    closeMenu() {
      this.rightClickedTrack = {
        id: 0,
        name: "",
        ar: [{ name: "" }],
        al: { picUrl: "" },
      };
    },
    playThisList(trackID) {
      if (this.dbclickTrackFunc === "default") {
        this.playThisListDefault(trackID);
      } else if (this.dbclickTrackFunc === "none") {
        // do nothing
      } else if (this.dbclickTrackFunc === "playTrackOnListByID") {
        this.playTrackOnListByID(trackID);
      } else if (this.dbclickTrackFunc === "playPlaylistByID") {
        playPlaylistByID(this.id, trackID);
      }
    },
    playThisListDefault(trackID) {
      if (this.type === "playlist") {
        playPlaylistByID(this.id, trackID);
      } else if (this.type === "album") {
        playAlbumByID(this.id, trackID);
      } else if (this.type === "tracklist") {
        let trackIDs = this.tracks.map((t) => t.id);
        playAList(trackIDs, this.tracks[0].ar[0].id, "artist", trackID);
      }
    },
    play() {
      appendTrackToPlayerList(this.clickTrack.id, true);
    },
    playNext() {
      appendTrackToPlayerList(this.clickTrack.id);
    },
    like() {
      this.likeASong(this.rightClickedTrack.id);
    },
    likeASong(id) {
      let like = true;
      let likedSongs = this.liked.songs;
      if (likedSongs.includes(id)) like = false;
      likeATrack({ id, like }).then((data) => {
        if (data.code !== 200) return;
        if (like === false) {
          this.showToast(this.$t("toast.removedFromMyLikedSongs"));
          this.updateLikedSongs(likedSongs.filter((d) => d !== id));
        } else {
          this.showToast(this.$t("toast.savedToMyLikedSongs"));
          likedSongs.push(id);
          this.updateLikedSongs(likedSongs);
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
