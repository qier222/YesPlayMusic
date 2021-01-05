<template>
  <div class="search" v-show="show">
    <h1>
      <span>{{ $t("search.searchFor") }}</span> "{{ keywords }}"
    </h1>
    <div class="result" v-if="isExistResult">
      <div class="row">
        <div class="artists" v-if="result.hasOwnProperty('artist')">
          <div class="section-title">{{ $t("search.artist") }}</div>
          <div class="artists-list">
            <div
              class="artist"
              v-for="artist in result.artist.artists.slice(0, 3)"
              :key="artist.id"
            >
              <Cover
                :imageUrl="getArtistImageUrl(artist)"
                type="artist"
                :id="artist.id"
                :fixedSize="128"
                :playButtonSize="30"
              />
              <div class="name">
                <router-link :to="`/artist/${artist.id}`">{{
                  artist.name
                }}</router-link>
              </div>
            </div>
          </div>
        </div>
        <div class="albums" v-if="result.hasOwnProperty('album')">
          <div class="section-title">{{ $t("search.album") }}</div>
          <div class="albums-list">
            <div
              class="album"
              v-for="album in result.album.albums.slice(0, 4)"
              :key="album.id"
            >
              <div>
                <Cover
                  :imageUrl="album.picUrl | resizeImage"
                  type="album"
                  :id="album.id"
                  :fixedSize="128"
                  :playButtonSize="30"
                />
              </div>
              <div class="name">
                <router-link :to="`/album/${album.id}`">{{
                  album.name
                }}</router-link>
              </div>
              <div class="artist">
                <router-link :to="`/artist/${album.artist.id}`">{{
                  album.artist.name
                }}</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tracks" v-if="result.hasOwnProperty('song')">
        <div class="section-title">{{ $t("search.song") }}</div>
        <TrackList :tracks="tracks" type="tracklist" />
      </div>

      <div class="mvs" v-if="mvs !== null && mvs.length > 0">
        <div class="section-title">{{ $t("search.mv") }}</div>
        <MvRow :mvs="mvs.slice(0, 5)" />
      </div>

      <div class="playlists" v-if="result.hasOwnProperty('playList')">
        <div class="section-title">{{ $t("search.playlist") }}</div>
        <div class="albums-list">
          <div
            class="album"
            v-for="playlist in result.playList.playLists.slice(0, 12)"
            :key="playlist.id"
          >
            <div>
              <Cover
                :imageUrl="playlist.coverImgUrl | resizeImage"
                type="playlist"
                :id="playlist.id"
                :fixedSize="128"
                :playButtonSize="30"
              />
            </div>
            <div class="name">
              <router-link :to="`/playlist/${playlist.id}`">{{
                playlist.name
              }}</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="no-results" v-else>
      {{ $t("search.noResult") }}
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import NProgress from "nprogress";
import { search } from "@/api/others";

import Cover from "@/components/Cover.vue";
import TrackList from "@/components/TrackList.vue";
import MvRow from "@/components/MvRow.vue";

export default {
  name: "Search",
  components: {
    Cover,
    TrackList,
    MvRow,
  },
  data() {
    return {
      show: false,
      result: {},
      mvs: [],
      type: 1,
      limit: 30,
      offset: 0,
    };
  },
  computed: {
    ...mapState(["search"]),
    keywords() {
      return this.$route.query.keywords;
    },
    tracks() {
      let tracks = this.result.song.songs.slice(0, 12);
      return tracks;
    },
    isExistResult() {
      return Object.keys(this.result).length;
    },
  },
  methods: {
    goToAlbum(id) {
      this.$router.push({ name: "album", params: { id } });
    },
    playTrackInSearchResult(id) {
      let track = this.tracks.find((t) => t.id === id);
      this.$store.state.player.appendTrackToPlayerList(track, true);
    },
    getData(keywords) {
      search({ keywords: keywords, type: 1018 }).then((data) => {
        this.result = data.result;
        NProgress.done();
        this.show = true;
      });
      search({ keywords: keywords, type: 1004 }).then((data) => {
        this.mvs = data.result.mvs;
      });
    },
    getArtistImageUrl(artist) {
      if (artist.img1v1Url) {
        let img1v1ID = artist.img1v1Url.split("/");
        img1v1ID = img1v1ID[img1v1ID.length - 1];
        if (img1v1ID === "5639395138885805.jpg") {
          // 没有头像的歌手，网易云返回的img1v1Url并不是正方形的 😅😅😅
          return "https://p2.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg?param=512x512";
        }
      }
      return artist.img1v1Url + "?param=512x512";
    },
  },
  created() {
    this.getData(this.$route.query.keywords);
  },
  beforeRouteUpdate(to, from, next) {
    this.show = false;
    next();
    NProgress.start();
    this.getData(to.query.keywords);
  },
};
</script>

<style lang="scss" scoped>
h1 {
  margin-top: -10px;
  margin-bottom: 0;
  color: var(--color-text);
  span {
    opacity: 0.58;
  }
}

.section-title {
  font-weight: 600;
  font-size: 22px;
  opacity: 0.88;
  color: var(--color-text);
  margin-bottom: 16px;
  margin-top: 46px;
}

.row {
  display: flex;
  flex-wrap: wrap;
}

.artists,
.albums {
  flex: 1;
}

.artists-list {
  display: flex;
  padding-right: 48px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  .artist {
    display: flex;
    align-items: center;
    flex-direction: column;
    border-radius: 8px;
    margin: {
      left: 8px;
      right: 24px;
    }
    .name {
      margin-top: 8px;
    }
  }
}

.albums-list {
  display: flex;
  color: var(--color-text);
  .album {
    img {
      height: 128px;
      border-radius: 8px;
    }
    border-radius: 8px;
    margin: {
      right: 14px;
      left: 4px;
    }
    .name {
      margin-top: 6px;
      font-weight: 600;
      font-size: 14px;
      width: 128px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    .artist {
      font-size: 12px;
      opacity: 0.68;
    }
  }
}

.no-results {
  margin-top: 24px;
  font-size: 24px;
}
</style>
