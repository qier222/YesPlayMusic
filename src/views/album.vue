<template>
  <div class="album" v-show="show">
    <div class="playlist-info">
      <Cover
        :url="album.picUrl | resizeImage(1024)"
        :showPlayButton="true"
        :alwaysShowShadow="true"
        :clickToPlay="true"
        :size="288"
        :type="'album'"
        :id="album.id"
      />
      <div class="info">
        <div class="title">
          {{ album.name }}
        </div>
        <div class="artist">
          <span>{{ album.type | formatAlbumType(album) }} by </span
          ><router-link :to="`/artist/${album.artist.id}`">{{
            album.artist.name
          }}</router-link>
        </div>
        <div class="date-and-count">
          <span class="explicit-symbol" v-if="album.mark === 1056768"
            ><ExplicitSymbol
          /></span>
          <span :title="album.publishTime | formatDate">{{
            new Date(album.publishTime).getFullYear()
          }}</span>
          <span> · {{ album.size }} {{ $t("common.songs") }}</span
          >,
          {{ albumTime | formatTime("Human") }}
        </div>
        <div class="description" @click="showFullDescription = true">
          {{ album.description }}
        </div>
        <div class="buttons" style="margin-top: 32px">
          <ButtonTwoTone
            @click.native="playAlbumByID(album.id)"
            :iconClass="`play`"
          >
            {{ $t("play") }}
          </ButtonTwoTone>
        </div>
      </div>
    </div>
    <TrackList :tracks="tracks" :type="'album'" :id="album.id" />
    <div class="extra-info">
      <div class="album-time"></div>
      <div class="release-date">
        {{ $t("album.released") }}
        {{ album.publishTime | formatDate("MMMM D, YYYY") }}
      </div>
      <div class="copyright" v-if="album.company !== null">
        © {{ album.company }}
      </div>
    </div>
    <transition name="fade">
      <div
        class="shade"
        @click="showFullDescription = false"
        v-show="showFullDescription"
      >
        <div class="description-full" @click.stop>
          <span>{{ album.description }}</span>
          <span class="close" @click="showFullDescription = false">
            {{ $t("modal.close") }}
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapMutations, mapActions, mapState } from "vuex";
import NProgress from "nprogress";
import { getTrackDetail } from "@/api/track";
import { playAlbumByID } from "@/utils/play";
import { getAlbum } from "@/api/album";

import ExplicitSymbol from "@/components/ExplicitSymbol.vue";
import ButtonTwoTone from "@/components/ButtonTwoTone.vue";
import TrackList from "@/components/TrackList.vue";
import Cover from "@/components/Cover.vue";

export default {
  name: "Album",
  components: {
    Cover,
    ButtonTwoTone,
    TrackList,
    ExplicitSymbol,
  },
  data() {
    return {
      album: {
        id: 0,
        picUrl: "",
        artist: {
          id: 0,
        },
      },
      tracks: [],
      showFullDescription: false,
      show: false,
    };
  },
  created() {
    getAlbum(this.$route.params.id)
      .then((data) => {
        this.album = data.album;
        this.tracks = data.songs;
        NProgress.done();
        this.show = true;
        return this.tracks;
      })
      .then((tracks) => {
        // to get explicit mark
        let trackIDs = tracks.map((t) => t.id);
        getTrackDetail(trackIDs.join(",")).then((data) => {
          this.tracks = data.songs;
        });
      });
  },
  computed: {
    ...mapState(["player"]),
    albumTime() {
      let time = 0;
      this.tracks.map((t) => (time = time + t.dt));
      return time;
    },
  },
  methods: {
    ...mapMutations(["appendTrackToPlayerList"]),
    ...mapActions(["playFirstTrackOnList", "playTrackOnListByID"]),
    playAlbumByID(id, trackID = "first") {
      if (this.tracks.find((t) => t.playable !== false) === undefined) {
        return;
      }
      playAlbumByID(id, trackID);
    },
  },
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
      font-size: 56px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      color: var(--color-text-0);
    }
    .artist {
      font-size: 18px;
      color: var(--color-text-1);
      margin-top: 24px;
      a {
        font-weight: 600;
      }
    }
    .date-and-count {
      font-size: 14px;
      color: var(--color-text-2);
      margin-top: 2px;
    }
    .description {
      user-select: none;
      font-size: 14px;
      color: var(--color-text-2);
      margin-top: 24px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      cursor: pointer;
      &:hover {
        transition: color 0.3s;
        color: var(--color-text-1);
      }
    }
  }
}

.shade {
  background: var(--color-bg-2);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .description-full {
    background: var(--color-bg-1);
    box-shadow: 0 12px 16px -8px var(--color-shadow-1);
    border: 1px solid var(--color-border);
    backdrop-filter: blur(12px);
    padding: 32px;
    border-radius: 12px;
    width: 50vw;
    margin: auto 0;
    font-size: 14px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    color: var(--color-text-2);

    .close {
      display: flex;
      justify-content: flex-end;
      font-size: 16px;
      margin-top: 20px;
      color: var(--color-primary);
      cursor: pointer;
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

.explicit-symbol {
  color: var(--color-text-5);
  margin-right: 4px;
  .svg-icon {
    margin-bottom: -3px;
  }
}

.extra-info {
  margin-top: 36px;
  font-size: 14px;
  color: var(--color-text-4);
  div {
    margin-bottom: 8px;
  }
  .album-time {
    color: var(--color-text-2);
  }
}
</style>
