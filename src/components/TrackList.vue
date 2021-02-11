<template>
  <div class="track-list" :class="{ 'without-padding': withoutPadding }">
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
      <hr />
      <div class="item" @click="like" v-show="!isRightClickedTrackLiked">
        {{ $t("contextMenu.saveToMyLikedSongs") }}
      </div>
      <div class="item" @click="like" v-show="isRightClickedTrackLiked">
        {{ $t("contextMenu.removeFromMyLikedSongs") }}
      </div>
      <div
        v-if="extraContextMenuItem.includes('removeTrackFromPlaylist')"
        class="item"
        @click="removeTrackFromPlaylist"
        >从歌单中删除</div
      >
      <div class="item" @click="addTrackToPlaylist">添加到歌单</div>
    </ContextMenu>
    <div :style="listStyles" class="track-list-inner-container">
      <TrackListItem
        v-for="(track, index) in tracks"
        :track="track"
        :key="itemKey === 'id' ? track.id : `${track.id}${index}`"
        :highlightPlayingTrack="highlightPlayingTrack"
        @dblclick.native="playThisList(track.id)"
        @click.right.native="openMenu($event, track)"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { likeATrack } from "@/api/track";
import { addOrRemoveTrackFromPlaylist } from "@/api/playlist";
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
    extraContextMenuItem: {
      type: Array,
      default: () => {
        return []; // 'removeTrackFromPlaylist'
      },
    },
    highlightPlayingTrack: {
      type: Boolean,
      default: true,
    },
    itemKey: {
      type: String,
      default: "id",
    },
    withoutPadding: {
      type: Boolean,
      default: false,
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
    if (this.type === "tracklist") {
      this.listStyles = {
        display: "grid",
        gap: "4px",
      };
    }
  },
  computed: {
    ...mapState(["liked"]),
    isRightClickedTrackLiked() {
      return this.liked.songs.includes(this.rightClickedTrack?.id);
    },
  },
  methods: {
    ...mapMutations(["updateLikedSongs", "updateModal"]),
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
        this.$store.state.player.playPlaylistByID(this.id, trackID);
      } else if (this.dbclickTrackFunc === "playAList") {
        let trackIDs = this.tracks.map((t) => t.id);
        this.$store.state.player.replacePlaylist(
          trackIDs,
          this.id,
          "artist",
          trackID
        );
      }
    },
    playThisListDefault(trackID) {
      if (this.type === "playlist") {
        this.$store.state.player.playPlaylistByID(this.id, trackID);
      } else if (this.type === "album") {
        this.$store.state.player.playAlbumByID(this.id, trackID);
      } else if (this.type === "tracklist") {
        let trackIDs = this.tracks.map((t) => t.id);
        this.$store.state.player.replacePlaylist(
          trackIDs,
          this.id,
          "artist",
          trackID
        );
      }
    },
    play() {
      this.$store.state.player.addTrackToPlayNext(
        this.rightClickedTrack.id,
        true
      );
    },
    playNext() {
      this.$store.state.player.addTrackToPlayNext(this.rightClickedTrack.id);
    },
    like() {
      this.likeASong(this.rightClickedTrack.id);
    },
    likeASong(id) {
      if (!isAccountLoggedIn()) {
        this.showToast("此操作需要登录网易云账号");
        return;
      }
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
    addTrackToPlaylist() {
      if (!isAccountLoggedIn()) {
        this.showToast("此操作需要登录网易云账号");
        return;
      }
      this.updateModal({
        modalName: "addTrackToPlaylistModal",
        key: "show",
        value: true,
      });
      this.updateModal({
        modalName: "addTrackToPlaylistModal",
        key: "selectedTrackID",
        value: this.rightClickedTrack.id,
      });
    },
    removeTrackFromPlaylist() {
      if (!isAccountLoggedIn()) {
        this.showToast("此操作需要登录网易云账号");
        return;
      }
      if (confirm(`确定要从歌单删除 ${this.rightClickedTrack.name}？`)) {
        let trackID = this.rightClickedTrack.id;
        addOrRemoveTrackFromPlaylist({
          op: "del",
          pid: this.id,
          tracks: trackID,
        }).then((data) => {
          this.showToast(
            data.body.code === 200 ? "已从歌单中删除" : data.body.message
          );
          this.$parent.removeTrack(trackID);
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.track-list {
  --col-num: 4;
  padding: var(--main-content-padding);

  .track-list-inner-container {
    grid-template-columns: repeat(var(--col-num), 1fr);
  }
}

.track-list.without-padding {
  padding: 0;
}

@media (max-width: 800px) {
  .track-list {
    --col-num: 3;
    padding: var(--main-content-padding);
  }
}

@media (max-width: 700px) {
  .track-list {
    --col-num: 2;
  }
}

@media (max-width: 550px) {
  .track-list {
    --col-num: 1;
  }
}
</style>
