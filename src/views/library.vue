<template>
  <div v-show="show">
    <h1>
      <img class="head" :src="user.profile.avatarUrl | resizeImage" />{{
        user.profile.nickname
      }}{{ $t("library.sLibrary") }}
    </h1>
    <div class="section-one">
      <div class="liked-songs" @click="goToLikedSongsList">
        <div class="top">
          <p>
            <span
              v-for="(line, index) in pickedLyric"
              :key="`${line}${index}`"
              v-show="line !== ''"
              >{{ line }}<br
            /></span>
          </p>
        </div>
        <div class="bottom">
          <div class="titles">
            <div class="title">{{ $t("library.likedSongs") }}</div>
            <div class="sub-title">
              {{ likedSongsPlaylist.trackCount }} {{ $t("common.songs") }}
            </div>
          </div>
          <button @click.stop="playLikedSongs">
            <svg-icon icon-class="play" />
          </button>
        </div>
      </div>
      <div class="songs">
        <TrackList
          :tracks="likedSongs"
          :type="'tracklist'"
          :itemWidth="220"
          :id="likedSongsPlaylist.id"
          dbclickTrackFunc="playPlaylistByID"
        />
      </div>
    </div>

    <div class="section-two" id="liked">
      <div class="tabs">
        <div
          class="tab"
          :class="{ active: currentTab === 'playlists' }"
          @click="updateCurrentTab('playlists')"
        >
          Playlists
        </div>
        <div
          class="tab"
          :class="{ active: currentTab === 'albums' }"
          @click="updateCurrentTab('albums')"
        >
          Albums
        </div>
        <div
          class="tab"
          :class="{ active: currentTab === 'artists' }"
          @click="updateCurrentTab('artists')"
        >
          Artists
        </div>
        <div
          class="tab"
          :class="{ active: currentTab === 'mvs' }"
          @click="updateCurrentTab('mvs')"
        >
          MVs
        </div>
      </div>

      <div v-show="currentTab === 'playlists'">
        <div v-if="playlists.length > 1">
          <CoverRow
            :items="playlists.slice(1)"
            type="playlist"
            subText="creator"
            :showPlayButton="true"
          />
        </div>
      </div>

      <div v-show="currentTab === 'albums'">
        <CoverRow
          :items="albums"
          type="album"
          subText="artist"
          :showPlayButton="true"
        />
      </div>

      <div v-show="currentTab === 'artists'">
        <CoverRow :items="artists" type="artist" :showPlayButton="true" />
      </div>

      <div v-show="currentTab === 'mvs'">
        <MvRow :mvs="mvs" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getTrackDetail, getLyric } from "@/api/track";
import {
  userDetail,
  userPlaylist,
  likedAlbums,
  likedArtists,
  likedMVs,
} from "@/api/user";
import { randomNum, dailyTask } from "@/utils/common";
import { getPlaylistDetail } from "@/api/playlist";
import { playPlaylistByID } from "@/utils/play";
import NProgress from "nprogress";

import TrackList from "@/components/TrackList.vue";
import CoverRow from "@/components/CoverRow.vue";
import MvRow from "@/components/MvRow.vue";
import SvgIcon from "@/components/SvgIcon.vue";

