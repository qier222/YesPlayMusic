<template>
  <div class="explore">
    <h1>Explore</h1>
    <div class="buttons">
      <div
        class="button"
        v-for="cat in settings.playlistCategories"
        :key="cat.name"
        :class="{ active: cat.name === activeCategory }"
        @click="goToCategory(cat.name)"
      >
        {{ cat.name }}
      </div>
      <div class="button more">
        <svg-icon icon-class="more"></svg-icon>
      </div>
    </div>

    <div class="playlists">
      <CoverRow
        type="playlist"
        :items="playlists"
        :subText="subText"
        :showPlayButton="true"
        :showPlayCount="activeCategory !== '排行榜' ? true : false"
        :imageSize="activeCategory !== '排行榜' ? 512 : 1024"
      />
    </div>
    <div
      class="load-more"
      v-show="['推荐歌单', '排行榜'].includes(activeCategory) === false"
    >
      <ButtonTwoTone
        v-show="showLoadMoreButton && hasMore"
        @click.native="getPlaylist"
        color="grey"
        :loading="loadingMore"
        >Load More</ButtonTwoTone
      >
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import NProgress from "nprogress";
import {
  topPlaylist,
  highQualityPlaylist,
  recommendPlaylist,
  toplists,
} from "@/api/playlist";

import ButtonTwoTone from "@/components/ButtonTwoTone.vue";
import CoverRow from "@/components/CoverRow.vue";
import SvgIcon from "@/components/SvgIcon.vue";

export default {
  name: "Explore",
  components: {
    CoverRow,
    ButtonTwoTone,
    SvgIcon,
  },
  data() {
    return {
      playlists: [],
      activeCategory: "全部",
      loadingMore: false,
      showLoadMoreButton: false,
      hasMore: true,
    };
  },
  computed: {
    ...mapState(["settings"]),
    subText() {
      if (this.activeCategory === "排行榜") return "updateFrequency";
      if (this.activeCategory === "推荐歌单") return "copywriter";
      return "none";
    },
  },
  methods: {
    loadData() {
      this.activeCategory =
        this.$route.query.category === undefined
          ? "全部"
          : this.$route.query.category;
      this.getPlaylist();
    },
    goToCategory(Category) {
      this.$router.push({ path: "/explore?category=" + Category });
    },
    updatePlaylist(playlists) {
      this.playlists.push(...playlists);
      this.loadingMore = false;
      this.showLoadMoreButton = true;
      NProgress.done();
    },
    getPlaylist() {
      this.loadingMore = true;
      if (this.activeCategory === "推荐歌单") {
        recommendPlaylist({ limit: 100 }).then((data) => {
          this.updatePlaylist(data.result);
        });
      } else if (this.activeCategory === "精品歌单") {
        let playlists = this.playlists;
        let before =
          playlists.length !== 0
            ? playlists[playlists.length - 1].updateTime
            : 0;
        highQualityPlaylist({ limit: 50, before }).then((data) => {
          this.updatePlaylist(data.playlists);
          this.hasMore = data.more;
        });
      } else if (this.activeCategory === "排行榜") {
        toplists().then((data) => {
          this.updatePlaylist(data.list);
        });
      } else {
        topPlaylist({
          cat: this.activeCategory,
          offset: this.playlists.length,
        }).then((data) => {
          this.updatePlaylist(data.playlists);
          this.hasMore = data.more;
        });
      }
    },
  },
  activated() {
    this.loadData();
  },
  beforeRouteUpdate(to, from, next) {
    NProgress.start();
    this.showLoadMoreButton = false;
    this.hasMore = true;
    this.playlists = [];
    this.offset = 1;
    this.activeCategory = to.query.category;
    this.getPlaylist();
    next();
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-size: 56px;
}
.buttons {
  display: flex;
  flex-wrap: wrap;
}
.button {
  user-select: none;
  cursor: pointer;
  padding: 8px 16px;
  margin: 10px 16px 6px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  border-radius: 10px;
  color: rgb(0, 0, 0);
  background-color: #f5f5f7;
  color: rgba(0, 0, 0, 0.68);
  transition: 0.2s;

  &:hover {
    background-color: rgba(51, 94, 234, 0.1);
    color: #335eea;
  }
}
.button.active {
  background-color: rgba(51, 94, 234, 0.1);
  color: #335eea;
}

.playlists {
  margin-top: 24px;
}

.load-more {
  display: flex;
  justify-content: center;
}

.button.more {
  .svg-icon {
    height: 24px;
    width: 24px;
  }
}
</style>
