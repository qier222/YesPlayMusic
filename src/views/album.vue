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
        <div class="title"> {{ title }}</div>
        <div class="subtitle" v-if="subtitle !== ''">{{ subtitle }}</div>
        <div class="artist">
          <span v-if="album.artist.id !== 104700">
            <span>{{ album.type | formatAlbumType(album) }} by </span
            ><router-link :to="`/artist/${album.artist.id}`">{{
              album.artist.name
            }}</router-link></span
          >
          <span v-else>Compilation by Various Artists</span>
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
            {{ $t("common.play") }}
          </ButtonTwoTone>
          <ButtonTwoTone
            :iconClass="dynamicDetail.isSub ? 'heart-solid' : 'heart'"
            :iconButton="true"
            :horizontalPadding="0"
            :color="dynamicDetail.isSub ? 'blue' : 'grey'"
            :textColor="dynamicDetail.isSub ? '#335eea' : ''"
            :backgroundColor="
              dynamicDetail.isSub ? 'var(--color-secondary-bg)' : ''
            "
            @click.native="likeAlbum"
          >
          </ButtonTwoTone>
        </div>
      </div>
    </div>
    <TrackList
      :tracks="tracks"
      :type="'album'"
      :id="album.id"
      :albumObject="album"
    />
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
    <div class="more-by" v-if="filteredMoreAlbums.length !== 0">
      <div class="section-title">
        More by
        <router-link :to="`/artist/${album.artist.id}`"
          >{{ album.artist.name }}
        </router-link>
      </div>
      <div>
        <CoverRow
          type="album"
          :items="filteredMoreAlbums"
          subText="albumType+releaseYear"
          :showPlayButton="true"
        />
      </div>
    </div>
    <Modal
      :show="showFullDescription"
      :close="() => (showFullDescription = false)"
      :text="album.description"
    />
  </div>
</template>

<script>
import { mapMutations, mapActions, mapState } from "vuex";
import { getArtistAlbum } from "@/api/artist";
import { getTrackDetail } from "@/api/track";
import { playAlbumByID } from "@/utils/play";
import { getAlbum, albumDynamicDetail, likeAAlbum } from "@/api/album";
import { splitSoundtrackAlbumTitle, splitAlbumTitle } from "@/utils/common";
import NProgress from "nprogress";
import { isAccountLoggedIn } from "@/utils/auth";

import ExplicitSymbol from "@/components/ExplicitSymbol.vue";
import ButtonTwoTone from "@/components/ButtonTwoTone.vue";
import TrackList from "@/components/TrackList.vue";
import CoverRow from "@/components/CoverRow.vue";
import Cover from "@/components/Cover.vue";
import Modal from "@/components/Modal.vue";

export default {
  name: "Album",
  components: {
    Cover,
    ButtonTwoTone,
    TrackList,
    ExplicitSymbol,
    CoverRow,
    Modal,
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
      moreAlbums: [],
      dynamicDetail: {},
      subtitle: "",
      title: "",
    };
  },
  created() {
    this.loadData(this.$route.params.id);
  },
  computed: {
    ...mapState(["player", "data"]),
    albumTime() {
      let time = 0;
      this.tracks.map((t) => (time = time + t.dt));
      return time;
    },
    filteredMoreAlbums() {
      let moreAlbums = this.moreAlbums.filter((a) => a.id !== this.album.id);
      let realAlbums = moreAlbums.filter((a) => a.type === "专辑");
      let eps = moreAlbums.filter(
        (a) => a.type === "EP" || (a.type === "EP/Single" && a.size > 1)
      );
      let restItems = moreAlbums.filter(
        (a) =>
          realAlbums.find((a1) => a1.id === a.id) === undefined &&
          eps.find((a1) => a1.id === a.id) === undefined
      );
      if (realAlbums.length === 0) {
        return [...realAlbums, ...eps, ...restItems].slice(0, 5);
      } else {
        return [...realAlbums, ...restItems].slice(0, 5);
      }
    },
  },
  methods: {
    ...mapMutations(["appendTrackToPlayerList"]),
    ...mapActions(["playFirstTrackOnList", "playTrackOnListByID", "showToast"]),
    playAlbumByID(id, trackID = "first") {
      if (this.tracks.find((t) => t.playable !== false) === undefined) {
        return;
      }
      playAlbumByID(id, trackID);
    },
    likeAlbum() {
      if (!isAccountLoggedIn()) {
        this.showToast("此操作需要登录网易云账号");
        return;
      }
      likeAAlbum({
        id: this.album.id,
        t: this.dynamicDetail.isSub ? 0 : 1,
      }).then((data) => {
        if (data.code === 200)
          this.dynamicDetail.isSub = !this.dynamicDetail.isSub;
      });
    },
    formatTitle() {
      let splitTitle = splitSoundtrackAlbumTitle(this.album.name);
      let splitTitle2 = splitAlbumTitle(splitTitle.title);
      this.title = splitTitle2.title;
      if (splitTitle.subtitle !== "" && splitTitle2.subtitle !== "") {
        this.subtitle = splitTitle.subtitle + " · " + splitTitle2.subtitle;
      } else {
        this.subtitle =
          splitTitle.subtitle === ""
            ? splitTitle2.subtitle
            : splitTitle.subtitle;
      }
    },
    loadData(id) {
      getAlbum(id).then((data) => {
        this.album = data.album;
        this.tracks = data.songs;
        this.formatTitle();
        NProgress.done();
        this.show = true;

        // to get explicit mark
        let trackIDs = this.tracks.map((t) => t.id);
        getTrackDetail(trackIDs.join(",")).then((data) => {
          this.tracks = data.songs;
        });

        // get more album by this artist
        getArtistAlbum({ id: this.album.artist.id, limit: 100 }).then(
          (data) => {
            this.moreAlbums = data.hotAlbums;
          }
        );
      });
      albumDynamicDetail(id).then((data) => {
        this.dynamicDetail = data;
      });
    },
  },
  beforeRouteUpdate(to, from, next) {
    NProgress.start();
    this.loadData(to.params.id);
    next();
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
    color: var(--color-text);
    .title {
      font-size: 56px;
      font-weight: 700;
    }
    .subtitle {
      font-size: 22px;
      font-weight: 600;
    }
    .artist {
      font-size: 18px;
      opacity: 0.88;
      margin-top: 24px;
      a {
        font-weight: 600;
      }
    }
    .date-and-count {
      font-size: 14px;
      opacity: 0.68;
      margin-top: 2px;
    }
    .description {
      user-select: none;
      font-size: 14px;
      opacity: 0.68;
      margin-top: 24px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      cursor: pointer;
      &:hover {
        transition: opacity 0.3s;
        opacity: 0.88;
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

.explicit-symbol {
  opacity: 0.28;
  color: var(--color-text);
  margin-right: 4px;
  .svg-icon {
    margin-bottom: -3px;
  }
}

.extra-info {
  margin-top: 36px;
  margin-bottom: 36px;
  font-size: 12px;
  opacity: 0.48;
  color: var(--color-text);
  div {
    margin-bottom: 4px;
  }
  .album-time {
    opacity: 0.68;
  }
}

.more-by {
  border-top: 1px solid rgba(128, 128, 128, 0.18);

  padding-top: 22px;
  .section-title {
    font-size: 22px;
    font-weight: 600;
    opacity: 0.88;
    color: var(--color-text);
    margin-bottom: 8px;
  }
}
</style>