export default {
  name: "Library",
  components: { SvgIcon, CoverRow, TrackList, MvRow },
  data() {
    return {
      show: false,
      user: {
        profile: {
          avatarUrl: "",
          nickname: "",
        },
      },
      playlists: [],
      hasMorePlaylists: true,
      likedSongsPlaylist: {
        id: 0,
        trackCount: 0,
      },
      likedSongs: [],
      likedSongIDs: [],
      lyric: undefined,
      currentTab: "playlists",
      albums: [],
      artists: [],
      mvs: [],
    };
  },
  created() {
    NProgress.start();
    userDetail(this.data.user.userId).then((data) => {
      this.user = data;
    });
  },
  activated() {
    this.loadData();
    dailyTask();
  },
  computed: {
    ...mapState(["data"]),
    likedSongsInState() {
      return this.$store.state.liked.songs;
    },
    pickedLyric() {
      if (this.lyric === undefined) return "";
      let lyric = this.lyric.split("\n");
      lyric = lyric.filter((l) => {
        if (l.includes("作词") || l.includes("作曲")) {
          return false;
        }
        return true;
      });
      let lineIndex = randomNum(0, lyric.length - 1);
      while (lineIndex + 4 > lyric.length) {
        lineIndex = randomNum(0, lyric.length - 1);
      }
      return [
        lyric[lineIndex].split("]")[1],
        lyric[lineIndex + 1].split("]")[1],
        lyric[lineIndex + 2].split("]")[1],
      ];
    },
  },
  methods: {
    playLikedSongs() {
      playPlaylistByID(this.playlists[0].id, "first", true);
    },
    updateCurrentTab(tab) {
      this.currentTab = tab;
      document
        .getElementById("liked")
        .scrollIntoView({ block: "start", behavior: "smooth" });
      if (tab === "albums") {
        if (this.albums.length === 0) this.loadLikedAlbums();
      } else if (tab === "artists") {
        if (this.artists.length === 0) this.loadLikedArtists();
      } else if (tab === "mvs") {
        if (this.mvs.length === 0) this.loadLikedMVs();
      }
    },
    goToLikedSongsList() {
      this.$router.push({ path: "/library/liked-songs" });
    },
    loadData() {
      if (this.hasMorePlaylists && this.currentTab === "playlists") {
        this.getUserPlaylists();
      }
      if (this.currentTab === "albums") {
        this.loadLikedAlbums();
      } else if (this.currentTab === "artists") {
        this.loadLikedArtists();
      } else if (this.currentTab === "mvs") {
        this.loadLikedMVs();
      }
      this.getLikedSongs();
    },
    getUserPlaylists(replace = false) {
      userPlaylist({
        uid: this.data.user.userId,
        offset: this.playlists.length === 0 ? 0 : this.playlists.length - 1,
        timestamp: new Date().getTime(),
      }).then((data) => {
        if (replace) {
          this.playlists = data.playlist;
        } else {
          this.playlists.push(...data.playlist);
        }
        this.hasMorePlaylists = data.more;
      });
    },
    getLikedSongs(getLyric = true) {
      getPlaylistDetail(this.data.likedSongPlaylistID, true).then((data) => {
        this.likedSongsPlaylist = data.playlist;
        let TrackIDs = data.playlist.trackIds.slice(0, 20).map((t) => t.id);
        this.likedSongIDs = TrackIDs;
        getTrackDetail(this.likedSongIDs.join(",")).then((data) => {
          this.likedSongs = data.songs;
          NProgress.done();
          this.show = true;
        });
        if (getLyric) this.getRandomLyric();
      });
    },
    getRandomLyric() {
      getLyric(
        this.likedSongIDs[randomNum(0, this.likedSongIDs.length - 1)]
      ).then((data) => {
        if (data.lrc !== undefined) this.lyric = data.lrc.lyric;
      });
    },
    loadLikedAlbums() {
      NProgress.start();
      likedAlbums().then((data) => {
        this.albums = data.data;
        NProgress.done();
      });
    },
    loadLikedArtists() {
      NProgress.start();
      likedArtists().then((data) => {
        this.artists = data.data;
        NProgress.done();
      });
    },
    loadLikedMVs() {
      NProgress.start();
      likedMVs().then((data) => {
        this.mvs = data.data;
        NProgress.done();
      });
    },
  },
  watch: {
    likedSongsInState() {
      this.getLikedSongs(false);
    },
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-size: 42px;
  color: var(--color-text);
  .head {
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
    height: 216px;
    overflow: hidden;
  }
}

.liked-songs {
  flex: 3;
  margin-top: 8px;
  cursor: pointer;
  height: 216px;
  width: 300px;
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
  // margin-top: 42px;
  // padding-top: 14px;
  // border-top: 1px solid rgba(128, 128, 128, 0.18);
  margin-top: 54px;
  min-height: calc(100vh - 182px);
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  font-size: 18px;
  color: var(--color-text);
  margin-bottom: 6px;
  .tab {
    font-weight: 600;
    padding: 8px 14px;
    margin: 10px 14px 6px 0;
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
}
</style>
