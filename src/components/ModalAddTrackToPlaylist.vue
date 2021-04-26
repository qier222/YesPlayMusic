<template>
  <Modal
    class="add-track-to-playlist-modal"
    :show="show"
    :close="close"
    :show-footer="false"
    title="添加到歌单"
    width="25vw"
  >
    <template slot="default">
      <div class="new-playlist-button" @click="newPlaylist"
        ><svg-icon icon-class="plus" />新建歌单</div
      >
      <div
        v-for="playlist in ownPlaylists"
        :key="playlist.id"
        class="playlist"
        @click="addTrackToPlaylist(playlist.id)"
      >
        <img :src="playlist.coverImgUrl | resizeImage(224)" />
        <div class="info">
          <div class="title">{{ playlist.name }}</div>
          <div class="track-count">{{ playlist.trackCount }} 首</div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import Modal from '@/components/Modal.vue';
import { userPlaylist } from '@/api/user';
import { addOrRemoveTrackFromPlaylist } from '@/api/playlist';

export default {
  name: 'ModalAddTrackToPlaylist',
  components: {
    Modal,
  },
  data() {
    return {
      playlists: [],
    };
  },
  computed: {
    ...mapState(['modals', 'data']),
    show: {
      get() {
        return this.modals.addTrackToPlaylistModal.show;
      },
      set(value) {
        this.updateModal({
          modalName: 'addTrackToPlaylistModal',
          key: 'show',
          value,
        });
      },
    },
    ownPlaylists() {
      return this.playlists.filter(
        p =>
          p.creator.userId === this.data.user.userId &&
          p.id !== this.data.likedSongPlaylistID
      );
    },
  },
  created() {
    this.getUserPlaylists();
  },
  methods: {
    ...mapMutations(['updateModal']),
    ...mapActions(['showToast']),
    close() {
      this.show = false;
    },
    getUserPlaylists() {
      userPlaylist({
        timestamp: new Date().getTime(),
        limit: 1000,
        uid: this.data.user.userId,
      }).then(data => {
        this.playlists = data.playlist;
      });
    },
    addTrackToPlaylist(playlistID) {
      addOrRemoveTrackFromPlaylist({
        op: 'add',
        pid: playlistID,
        tracks: this.modals.addTrackToPlaylistModal.selectedTrackID,
      }).then(data => {
        if (data.body.code === 200) {
          this.show = false;
          this.showToast('已添加到歌单');
        } else {
          this.showToast(data.body.message);
        }
      });
    },
    newPlaylist() {
      this.updateModal({
        modalName: 'newPlaylistModal',
        key: 'afterCreateAddTrackID',
        value: this.modals.addTrackToPlaylistModal.selectedTrackID,
      });
      this.close();
      this.updateModal({
        modalName: 'newPlaylistModal',
        key: 'show',
        value: true,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.new-playlist-button {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
  background: var(--color-secondary-bg-for-transparent);
  border-radius: 8px;
  height: 48px;
  margin-bottom: 16px;
  margin-right: 6px;
  margin-left: 6px;
  cursor: pointer;
  transition: 0.2s;
  .svg-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }
  &:hover {
    color: var(--color-primary);
    background: var(--color-primary-bg-for-transparent);
  }
}
.playlist {
  display: flex;
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: var(--color-secondary-bg-for-transparent);
  }
  img {
    border-radius: 8px;
    height: 42px;
    width: 42px;
    margin-right: 12px;
    border: 1px solid rgba(0, 0, 0, 0.04);
  }
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .title {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
    padding-right: 16px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    word-break: break-all;
  }
  .track-count {
    margin-top: 2px;
    font-size: 13px;
    opacity: 0.68;
    color: var(--color-text);
  }
}
</style>
