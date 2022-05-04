<template>
  <div v-show="show" class="artist-page">
    <div class="artist-info">
      <div class="head">
        <img :src="artist.img1v1Url | resizeImage(1024)" loading="lazy" />
      </div>
      <div>
        <div class="name">{{ artist.name }}</div>
        <div class="artist">{{ $t('artist.artist') }}</div>
        <div class="statistics">
          <a @click="scrollTo('popularTracks')"
            >{{ artist.musicSize }} {{ $t('common.songs') }}</a
          >
          ·
          <a @click="scrollTo('seeMore', 'start')"
            >{{ artist.albumSize }} {{ $t('artist.withAlbums') }}</a
          >
          ·
          <a @click="scrollTo('mvs')"
            >{{ artist.mvSize }} {{ $t('artist.videos') }}</a
          >
        </div>
        <div class="description" @click="toggleFullDescription">
          {{ artist.briefDesc }}
        </div>
        <div class="buttons">
          <ButtonTwoTone icon-class="play" @click.native="playPopularSongs()">
            {{ $t('common.play') }}
          </ButtonTwoTone>
          <ButtonTwoTone color="grey" @click.native="followArtist">
            <span v-if="artist.followed">{{ $t('artist.following') }}</span>
            <span v-else>{{ $t('artist.follow') }}</span>
          </ButtonTwoTone>
          <ButtonTwoTone
            icon-class="more"
            :icon-button="true"
            :horizontal-padding="0"
            color="grey"
            @click.native="openMenu"
          >
          </ButtonTwoTone>
        </div>
      </div>
    </div>
    <div v-if="latestRelease !== undefined" class="latest-release">
      <div class="section-title">{{ $t('artist.latestRelease') }}</div>
      <div class="release">
        <div class="container">
          <Cover
            :id="latestRelease.id"
            :image-url="latestRelease.picUrl | resizeImage"
            type="album"
            :fixed-size="128"
            :play-button-size="30"
          />
          <div class="info">
            <div class="name">
              <router-link :to="`/album/${latestRelease.id}`">{{
                latestRelease.name
              }}</router-link>
            </div>
            <div class="date">
              {{ latestRelease.publishTime | formatDate }}
            </div>
            <div class="type">
              {{ latestRelease.type | formatAlbumType(latestRelease) }} ·
              {{ latestRelease.size }} {{ $t('common.songs') }}
            </div>
          </div>
        </div>
        <div v-show="latestMV.id" class="container latest-mv">
          <div
            class="cover"
            @mouseover="mvHover = true"
            @mouseleave="mvHover = false"
            @click="goToMv(latestMV.id)"
          >
            <img :src="latestMV.coverUrl" loading="lazy" />
            <transition name="fade">
              <div
                v-show="mvHover"
                class="shadow"
                :style="{
                  background: 'url(' + latestMV.coverUrl + ')',
                }"
              ></div>
            </transition>
          </div>
          <div class="info">
            <div class="name">
              <router-link :to="'/mv/' + latestMV.id">{{
                latestMV.name
              }}</router-link>
            </div>
            <div class="date">
              {{ latestMV.publishTime | formatDate }}
            </div>
            <div class="type">{{ $t('artist.latestMV') }}</div>
          </div>
        </div>
        <div v-show="!latestMV.id"></div>
      </div>
    </div>
    <div id="popularTracks" class="popular-tracks">
      <div class="section-title">{{ $t('artist.popularSongs') }}</div>
      <TrackList
        :tracks="popularTracks.slice(0, showMorePopTracks ? 24 : 12)"
        :type="'tracklist'"
      />

      <div id="seeMore" class="show-more">
        <button @click="showMorePopTracks = !showMorePopTracks">
          <span v-show="!showMorePopTracks">{{ $t('artist.showMore') }}</span>
          <span v-show="showMorePopTracks">{{ $t('artist.showLess') }}</span>
        </button>
      </div>
    </div>
    <div v-if="albums.length !== 0" id="albums" class="albums">
      <div class="section-title">{{ $t('artist.albums') }}</div>
      <CoverRow
        :type="'album'"
        :items="albums"
        :sub-text="'releaseYear'"
        :show-play-button="true"
      />
    </div>
    <div v-if="mvs.length !== 0" id="mvs" class="mvs">
      <div class="section-title"
        >MVs
        <router-link v-show="hasMoreMV" :to="`/artist/${artist.id}/mv`">{{
          $t('home.seeMore')
        }}</router-link>
      </div>
      <MvRow :mvs="mvs" subtitle="publishTime" />
    </div>
    <div v-if="eps.length !== 0" class="eps">
      <div class="section-title">{{ $t('artist.EPsSingles') }}</div>
      <CoverRow
        :type="'album'"
        :items="eps"
        :sub-text="'albumType+releaseYear'"
        :show-play-button="true"
      />
    </div>

    <div v-if="similarArtists.length !== 0" class="similar-artists">
      <div class="section-title">{{ $t('artist.similarArtists') }}</div>
      <CoverRow
        type="artist"
        :column-number="6"
        gap="36px 28px"
        :items="similarArtists.slice(0, 12)"
      />
    </div>

    <Modal
      :show="showFullDescription"
      :close="toggleFullDescription"
      :show-footer="false"
      :click-outside-hide="true"
      :title="$t('artist.artistDesc')"
    >
      <p class="description-fulltext">
        {{ artist.briefDesc }}
      </p>
    </Modal>

    <ContextMenu ref="artistMenu">
      <div class="item" @click="copyUrl(artist.id)">{{
        $t('contextMenu.copyUrl')
      }}</div>
      <div class="item" @click="openInBrowser(artist.id)">{{
        $t('contextMenu.openInBrowser')
      }}</div>
    </ContextMenu>
  </div>
