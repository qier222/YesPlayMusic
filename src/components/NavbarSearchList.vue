<template>
  <div class="search-mini-result">
    <div class="content">
      <div v-show="searching || notFound" class="loading">
        <svg-icon
          v-show="!notFound"
          icon-class="loadding"
          class="loading-icon"
        ></svg-icon>
        {{ !notFound ? $t('nav.search-loading') : $t('nav.search-not-found') }}
      </div>
      <div v-show="!searching && !notFound" style="width: 90%">
        <ListItem
          v-for="song in searchSongs"
          :key="song.id"
          class="song-item"
          :track="song"
          @play-song="playSong(song.id, song.playable)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { search } from '@/api/others';
import { getTrackDetail } from '@/api/track';
import debounce from 'lodash/debounce';
// import throttle from 'lodash/throttle';
import ListItem from '@/components/NavbarSearchListItem.vue';

export default {
  components: { ListItem },
  props: {
    keywords: { type: String, default: '' },
  },
  data() {
    return {
      type: 'tracklist',
      searchSongs: Array.from(Array(30), () => {
        return {};
      }),
      notFound: false,
      searching: false,
    };
  },
  computed: {
    ...mapState(['player']),
  },
  watch: {
    keywords: function (val) {
      // start search
      const keywords = val.trim();
      if (keywords.length === 0) {
        this.searching = false;
        return;
      }
      this.notFound = false;
      this.searching = true;
      this.fetchSongs();
    },
  },
  methods: {
    fetchSongs: debounce(async function () {
      const data = await search({ keywords: this.keywords });
      const songs = data?.result?.songs;
      if (!songs) {
        this.notFound = true;
        this.searching = false;
        return;
      }
      // this.searchSongs = new Array(Object.keys(songs).length);
      this.searching = false;
      const trackIDs = songs.map(t => t.id);
      getTrackDetail(trackIDs.join(',')).then(result => {
        this.searchSongs = result.songs;
      });
    }, 800),
    playSong(trackID, playable) {
      if (!playable) return;
      // this.player.playPlaylistByID(id);
      let trackIDs = this.searchSongs.map(t => t.id);
      this.player.replacePlaylist(trackIDs, 0, 'artist', trackID);
    },
  },
};
</script>

<style lang="scss" scoped>
.search-mini-result {
  max-height: 400px;
  width: 200px;
  overflow-y: auto;
  position: absolute;
  background: var(--color-secondary-bg);
  border-radius: 8px;
  top: 48px;
  margin-top: 6px;
  .content {
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    // flex-wrap: wrap;
    color: var(--color-text);
    .loading {
      display: flex;
      align-items: center;
      font-weight: 600;
      .svg-icon {
        margin: 0.75rem;
        height: 1.25rem;
        width: 1.25rem;
        animation: spin 1s linear infinite;
      }
    }
    .song-item {
      cursor: pointer;
      display: flex;
      align-items: center;
      height: 40px;
      padding: 8px;
      margin-top: 10px;
      margin-bottom: 10px;
      overflow: hidden;
      border-radius: 8px;
      &:hover {
        transition: all 0.3s;
        background: var(--color-body-bg);
      }
    }
  }
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
