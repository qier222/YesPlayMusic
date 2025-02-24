<template>
  <div class="cover-row">
    <div v-for="item in items" :key="item.id" class="item">
      <div class="text">
        <div class="title" :style="{ fontSize: subTextFontSize }">
          <router-link :to="getTitleLink(item)">{{ item.name }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BiliFav',
  components: {},
  props: {
    items: { type: Array, required: true },
    type: { type: String, required: true },
    subText: { type: String, default: 'none' },
    subTextFontSize: { type: String, default: '16px' },
    showPlayCount: { type: Boolean, default: false },
    columnNumber: { type: Number, default: 5 },
    gap: { type: String, default: '44px 24px' },
    playButtonSize: { type: Number, default: 22 },
  },
  computed: {
    rowStyles() {
      return {
        'grid-template-columns': `repeat(${this.columnNumber}, 1fr)`,
        gap: this.gap,
      };
    },
  },
  methods: {
    getTitleLink(item) {
      return `/biliFav/${item.id}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.cover-row {
  display: grid;
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
      word-break: break-all;
    }
    .info {
      font-size: 12px;
      opacity: 0.68;
      line-height: 18px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      word-break: break-word;
    }
  }
}

.item.artist {
  display: flex;
  flex-direction: column;
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
