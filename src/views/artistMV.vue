<template>
  <div v-show="show">
    <h1>
      <img
        class="avatar"
        :src="artist.img1v1Url | resizeImage(1024)"
        loading="lazy"
      />{{ artist.name }}'s Music Videos
    </h1>
    <MvRow :mvs="mvs" subtitle="publishTime" />
    <div class="load-more">
      <ButtonTwoTone v-show="hasMore" color="grey" @click.native="loadMVs">{{
        $t('explore.loadMore')
      }}</ButtonTwoTone>
    </div>
  </div>
</template>

<script>
import { artistMv, getArtist } from '@/api/artist';
import NProgress from 'nprogress';

import ButtonTwoTone from '@/components/ButtonTwoTone.vue';
import MvRow from '@/components/MvRow.vue';

export default {
  name: 'ArtistMV',
  components: {
    MvRow,
    ButtonTwoTone,
  },
  beforeRouteUpdate(to, from, next) {
    this.id = to.params.id;
    this.loadData();
    next();
  },
  data() {
    return {
      id: 0,
      show: false,
      hasMore: true,
      artist: {},
      mvs: [],
    };
  },
  created() {
    this.id = this.$route.params.id;
    this.loadData();
  },
  activated() {
    if (this.$route.params.id !== this.id) {
      this.id = this.$route.params.id;
      this.mvs = [];
      this.artist = {};
      this.show = false;
      this.hasMore = true;
      this.loadData();
    }
  },
  methods: {
    loadData() {
      setTimeout(() => {
        if (!this.show) NProgress.start();
      }, 1000);
      getArtist(this.id).then(data => {
        this.artist = data.artist;
      });
      this.loadMVs();
    },
    loadMVs() {
      artistMv({ id: this.id, limit: 100, offset: this.mvs.length }).then(
        data => {
          this.mvs.push(...data.mvs);
          this.hasMore = data.hasMore;
          NProgress.done();
          this.show = true;
        }
      );
    },
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-size: 42px;
  color: var(--color-text);
  .avatar {
    height: 44px;
    margin-right: 12px;
    vertical-align: -7px;
    border-radius: 50%;
    border: rgba(0, 0, 0, 0.2);
  }
}
.load-more {
  display: flex;
  justify-content: center;
}
</style>
