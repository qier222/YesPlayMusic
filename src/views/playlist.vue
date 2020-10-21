<template>
  <div v-show="show">
    <div class="playlist-info" v-if="!isLikeSongsPage">
      <Cover
        :url="playlist.coverImgUrl | resizeImage(1024)"
        :showPlayButton="true"
        :alwaysShowShadow="true"
        :clickToPlay="true"
        :size="288"
      />
      <div class="info">
        <div class="title">{{ playlist.name }}</div>
        <div class="artist">
          Playlist by
          <span
            style="font-weight:600"
            v-if="
              [
                5277771961,
                5277965913,
                5277969451,
                5277778542,
                5278068783
              ].includes(playlist.id)
            "
            >Apple Music</span
          >
          <a
            v-else
            :href="
              `https://music.163.com/#/user/home?id=${playlist.creator.userId}`
            "
            target="blank"
            >{{ playlist.creator.nickname }}</a
          >
        </div>
        <div class="date-and-count">
          {{ $t("playlist.updatedAt") }}
          {{ playlist.updateTime | formatDate }} ·
          {{ playlist.trackCount }} Songs
        </div>
        <div class="description" @click="showFullDescription = true">
          {{ playlist.description }}
        </div>
        <div class="buttons">
          <ButtonTwoTone @click.native="playPlaylistByID()" :iconClass="`play`">
            {{ $t("play") }}
          </ButtonTwoTone>
          <ButtonTwoTone
            v-if="
              isLoggedIn && playlist.creator.userId !== settings.user.userId
            "
            shape="round"
            :iconClass="playlist.subscribed ? 'heart-solid' : 'heart'"
            :iconButton="true"
            :horizontalPadding="0"
            @click.native="likePlaylist"
          >
          </ButtonTwoTone>
        </div>
      </div>
    </div>

    <div class="user-info" v-else>
      <h1>
        <img class="avatar" :src="settings.user.avatarUrl | resizeImage" />{{
          settings.user.nickname
        }}{{ $t("library.sLikedSongs") }}
      </h1>
    </div>

    <TrackList :tracks="tracks" :type="'playlist'" :id="playlist.id" />

    <transition name="fade">
      <div
        class="shade"
        @click="showFullDescription = false"
        v-show="showFullDescription"
      >
        <div class="description-full" @click.stop>
          <span>{{ playlist.description }}</span>
          <span class="close" @click="showFullDescription = false">
            {{ $t('modal.close') }}
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapMutations, mapActions, mapState } from "vuex";
import NProgress from "nprogress";
import { getPlaylistDetail, subscribePlaylist } from "@/api/playlist";
import { playAList } from "@/utils/play";
import { getTrackDetail } from "@/api/track";
import { isLoggedIn } from "@/utils/auth";

import ButtonTwoTone from "@/components/ButtonTwoTone.vue";
import TrackList from "@/components/TrackList.vue";
import Cover from "@/components/Cover.vue";

export default {
  name: "Playlist",
  components: {
    Cover,
    ButtonTwoTone,
    TrackList
  },
  data() {
    return {
      show: false,
      playlist: {
        coverImgUrl: "",
        creator: {
          userId: ""
        },
        trackIds: []
      },
      showFullDescription: false,
      tracks: [],
      loadingMore: false,
      lastLoadedTrackIndex: 9
    };
  },
  created() {
    if (this.$route.name === "likedSongs") {
      this.loadData(this.settings.user.likedSongPlaylistID);
    } else {
      this.loadData(this.$route.params.id);
    }
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll, true);
  },
  computed: {
    ...mapState(["player", "settings"]),
    isLoggedIn() {
      return isLoggedIn();
    },
    isLikeSongsPage() {
      return this.$route.name === "likedSongs";
    }
  },
  methods: {
    ...mapMutations(["appendTrackToPlayerList"]),
    ...mapActions(["playFirstTrackOnList", "playTrackOnListByID"]),
    playPlaylistByID(trackID = "first") {
      let trackIDs = this.playlist.trackIds.map(t => t.id);
      playAList(trackIDs, this.playlist.id, "playlist", trackID);
    },
    likePlaylist() {
      subscribePlaylist({
        id: this.playlist.id,
        t: this.playlist.subscribed ? 2 : 1
      }).then(data => {
        if (data.code === 200)
          this.playlist.subscribed = !this.playlist.subscribed;
        getPlaylistDetail(this.id, true).then(data => {
          this.playlist = data.playlist;
        });
      });
    },
    loadData(id, next = undefined) {
      this.id = id;
      getPlaylistDetail(this.id, true)
        .then(data => {
          this.playlist = data.playlist;
          this.tracks = data.playlist.tracks;
          NProgress.done();
          if (next !== undefined) next();
          this.show = true;
          this.lastLoadedTrackIndex = data.playlist.tracks.length - 1;
          if (this.playlist.trackCount > this.tracks.length) {
            window.addEventListener("scroll", this.handleScroll, true);
          }
          return data;
        })
        .then(() => {
          if (this.playlist.trackCount > this.tracks.length) {
            this.loadingMore = true;
            this.loadMore();
          }
        });
    },
    loadMore() {
      let trackIDs = this.playlist.trackIds.filter((t, index) => {
        if (
          index > this.lastLoadedTrackIndex &&
          index <= this.lastLoadedTrackIndex + 50
        )
          return t;
      });
      trackIDs = trackIDs.map(t => t.id);
      getTrackDetail(trackIDs.join(",")).then(data => {
        this.tracks.push(...data.songs);
        this.lastLoadedTrackIndex += trackIDs.length;
        this.loadingMore = false;
      });
    },
    handleScroll(e) {
      let dom = document.querySelector("html");
      let scrollHeight = Math.max(dom.scrollHeight, dom.scrollHeight);
      let scrollTop = e.target.scrollingElement.scrollTop;
      let clientHeight =
        dom.innerHeight || Math.min(dom.clientHeight, dom.clientHeight);
      if (clientHeight + scrollTop + 200 >= scrollHeight) {
        if (
          this.lastLoadedTrackIndex + 1 === this.playlist.trackIds.length ||
          this.loadingMore
        )
          return;
        this.loadingMore = true;
        this.loadMore();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.playlist-info {
  display: flex;
  width: 78vw;
  margin-bottom: 72px;
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    margin-left: 56px;
    .title {
      font-size: 36px;
      font-weight: 700;
    }
    .artist {
      font-size: 18px;
      color: rgba(0, 0, 0, 0.88);
      margin-top: 24px;
    }
    .date-and-count {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.68);
      margin-top: 2px;
    }
    .description {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.68);
      margin-top: 24px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      cursor: pointer;
      &:hover {
        transition: color 0.3s;
        color: rgba(0, 0, 0, 0.88);
      }
    }
    .buttons {
      margin-top: 32px;
      display: flex;
      button {
        margin-right: 16px;
      }
    }
  }
}

.shade {
  background: rgba(255, 255, 255, 0.38);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .description-full {
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 12px 16px -8px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(12px);
    padding: 32px;
    border-radius: 12px;
    width: 50vw;
    margin: auto 0;
    font-size: 14px;
    z-index: 100;
    display: flex;
    flex-direction: column;

    .close {
      display: flex;
      justify-content: flex-end;
      font-size: 16px;
      margin-top: 20px;
      color: #335eea;
      cursor: pointer;
    }
  }
}

.user-info {
  h1 {
    font-size: 42px;
    .avatar {
      height: 44px;
      margin-right: 12px;
      vertical-align: -7px;
      border-radius: 50%;
      border: rgba(0, 0, 0, 0.2);
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
