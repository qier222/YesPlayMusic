<template>
  <div class="cover-row">
    <div
      class="item"
      v-for="item in items"
      :key="item.id"
      :class="{ artist: type === 'artist' }"
    >
      <Cover
        :imageUrl="item.img1v1Url || item.picUrl || item.coverImgUrl"
        :type="type"
        :id="item.id"
      />
      <div class="text">
        <div class="info" v-if="showPlayCount">
          <span class="play-count"
            ><svg-icon icon-class="play" />{{
              item.playCount | formatPlayCount
            }}
          </span>
        </div>
        <div class="title">
          <span class="explicit-symbol" v-if="isExplicit(item)"
            ><ExplicitSymbol
          /></span>
          <span class="lock-icon" v-if="isPrivacy(item)">
            <svg-icon icon-class="lock"
          /></span>
          <router-link :to="getTitleLink(item)">{{ item.name }}</router-link>
        </div>
        <div class="info" v-if="type !== 'artist' && subText !== 'none'">
          <span v-html="getSubText(item)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Cover from "@/components/Cover.vue";
import ExplicitSymbol from "@/components/ExplicitSymbol.vue";

export default {
  name: "CoverRow",
  components: {
    Cover,
    ExplicitSymbol,
  },
  props: {
    items: { type: Array, required: true },
    type: { type: String, required: true },
    subText: { type: String, default: "null" },
    showPlayCount: { type: Boolean, default: false },
  },
  methods: {
    getSubText(item) {
      if (this.subText === "copywriter") return item.copywriter;
      if (this.subText === "description") return item.description;
      if (this.subText === "updateFrequency") return item.updateFrequency;
      if (this.subText === "creator") return "by " + item.creator.nickname;
      if (this.subText === "releaseYear")
        return new Date(item.publishTime).getFullYear();
      if (this.subText === "artist") {
        if (item.artist !== undefined)
          return `<a href="/#/artist/${item.artist.id}">${item.artist.name}</a>`;
        if (item.artists !== undefined)
          return `<a href="/#/artist/${item.artists[0].id}">${item.artists[0].name}</a>`;
      }
      if (this.subText === "albumType+releaseYear") {
        let albumType = item.type;
        if (item.type === "EP/Single") {
          albumType = item.size === 1 ? "Single" : "EP";
        } else if (item.type === "Single") {
          albumType = "Single";
        } else if (item.type === "专辑") {
          albumType = "Album";
        }
        return `${albumType} · ${new Date(item.publishTime).getFullYear()}`;
      }
      if (this.subText === "appleMusic") return "by Apple Music";
    },
    isPrivacy(item) {
      return this.type === "playlist" && item.privacy === 10;
    },
    isExplicit(item) {
      return this.type === "album" && item.mark === 1056768;
    },
    getTitleLink(item) {
      let type = this.type === "chart" ? "playlist" : this.type;
      return `/${type}/${item.id}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.cover-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 44px 24px;
}

.item {
  color: var(--color-text);
  .text {
    margin-top: 8px;
    .title {
      font-size: 16px;
      font-weight: 600;
      line-height: 20px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    .info {
      font-size: 12px;
      opacity: 0.68;
      line-height: 18px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
  }
}

.item.artist {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  .cover {
    display: flex;
  }
  .title {
    margin-top: 4px;
  }
}

@media (max-width: 834px) {
  .item .text .title {
    font-size: 14px;
  }
}

.explicit-symbol {
  opacity: 0.28;
  color: var(--color-text);
  float: right;
  .svg-icon {
    margin-bottom: -3px;
  }
}

.lock-icon {
  opacity: 0.28;
  color: var(--color-text);
  margin-right: 4px;
  // float: right;
  .svg-icon {
    height: 12px;
    width: 12px;
  }
}

.play-count {
  font-weight: 600;
  opacity: 0.58;
  color: var(--color-text);
  font-size: 12px;
  .svg-icon {
    margin-right: 3px;
    height: 8px;
    width: 8px;
  }
}
</style>
