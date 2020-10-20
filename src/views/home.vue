<template>
  <div class="home" v-show="show">
    <div class="index-row">
      <div class="title">
        by Apple Music
      </div>
      <CoverRow
        :type="'playlist'"
        :items="byAppleMusic"
        :subText="'appleMusic'"
        :imageSize="1024"
      />
    </div>
    <div class="index-row">
      <div class="title">
        {{ $t("home.recommendPlaylist") }}
        <router-link to="/explore?category=推荐歌单">{{
          $t("home.seeMore")
        }}</router-link>
      </div>
      <CoverRow
        :type="'playlist'"
        :items="recommendPlaylist.items"
        :subText="'copywriter'"
      />
    </div>
    <div class="index-row">
      <div class="title">{{ $t("home.recommendArtist") }}</div>
      <CoverRow type="artist" :items="recommendArtists.items" />
    </div>
    <div class="index-row">
      <div class="title">
        {{ $t("home.newAlbum") }}
        <router-link to="/new-album">{{ $t("home.seeMore") }}</router-link>
      </div>
      <CoverRow type="album" :items="newReleasesAlbum.items" subText="artist" />
    </div>
    <div class="index-row">
      <div class="title">
        {{ $t("home.charts") }}
        <router-link to="/explore?category=排行榜">{{
          $t("home.seeMore")
        }}</router-link>
      </div>
      <CoverRow
        :type="'chart'"
        :items="topList.items"
        :subText="'updateFrequency'"
        :imageSize="1024"
      />
    </div>
  </div>
</template>

<script>
import { toplists, recommendPlaylist } from "@/api/playlist";
import { toplistOfArtists } from "@/api/artist";
import { byAppleMusic } from "@/utils/staticPlaylist";
import { newAlbums } from "@/api/album";
import NProgress from "nprogress";
import CoverRow from "@/components/CoverRow.vue";

export default {
  name: "Home",
  components: { CoverRow },
  data() {
    return {
      show: false,
      recommendPlaylist: { items: [] },
      newReleasesAlbum: { items: [] },
      topList: {
        items: [],
        ids: [19723756, 180106, 60198, 3812895, 60131]
      },
      recommendArtists: {
        items: [],
        indexs: []
      }
    };
  },
  computed: {
    byAppleMusic() {
      return byAppleMusic;
    }
  },
  methods: {
    loadData() {
      if (!this.show) NProgress.start();
      recommendPlaylist({
        limit: 10
      }).then(data => {
        this.recommendPlaylist.items = data.result;
        NProgress.done();
        this.show = true;
      });
      newAlbums({
        area: "EA",
        limit: 10
      }).then(data => {
        this.newReleasesAlbum.items = data.albums;
      });
      toplistOfArtists(2).then(data => {
        let indexs = [];
        while (indexs.length < 5) {
          let tmp = ~~(Math.random() * 100);
          if (!indexs.includes(tmp)) indexs.push(tmp);
        }
        this.recommendArtists.indexs = indexs;
        this.recommendArtists.items = data.list.artists.filter((l, index) =>
          indexs.includes(index)
        );
      });
      toplists().then(data => {
        this.topList.items = data.list.filter(l =>
          this.topList.ids.includes(l.id)
        );
      });
    }
  },
  activated() {
    this.loadData();
  }
};
</script>

<style lang="scss" scoped>
.index-row {
  margin-top: 54px;
}
.playlists {
  display: flex;
  flex-wrap: wrap;
  margin: {
    right: -12px;
    left: -12px;
  }
  .index-playlist {
    margin: 12px 12px 24px 12px;
  }
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: 700;

  a {
    font-size: 13px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.68);
  }
}

.item {
  margin: 12px 12px 24px 12px;
  .text {
    width: 208px;
    margin-top: 8px;
    .name {
      font-size: 16px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.88);
      line-height: 20px;

      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    .info {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.68);
      line-height: 18px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      // margin-top: 4px;
    }
  }
}
</style>
