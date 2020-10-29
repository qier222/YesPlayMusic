<template>
  <div class="mv-row">
    <div class="mv" v-for="mv in mvs" :key="getID(mv)">
      <div class="cover-container">
        <img
          class="cover"
          :src="getUrl(mv)"
          @mouseover="hoverVideoID = getID(mv)"
          @mouseleave="hoverVideoID = 0"
          @click="goToMv(getID(mv))"
        />
        <transition name="fade">
          <img
            class="shadow"
            v-show="hoverVideoID === getID(mv)"
            :src="getUrl(mv)"
          />
        </transition>
      </div>
      <div class="info">
        <div class="title">
          <router-link :to="'/mv/' + getID(mv)">{{ getTitle(mv) }}</router-link>
        </div>
        <div class="artist" v-html="getSubtitle(mv)"></div>
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
      if (mv.cover !== undefined) return mv.cover.replace(/^http:/, "https:");
      if (mv.imgurl16v9 !== undefined)
        return mv.imgurl16v9.replace(/^http:/, "https:");
      if (mv.coverUrl !== undefined)
        return mv.coverUrl.replace(/^http:/, "https:");
    },
    getID(mv) {
      if (mv.id !== undefined) return mv.id;
      if (mv.vid !== undefined) return mv.vid;
    },
    getTitle(mv) {
      if (mv.name !== undefined) return mv.name;
      if (mv.title !== undefined) return mv.title;
    },
    getSubtitle(mv) {
      if (this.subtitle === "artist") {
        let artistName = "null";
        let artistID = 0;
        if (mv.artistName !== undefined) {
          artistName = mv.artistName;
          artistID = mv.artistId;
        } else if (mv.creator !== undefined) {
          artistName = mv.creator[0].userName;
          artistID = mv.creator[0].userId;
        }
        return `<a href="/#/artist/${artistID}">${artistName}</a>`;
      } else if (this.subtitle === "publishTime") {
        return mv.publishTime;
      }
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
  color: var(--color-text);

  .title {
    font-size: 16px;
    font-weight: 600;
    opacity: 0.88;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  .artist {
    font-size: 12px;
    opacity: 0.68;
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
