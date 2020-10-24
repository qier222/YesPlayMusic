<template>
  <div class="cover-row">
    <div
      class="item"
      :class="{ artist: type === 'artist' }"
      v-for="item in items"
      :key="item.id"
      :style="{ marginBottom: subText === 'none' ? '32px' : '24px' }"
    >
      <Cover
        class="cover"
        :id="item.id"
        :type="type === 'chart' ? 'playlist' : type"
        :url="getUrl(item) | resizeImage(imageSize)"
        :hoverEffect="true"
        :showBlackShadow="true"
        :showPlayButton="showPlayButton"
        :radius="type === 'artist' ? 100 : 12"
        :size="type === 'artist' ? 192 : 208"
      />

      <div class="text">
        <div class="info" v-if="showPlayCount">
          <span class="play-count"
            ><svg-icon icon-class="play" />{{
              item.playCount | formatPlayCount
            }}
          </span>
        </div>
        <div class="name">
          <span
            class="explicit-symbol"
            v-if="type === 'album' && item.mark === 1056768"
            ><ExplicitSymbol
          /></span>
          <span
            class="lock-icon"
            v-if="type === 'playlist' && item.privacy === 10"
          >
            <svg-icon icon-class="lock"
          /></span>
          <router-link
            :to="`/${type === 'chart' ? 'playlist' : type}/${item.id}`"
            >{{ item.name }}</router-link
          >
        </div>
        <div class="info" v-if="type !== 'artist' && subText !== 'none'">
          <span v-html="getSubText(item)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExplicitSymbol from "@/components/ExplicitSymbol.vue";
import Cover from "@/components/Cover.vue";

export default {
  name: "CoverRow",
  components: {
    Cover,
    ExplicitSymbol,
  },
  props: {
    items: Array,
    type: String,
    subText: {
      type: String,
      default: "none",
    },
    imageSize: {
      type: Number,
      default: 512,
    },
    showPlayButton: {
      type: Boolean,
      default: false,
    },
    showPlayCount: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    getUrl(item) {
      if (item.picUrl !== undefined) return item.picUrl;
      if (item.coverImgUrl !== undefined) return item.coverImgUrl;
      if (item.img1v1Url !== undefined) return item.img1v1Url;
    },
    getSubText(item) {
      if (this.subText === "copywriter") return item.copywriter;
      if (this.subText === "description") return item.description;
      if (this.subText === "updateFrequency") return item.updateFrequency;
      if (this.subText === "creator") return "by " + item.creator.nickname;
      if (this.subText === "releaseYear")
        return new Date(item.publishTime).getFullYear();
      if (this.subText === "artist")
        return `<a href="/#/artist/${item.artist.id}">${item.artist.name}</a>`;
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
  },
};
</script>

<style lang="scss" scoped>
.cover-row {
  --cover-name-color: var(--color-text-1);
  --cover-info-color: var(--color-text-2);
  --explicit-symbol-color: var(--color-text-5);
  --lock-icon-color: var(--color-text-6);
  --play-count-color: var(--color-text-3);
}
.cover-row {
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

.item {
  margin: 12px 12px 24px 12px;
  .text {
    width: 208px;
    margin-top: 8px;
    .name {
      font-size: 16px;
      font-weight: 600;
      color: var(--cover-name-color);
      line-height: 20px;

      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    .info {
      font-size: 12px;
      color: var(--cover-info-color);
      line-height: 18px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      // margin-top: 4px;
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
  .name {
    margin-top: 4px;
  }
}

.explicit-symbol {
  color: var(--color-text-5);
  float: right;
  .svg-icon {
    margin-bottom: -3px;
  }
}

.lock-icon {
  color: var(--lock-icon-color);
  margin-right: 4px;
  // float: right;
  .svg-icon {
    height: 12px;
    width: 12px;
  }
}

.play-count {
  font-weight: 600;
  color: var(--play-count-color);
  font-size: 12px;
  .svg-icon {
    margin-right: 3px;
    height: 8px;
    width: 8px;
  }
}
</style>
