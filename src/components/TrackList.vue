<template>
  <div class="track-list">
    <ContextMenu ref="menu">
      <div class="item-info">
        <img :src="rightClickedTrack.al.picUrl | resizeImage(224)" />
        <div class="info">
          <div class="title">{{ rightClickedTrack.name }}</div>
          <div class="subtitle">{{ rightClickedTrack.ar[0].name }}</div>
        </div>
      </div>
      <hr />
      <div class="item" @click="play">{{ $t('contextMenu.play') }}</div>
      <div class="item" @click="playNext">{{ $t('contextMenu.playNext') }}</div>
      <hr />
      <div v-show="!isRightClickedTrackLiked" class="item" @click="like">
        {{ $t('contextMenu.saveToMyLikedSongs') }}
      </div>
      <div v-show="isRightClickedTrackLiked" class="item" @click="like">
        {{ $t('contextMenu.removeFromMyLikedSongs') }}
      </div>
      <div
        v-if="extraContextMenuItem.includes('removeTrackFromPlaylist')"
        class="item"
        @click="removeTrackFromPlaylist"
        >从歌单中删除</div
      >
      <div class="item" @click="addTrackToPlaylist">添加到歌单</div>
    </ContextMenu>
    <div :style="listStyles">
      <TrackListItem
        v-for="(track, index) in tracks"
        :key="itemKey === 'id' ? track.id : `${track.id}${index}`"
        :track="track"
        :highlight-playing-track="highlightPlayingTrack"
        @dblclick.native="playThisList(track.id)"
        @click.right.native="openMenu($event, track)"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import { addOrRemoveTrackFromPlaylist } from '@/api/playlist';
import { isAccountLoggedIn } from '@/utils/auth';

import TrackListItem from '@/components/TrackListItem.vue';
import ContextMenu from '@/components/ContextMenu.vue';

export default {
  name: 'TrackList',
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
      default: 'default',
    },
    albumObject: {
      type: Object,
      default: () => {
        return {
          artist: {
            name: '',
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
    columnNumber: {
      type: Number,
      default: 4,
    },
    highlightPlayingTrack: {
      type: Boolean,
      default: true,
    },
    itemKey: {
      type: String,
      default: 'id',
    },
  },
  data() {
    return {
      rightClickedTrack: {
        id: 0,
        name: '',
        ar: [{ name: '' }],
        al: { picUrl: '' },
      },
      listStyles: {},
    };
  },
  computed: {
    ...mapState(['liked']),
    isRightClickedTrackLiked() {
      return this.liked.songs.includes(this.rightClickedTrack?.id);
    },
  },
  created() {
    if (this.type === 'tracklist') {
      this.listStyles = {
        display: 'grid',
        gap: '4px',
        gridTemplateColumns: `repeat(${this.columnNumber}, 1fr)`,
      };
    }
  },
  methods: {
    ...mapMutations(['updateModal']),
    ...mapActions(['nextTrack', 'showToast', 'likeATrack']),
    openMenu(e, track) {
      this.rightClickedTrack = track;
      this.$refs.menu.openMenu(e);
    },
    closeMenu() {
      this.rightClickedTrack = {
        id: 0,
        name: '',
        ar: [{ name: '' }],
        al: { picUrl: '' },
      };
    },
    playThisList(trackID) {
      if (this.dbclickTrackFunc === 'default') {
        this.playThisListDefault(trackID);
      } else if (this.dbclickTrackFunc === 'none') {
        // do nothing
      } else if (this.dbclickTrackFunc === 'playTrackOnListByID') {
        this.$store.state.player.playTrackOnListByID(trackID);
      } else if (this.dbclickTrackFunc === 'playPlaylistByID') {
        this.$store.state.player.playPlaylistByID(this.id, trackID);
      } else if (this.dbclickTrackFunc === 'playAList') {
        let trackIDs = this.tracks.map(t => t.id);
        this.$store.state.player.replacePlaylist(
          trackIDs,
          this.id,
          'artist',
          trackID
        );
      } else if (this.dbclickTrackFunc === 'dailyTracks') {
        let trackIDs = this.tracks.map(t => t.id);
        this.$store.state.player.replacePlaylist(
          trackIDs,
          '/daily/songs',
          'url',
          trackID
        );
      }
    },
    playThisListDefault(trackID) {
      if (this.type === 'playlist') {
        this.$store.state.player.playPlaylistByID(this.id, trackID);
      } else if (this.type === 'album') {
        this.$store.state.player.playAlbumByID(this.id, trackID);
      } else if (this.type === 'tracklist') {
        let trackIDs = this.tracks.map(t => t.id);
        this.$store.state.player.replacePlaylist(
          trackIDs,
          this.id,
          'artist',
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
      this.likeATrack(this.rightClickedTrack.id);
    },
    addTrackToPlaylist() {
      if (!isAccountLoggedIn()) {
        this.showToast('此操作需要登录网易云账号');
        return;
      }
      this.updateModal({
        modalName: 'addTrackToPlaylistModal',
        key: 'show',
        value: true,
      });
      this.updateModal({
        modalName: 'addTrackToPlaylistModal',
        key: 'selectedTrackID',
        value: this.rightClickedTrack.id,
      });
    },
    removeTrackFromPlaylist() {
      if (!isAccountLoggedIn()) {
        this.showToast('此操作需要登录网易云账号');
        return;
      }
      if (confirm(`确定要从歌单删除 ${this.rightClickedTrack.name}？`)) {
        let trackID = this.rightClickedTrack.id;
        addOrRemoveTrackFromPlaylist({
          op: 'del',
          pid: this.id,
          tracks: trackID,
        }).then(data => {
          this.showToast(
            data.body.code === 200 ? '已从歌单中删除' : data.body.message
          );
          this.$parent.removeTrack(trackID);
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