</template>

<script>
import { mapMutations, mapActions, mapState } from 'vuex';
import {
  getArtist,
  getArtistAlbum,
  artistMv,
  followAArtist,
  similarArtists,
} from '@/api/artist';
import locale from '@/locale';
import { isAccountLoggedIn } from '@/utils/auth';
import NProgress from 'nprogress';

import ButtonTwoTone from '@/components/ButtonTwoTone.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import TrackList from '@/components/TrackList.vue';
import CoverRow from '@/components/CoverRow.vue';
import Cover from '@/components/Cover.vue';
import MvRow from '@/components/MvRow.vue';
import Modal from '@/components/Modal.vue';

export default {
  name: 'Artist',
  components: {
    Cover,
    ButtonTwoTone,
    TrackList,
    CoverRow,
    MvRow,
    Modal,
    ContextMenu,
  },
  beforeRouteUpdate(to, from, next) {
    this.artist.img1v1Url =
      'https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg';
    this.loadData(to.params.id, next);
  },
  data() {
    return {
      show: false,
      artist: {
        img1v1Url:
          'https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg',
      },
      popularTracks: [],
      albumsData: [],
      latestRelease: {
        picUrl: '',
        publishTime: 0,
        id: 0,
        name: '',
        type: '',
        size: '',
      },
      showMorePopTracks: false,
      showFullDescription: false,
      mvs: [],
      hasMoreMV: false,
      similarArtists: [],
      mvHover: false,
    };
  },
  computed: {
    ...mapState(['player']),
    albums() {
      return this.albumsData.filter(a => a.type === '专辑');
    },
    eps() {
      return this.albumsData.filter(a =>
        ['EP/Single', 'EP', 'Single'].includes(a.type)
      );
    },
    latestMV() {
      const mv = this.mvs[0] || {};
      return {
        id: mv.id || mv.vid,
        name: mv.name || mv.title,
        coverUrl: `${mv.imgurl16v9 || mv.cover || mv.coverUrl}?param=464y260`,
        publishTime: mv.publishTime,
      };
    },
  },
  activated() {
    if (this.artist?.id?.toString() !== this.$route.params.id) {
      this.loadData(this.$route.params.id);
    } else {
      this.$parent.$refs.scrollbar.restorePosition();
    }
  },
  methods: {
    ...mapMutations(['appendTrackToPlayerList']),
    ...mapActions(['playFirstTrackOnList', 'playTrackOnListByID', 'showToast']),
    loadData(id, next = undefined) {
      setTimeout(() => {
        if (!this.show) NProgress.start();
      }, 1000);
      this.show = false;
      this.$parent.$refs.main.scrollTo({ top: 0 });
      getArtist(id).then(data => {
        this.artist = data.artist;
        this.popularTracks = data.hotSongs;
        if (next !== undefined) next();
        NProgress.done();
        this.show = true;
      });
      getArtistAlbum({ id: id, limit: 200 }).then(data => {
        this.albumsData = data.hotAlbums;
        this.latestRelease = data.hotAlbums[0];
      });
      artistMv({ id }).then(data => {
        this.mvs = data.mvs;
        this.hasMoreMV = data.hasMore;
      });
      similarArtists(id).then(data => {
        this.similarArtists = data.artists;
      });
    },
    goToAlbum(id) {
      this.$router.push({
        name: 'album',
        params: { id },
      });
    },
    goToMv(id) {
      this.$router.push({ path: '/mv/' + id });
    },
    playPopularSongs(trackID = 'first') {
      let trackIDs = this.popularTracks.map(t => t.id);
      this.$store.state.player.replacePlaylist(
        trackIDs,
        this.artist.id,
        'artist',
        trackID
      );
    },
    followArtist() {
      if (!isAccountLoggedIn()) {
        this.showToast(locale.t('toast.needToLogin'));
        return;
      }
      followAArtist({
        id: this.artist.id,
        t: this.artist.followed ? 0 : 1,
      }).then(data => {
        if (data.code === 200) this.artist.followed = !this.artist.followed;
      });
    },
    scrollTo(div, block = 'center') {
      document.getElementById(div).scrollIntoView({
        behavior: 'smooth',
        block,
      });
    },
    toggleFullDescription() {
      this.showFullDescription = !this.showFullDescription;
      if (this.showFullDescription) {
        this.$store.commit('enableScrolling', false);
      } else {
        this.$store.commit('enableScrolling', true);
      }
    },
    openMenu(e) {
      this.$refs.artistMenu.openMenu(e);
    },
    copyUrl(id) {
      let showToast = this.showToast;
      this.$copyText(`https://music.163.com/#/artist?id=${id}`)
        .then(function () {
          showToast(locale.t('toast.copied'));
        })
        .catch(error => {
          showToast(`${locale.t('toast.copyFailed')}${error}`);
        });
    },
    openInBrowser(id) {
      const url = `https://music.163.com/#/artist?id=${id}`;
      window.open(url);
    },
  },
};
</script>

