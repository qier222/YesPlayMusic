<template>
  <div class="mv-row">
    <div class="mv" v-for="mv in mvs" :key="mv.id">
      <div class="cover-container">
        <img
          class="cover"
          :src="getUrl(mv)"
          @mouseover="hoverVideoID = mv.id"
          @mouseleave="hoverVideoID = 0"
          @click="goToMv(mv.id)"
        />
        <transition name="fade">
          <img
            class="shadow"
            v-show="hoverVideoID === mv.id"
            :src="getUrl(mv)"
          />
        </transition>
      </div>
      <div class="info">
        <div class="title">
          <router-link :to="'/mv/' + mv.id">{{ mv.name }}</router-link>
        </div>
        <div class="artist">
          <router-link
            v-if="subtitle === 'artist'"
            :to="'/artist/' + mv.artistId"
            >{{ mv.artistName }}</router-link
          >
          <span v-if="subtitle === 'publishTime'">{{ mv.publishTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CoverVideo",
  props: {
    mvs: Array,
    subtitle: {
      type: String,
      default: "artist",
    },
  },
  data() {
    return {
      hoverVideoID: 0,
    };
  },
  methods: {
    goToMv(id) {
      let query = {};
      if (this.$parent.player !== undefined) {
        query = { autoplay: this.$parent.player.playing };
      }
      this.$router.push({ path: "/mv/" + id, query });
    },
    getUrl(mv) {
      if (mv.cover !== undefined) return mv.cover;
      if (mv.imgurl16v9 !== undefined) return mv.imgurl16v9;
      if (mv.coverUrl !== undefined) return mv.coverUrl;
    },
  },
};
</script>

<style lang="scss" scoped>
.mv-row {
  display: flex;
  flex-wrap: wrap;
  margin-left: -12px;
}

.mv {
  margin: 12px 12px 24px 12px;
  width: 204px;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.88);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  .artist {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.68);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
}

.cover-container {
  position: relative;
  .cover {
    position: relative;
    padding: 0;
    background-size: cover;
    transition: 0.3s;
    width: 200px;
    border-radius: 10px;
    cursor: pointer;
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 12px 16px -8px rgba(0, 0, 0, 0.05);
    }
  }

  .shadow {
    position: absolute;
    filter: blur(16px) opacity(0.6);
    z-index: -1;
    width: 200px;
    top: 6px;
    left: 0;
    border-radius: 10px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
