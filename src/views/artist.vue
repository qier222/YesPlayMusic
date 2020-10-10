<template>
  <div class="artist" v-show="show">
    <div class="artist-info">
      <div class="head">
        <img :src="artist.img1v1Url | resizeImage(1024)" />
      </div>
      <div>
        <div class="name">{{ artist.name }}</div>
        <div class="artist">Artist</div>
        <div class="statistics">
          {{ artist.musicSize }} Songs · {{ artist.albumSize }} Albums ·
          {{ artist.mvSize }} Music Videos
        </div>
        <div class="buttons">
          <ButtonTwoTone @click.native="playPopularSongs()" :iconClass="`play`">
            PLAY
          </ButtonTwoTone>
        </div>
      </div>
    </div>
    <div class="latest-release">
      <div class="section-title">Latest Release</div>
      <div class="release">
        <div class="container">
          <Cover
            :url="latestRelease.picUrl | resizeImage"
            :showPlayButton="true"
            :showBlackShadow="true"
            :type="`album`"
            :id="latestRelease.id"
            :hoverEffect="true"
            :size="128"
            :playButtonSize="36"
            :shadowMargin="8"
            :radius="8"
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
              {{ latestRelease.size }} Songs
            </div>
          </div>
        </div>
        <div></div>
      </div>
    </div>
    <div class="popular-tracks">
      <div class="section-title">Popular Songs</div>
      <TrackList
        :tracks="popularTracks.slice(0, showMorePopTracks ? 24 : 12)"
        :type="'tracklist'"
      />

      <div class="show-more">
        <button @click="showMorePopTracks = !showMorePopTracks">
          <span v-show="!showMorePopTracks">SHOW MORE</span>
          <span v-show="showMorePopTracks">SHOW LESS</span>
        </button>
      </div>
    </div>
    <div class="albums" v-if="albums.length !== 0">
      <div class="section-title">Albums</div>
      <CoverRow
        :type="'album'"
        :items="albums"
        :subText="'releaseYear'"
        :showPlayButton="true"
      />
    </div>
    <div class="eps">
      <div class="section-title">EPs & Singles</div>
      <CoverRow
        :type="'album'"
        :items="eps"
        :subText="'albumType+releaseYear'"
        :showPlayButton="true"
      />
    </div>
  </div>
</template>

<script>
import { mapMutations, mapActions, mapState } from "vuex";
import { getArtist, getArtistAlbum } from "@/api/artist";
import { mapTrackPlayableStatus } from "@/utils/common";
import { playAList } from "@/utils/play";
import NProgress from "nprogress";

import ButtonTwoTone from "@/components/ButtonTwoTone.vue";
import TrackList from "@/components/TrackList.vue";
import CoverRow from "@/components/CoverRow.vue";
import Cover from "@/components/Cover.vue";

export default {
  name: "Artist",
  components: { Cover, ButtonTwoTone, TrackList, CoverRow },
  data() {
    return {
      artist: {
        img1v1Url:
          "https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg",
      },
      popularTracks: [],
      albumsData: [],
      latestRelease: {
        picUrl: "",
        publishTime: 0,
        id: 0,
        name: "",
        type: "",
        size: "",
      },
      showMorePopTracks: false,
      show: false,
    };
  },
  created() {
    this.loadData(this.$route.params.id);
  },
  computed: {
    ...mapState(["player"]),
    albums() {
      return this.albumsData.filter((a) => a.type === "专辑");
    },
    eps() {
      return this.albumsData.filter((a) =>
        ["EP/Single", "EP", "Single"].includes(a.type)
      );
    },
  },
  methods: {
    ...mapMutations([
      "updatePlayerList",
      "appendTrackToPlayerList",
      "shuffleTheList",
    ]),
    ...mapActions(["playFirstTrackOnList", "playTrackOnListByID"]),
    loadData(id, next = undefined) {
      getArtist(id).then((data) => {
        this.artist = data.artist;
        this.popularTracks = data.hotSongs;
        if (next !== undefined) next();
        this.popularTracks = mapTrackPlayableStatus(this.popularTracks);
        NProgress.done();
        this.show = true;
      });
      getArtistAlbum({ id: id, limit: 200 }).then((data) => {
        this.albumsData = data.hotAlbums;
        this.latestRelease = data.hotAlbums[0];
      });
    },
    goToAlbum(id) {
      this.$router.push({
        name: "album",
        params: { id },
      });
    },
    playPopularSongs(trackID = "first") {
      playAList(this.popularTracks, this.artist.id, "artist", trackID);
    },
  },
  beforeRouteUpdate(to, from, next) {
    NProgress.start();
    this.artist.img1v1Url =
      "https://p1.music.126.net/VnZiScyynLG7atLIZ2YPkw==/18686200114669622.jpg";
    this.loadData(to.params.id, next);
  },
};
</script>

<style lang="scss" scoped>
.artist-info {
  display: flex;
  align-items: center;
  margin-bottom: 72px;
  img {
    height: 192px;
    width: 192px;
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
    color: rgba(0, 0, 0, 0.88);
    margin-top: 24px;
  }

  .statistics {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.68);
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
}

.section-title {
  font-weight: 600;
  font-size: 22px;
  color: rgba(0, 0, 0, 0.88);
  margin-bottom: 16px;
  margin-top: 46px;
}

.latest-release {
  .release {
    display: flex;
  }
  .container {
    display: flex;
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
    color: rgba(0, 0, 0, 0.88);
    margin-bottom: 8px;
  }
  .date {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.78);
  }
  .type {
    margin-top: 2px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.68);
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
      color: rgba(0, 0, 0, 0.78);
      font-weight: 600;
      &:hover {
        background: #f5f5f7;
        color: rgba(0, 0, 0, 0.96);
      }
    }
  }
}

.cover-row {
  &:first-child {
    margin-top: 0;
  }
}
.covers {
  display: flex;
  flex-wrap: wrap;
  margin: {
    right: -12px;
    left: -12px;
  }
  .cover {
    margin: 12px 12px 24px 12px;
    .text {
      width: 208px;
      margin-top: 8px;
      .name {
        font-size: 16px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.88);
        line-height: 20px;
      }
      .info {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.68);
        line-height: 18px;
        // margin-top: 4px;
      }
    }
  }
}
</style>
