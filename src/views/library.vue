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

    <div class="playlists" v-if="playlists.length > 1">
      <div class="title">{{ $t("playlist.playlist") }}</div>
      <div>
        <CoverRow
          :items="playlists.slice(1)"
          type="playlist"
          subText="creator"
          :showPlayButton="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getTrackDetail, getLyric } from "@/api/track";
import { userDetail, userPlaylist } from "@/api/user";
import { randomNum } from "@/utils/common";
import { getPlaylistDetail } from "@/api/playlist";
import { playPlaylistByID } from "@/utils/play";
import NProgress from "nprogress";

import TrackList from "@/components/TrackList.vue";
import CoverRow from "@/components/CoverRow.vue";
import SvgIcon from "@/components/SvgIcon.vue";

export default {
  name: "Library",
  components: { SvgIcon, CoverRow, TrackList },
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
    };
  },
  created() {
    NProgress.start();
    userDetail(this.settings.user.userId).then((data) => {
      this.user = data;
    });
  },
  activated() {
    this.loadData();
  },
  computed: {
    ...mapState(["settings"]),
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
    goToLikedSongsList() {
      this.$router.push({ path: "/library/liked-songs" });
    },
    loadData() {
      if (this.hasMorePlaylists) {
        this.getUserPlaylists();
      }
      this.getLikedSongs();
    },
    getUserPlaylists(replace = false) {
      userPlaylist({
        uid: this.settings.user.userId,
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
      getPlaylistDetail(this.settings.user.likedSongPlaylistID, true).then(
        (data) => {
          this.likedSongsPlaylist = data.playlist;
          let TrackIDs = data.playlist.trackIds.slice(0, 20).map((t) => t.id);
          this.likedSongIDs = TrackIDs;
          getTrackDetail(this.likedSongIDs.join(",")).then((data) => {
            this.likedSongs = data.songs;
            NProgress.done();
            this.show = true;
          });
          if (getLyric) this.getRandomLyric();
        }
      );
    },
    getRandomLyric() {
      getLyric(
        this.likedSongIDs[randomNum(0, this.likedSongIDs.length - 1)]
      ).then((data) => {
        if (data.lrc !== undefined) this.lyric = data.lrc.lyric;
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
    overflow: auto;
  }
  .songs::-webkit-scrollbar {
    width: 0 !important;
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

  background: #eaeffd;
  // background: linear-gradient(-30deg, #60a6f7, #4364f7, #0052d4);
  // color: white;
  // background: linear-gradient(149.46deg, #450af5, #8e8ee5 99.16%);

  .bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 24px;
      font-weight: 700;
      color: #335eea;
    }
    .sub-title {
      font-size: 15px;
      margin-top: 2px;
      color: #335eea;
    }

    button {
      margin-bottom: 2px;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 44px;
      width: 44px;
      // background: rgba(255, 255, 255, 1);
      background: #335eea;
      border-radius: 50%;
      transition: 0.2s;
      box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.2);
      cursor: default;

      .svg-icon {
        // color: #3f63f5;
        color: #eaeffd;
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
    color: rgba(51, 94, 234, 0.88);
    p {
      margin-top: 2px;
    }
  }
}

.playlists {
  margin-top: 54px;
  .title {
    color: rgba(0, 0, 0, 0.88);
    margin-bottom: 8px;
    font-size: 24px;
    font-weight: 600;
  }
}
</style>