<style lang="scss" scoped>
.artist-page {
  margin-top: 32px;
}

.artist-info {
  display: flex;
  align-items: center;
  margin-bottom: 26px;
  color: var(--color-text);
  img {
    height: 248px;
    width: 248px;
    border-radius: 50%;
    margin-right: 56px;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 12px 16px -8px;
  }
  .name {
    font-size: 56px;
    font-weight: 700;
  }

  .artist {
    font-size: 18px;
    opacity: 0.88;
    margin-top: 24px;
  }

  .statistics {
    font-size: 14px;
    opacity: 0.68;
    margin-top: 2px;
  }

  .buttons {
    margin-top: 26px;
    display: flex;
    .shuffle {
      padding: 8px 11px;
      .svg-icon {
        margin: 0;
      }
    }
  }

  .description {
    user-select: none;
    font-size: 14px;
    opacity: 0.68;
    margin-top: 24px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    cursor: pointer;
    white-space: pre-line;
    &:hover {
      transition: opacity 0.3s;
      opacity: 0.88;
    }
  }
}

.section-title {
  font-weight: 600;
  font-size: 22px;
  opacity: 0.88;
  color: var(--color-text);
  margin-bottom: 16px;
  padding-top: 46px;

  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  a {
    font-size: 13px;
    font-weight: 600;
    opacity: 0.68;
  }
}

.latest-release {
  color: var(--color-text);
  .release {
    display: flex;
  }
  .container {
    display: flex;
    flex: 1;
    align-items: center;
    border-radius: 12px;
  }
  img {
    height: 96px;
    border-radius: 8px;
  }
  .info {
    margin-left: 24px;
  }
  .name {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .date {
    font-size: 14px;
    opacity: 0.78;
  }
  .type {
    margin-top: 2px;
    font-size: 12px;
    opacity: 0.68;
  }
}

.popular-tracks {
  .show-more {
    display: flex;

    button {
      padding: 4px 8px;
      margin-top: 8px;
      border-radius: 6px;
      font-size: 12px;
      opacity: 0.78;
      color: var(--color-secondary);
      font-weight: 600;
      &:hover {
        opacity: 1;
      }
    }
  }
}

.similar-artists {
  .section-title {
    margin-bottom: 24px;
  }
}

.latest-mv {
  .cover {
    position: relative;
    transition: transform 0.3s;
    &:hover {
      cursor: pointer;
    }
  }
  img {
    border-radius: 0.75em;
    height: 128px;
    object-fit: cover;
    user-select: none;
  }

  .shadow {
    position: absolute;
    top: 6px;
    height: 100%;
    width: 100%;
    filter: blur(16px) opacity(0.4);
    transform: scale(0.9, 0.9);
    z-index: -1;
    background-size: cover;
    border-radius: 0.75em;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
}

.description-fulltext {
  font-size: 16px;
  margin-top: 24px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-line;
}
</style>
