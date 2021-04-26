<template>
  <div v-show="show">
    <h1>
      <img class="avatar" :src="data.user.avatarUrl | resizeImage" />{{
        data.user.nickname
      }}{{ $t('library.sLibrary') }}
    </h1>
    <div class="section-one">
      <div class="liked-songs" @click="goToLikedSongsList">
        <div class="top">
          <p>
            <span
              v-for="(line, index) in pickedLyric"
              v-show="line !== ''"
              :key="`${line}${index}`"
              >{{ line }}<br
            /></span>
          </p>
        </div>
        <div class="bottom">
          <div class="titles">
            <div class="title">{{ $t('library.likedSongs') }}</div>
            <div class="sub-title">
              {{ liked.songs.length }} {{ $t('common.songs') }}
            </div>
          </div>
          <button @click.stop="playLikedSongs">
            <svg-icon icon-class="play" />
          </button>
        </div>
      </div>
      <div class="songs">
        <TrackList
          :id="liked.playlists.length > 0 ? liked.playlists[0].id : 0"
          :tracks="liked.songsWithDetails"
          :column-number="3"
          type="tracklist"
          dbclick-track-func="playPlaylistByID"
        />
      </div>
    </div>

    <div class="section-two">
      <div class="tabs-row">
        <div class="tabs">
          <div
            class="tab dropdown"
            :class="{ active: currentTab === 'playlists' }"
            @click="updateCurrentTab('playlists')"
          >
            <span class="text">{{
              { all: '全部歌单', mine: '创建的歌单', liked: '收藏的歌单' }[
                playlistFilter
              ]
            }}</span>
            <span class="icon" @click.stop="openPlaylistTabMenu"
              ><svg-icon icon-class="dropdown"
            /></span>
          </div>
          <div
            class="tab"
            :class="{ active: currentTab === 'albums' }"
            @click="updateCurrentTab('albums')"
          >
            {{ $t('library.albums') }}
          </div>
          <div
            class="tab"
            :class="{ active: currentTab === 'artists' }"
            @click="updateCurrentTab('artists')"
          >
            {{ $t('library.artists') }}
          </div>
          <div
            class="tab"
            :class="{ active: currentTab === 'mvs' }"
            @click="updateCurrentTab('mvs')"
          >
            {{ $t('library.mvs') }}
          </div>
        </div>
        <button
          v-show="currentTab === 'playlists'"
          class="add-playlist"
          icon="plus"
          @click="openAddPlaylistModal"
          ><svg-icon icon-class="plus" />{{ $t('library.newPlayList') }}</button
        >
      </div>

      <div v-show="currentTab === 'playlists'">
        <div v-if="liked.playlists.length > 1">
          <CoverRow
            :items="filterPlaylists.slice(1)"
            type="playlist"
            sub-text="creator"
            :show-play-button="true"
          />
        </div>
      </div>

      <div v-show="currentTab === 'albums'">
        <CoverRow
          :items="liked.albums"
          type="album"
          sub-text="artist"
          :show-play-button="true"
        />
      </div>

      <div v-show="currentTab === 'artists'">
        <CoverRow
          :items="liked.artists"
          type="artist"
          :show-play-button="true"
        />
      </div>

      <div v-show="currentTab === 'mvs'">
        <MvRow :mvs="liked.mvs" />
      </div>
    </div>

    <ContextMenu ref="playlistTabMenu">
      <div class="item" @click="changePlaylistFilter('all')"> 全部歌单 </div>
      <hr />
      <div class="item" @click="changePlaylistFilter('mine')">
        我创建的歌单
      </div>
      <div class="item" @click="changePlaylistFilter('liked')">
        收藏的歌单
      </div>
    </ContextMenu>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import { getLyric } from '@/api/track';
import { randomNum, dailyTask } from '@/utils/common';
import { isAccountLoggedIn } from '@/utils/auth';
import NProgress from 'nprogress';

import ContextMenu from '@/components/ContextMenu.vue';
import TrackList from '@/components/TrackList.vue';
import CoverRow from '@/components/CoverRow.vue';
import SvgIcon from '@/components/SvgIcon.vue';
import MvRow from '@/components/MvRow.vue';

export default {
  name: 'Library',
  components: { SvgIcon, CoverRow, TrackList, MvRow, ContextMenu },
  data() {
    return {
      show: false,
      likedSongs: [],
      lyric: undefined,
      currentTab: 'playlists',
    };
  },
  computed: {
    ...mapState(['data', 'liked']),
    pickedLyric() {
      if (this.lyric === undefined) return '';
      let lyric = this.lyric.split('\n');
      lyric = lyric.filter(l => {
        if (l.includes('作词') || l.includes('作曲')) {
          return false;
        }
        return true;
      });
      let lineIndex = randomNum(0, lyric.length - 1);
      while (lineIndex + 4 > lyric.length) {
        lineIndex = randomNum(0, lyric.length - 1);
      }
      return [
        lyric[lineIndex].split(']')[1],
        lyric[lineIndex + 1].split(']')[1],
        lyric[lineIndex + 2].split(']')[1],
      ];
    },
    playlistFilter() {
      return this.data.libraryPlaylistFilter || 'all';
    },
    filterPlaylists() {
      const playlists = this.liked.playlists;
      const userId = this.data.user.userId;
      if (this.playlistFilter === 'mine') {
        return playlists.filter(p => p.creator.userId === userId);
      } else if (this.playlistFilter === 'liked') {
        return playlists.filter(p => p.creator.userId !== userId);
      }
      return playlists;
    },
  },
  created() {
    NProgress.start();
  },
  activated() {
    if (this.liked.songsWithDetails.length > 0) {
      NProgress.done();
      this.show = true;
      this.getRandomLyric();
    } else {
      this.$store.dispatch('fetchLikedSongsWithDetails').then(() => {
        NProgress.done();
        this.show = true;
        this.getRandomLyric();
      });
    }
    this.$store.dispatch('fetchLikedSongs');
    this.$store.dispatch('fetchLikedPlaylist');
    this.$store.dispatch('fetchLikedAlbums');
    this.$store.dispatch('fetchLikedArtists');
    this.$store.dispatch('fetchLikedMVs');
    dailyTask();
  },
  methods: {
    ...mapActions(['showToast']),
    ...mapMutations(['updateModal', 'updateData']),
    playLikedSongs() {
      this.$store.state.player.playPlaylistByID(
        this.liked.playlists[0].id,
        'first',
        true
      );
    },
    updateCurrentTab(tab) {
      if (!isAccountLoggedIn() && tab !== 'playlists') {
        this.showToast('此操作需要登录网易云账号');
        return;
      }
      this.currentTab = tab;
      window.scrollTo({ top: 375, behavior: 'smooth' });
    },
    goToLikedSongsList() {
      this.$router.push({ path: '/library/liked-songs' });
    },
    getRandomLyric() {
      getLyric(
        this.liked.songs[randomNum(0, this.liked.songs.length - 1)]
      ).then(data => {
        if (data.lrc !== undefined) this.lyric = data.lrc.lyric;
      });
    },
    openAddPlaylistModal() {
      if (!isAccountLoggedIn()) {
        this.showToast('此操作需要登录网易云账号');
        return;
      }
      this.updateModal({
        modalName: 'newPlaylistModal',
        key: 'show',
        value: true,
      });
    },
    openPlaylistTabMenu(e) {
      this.$refs.playlistTabMenu.openMenu(e);
    },
    changePlaylistFilter(type) {
      this.updateData({ key: 'libraryPlaylistFilter', value: type });
      window.scrollTo({ top: 375, behavior: 'smooth' });
    },
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-size: 42px;
  color: var(--color-text);
  display: flex;
  align-items: center;
  .avatar {
    height: 44px;
    margin-right: 12px;
    vertical-align: -7px;
    border-radius: 50%;
    border: rgba(0, 0, 0, 0.2);
  }
}

.section-one {
  display: flex;
  margin-top: 24px;
  .songs {
    flex: 7;
    margin-top: 8px;
    margin-left: 36px;
    overflow: hidden;
  }
}

.liked-songs {
  flex: 3;
  margin-top: 8px;
  cursor: pointer;
  border-radius: 16px;
  padding: 18px 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.4s;
  box-sizing: border-box;

  background: var(--color-primary-bg);

  .bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--color-primary);

    .title {
      font-size: 24px;
      font-weight: 700;
    }
    .sub-title {
      font-size: 15px;
      margin-top: 2px;
    }

    button {
      margin-bottom: 2px;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 44px;
      width: 44px;
      background: var(--color-primary);
      border-radius: 50%;
      transition: 0.2s;
      box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.2);
      cursor: default;

      .svg-icon {
        color: var(--color-primary-bg);
        margin-left: 4px;
        height: 16px;
        width: 16px;
      }
      &:hover {
        transform: scale(1.06);
        box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.4);
      }
      &:active {
        transform: scale(0.94);
      }
    }
  }

  .top {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    font-size: 14px;
    opacity: 0.88;
    color: var(--color-primary);
    p {
      margin-top: 2px;
    }
  }
}

.section-two {
  margin-top: 54px;
  min-height: calc(100vh - 182px);
}

.tabs-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  font-size: 18px;
  color: var(--color-text);
  .tab {
    font-weight: 600;
    padding: 8px 14px;
    margin-right: 14px;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    transition: 0.2s;
    opacity: 0.68;
    &:hover {
      opacity: 0.88;
      background-color: var(--color-secondary-bg);
    }
  }
  .tab.active {
    opacity: 0.88;
    background-color: var(--color-secondary-bg);
  }
  .tab.dropdown {
    display: flex;
    align-items: center;
    padding: 0;
    overflow: hidden;
    .text {
      padding: 8px 3px 8px 14px;
    }
    .icon {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 8px 0 3px;
      .svg-icon {
        height: 16px;
        width: 16px;
      }
    }
  }
}

button.add-playlist {
  color: var(--color-text);
  border-radius: 8px;
  padding: 0 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
  opacity: 0.68;
  font-weight: 500;
  .svg-icon {
    width: 14px;
    height: 14px;
    margin-right: 8px;
  }
  &:hover {
    opacity: 1;
    background: var(--color-secondary-bg);
  }
  &:active {
    opacity: 1;
    transform: scale(0.92);
  }
}
</style>
