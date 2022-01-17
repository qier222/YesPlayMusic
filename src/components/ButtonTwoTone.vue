<template>
  <button :style="buttonStyle" :class="color">
    <svg-icon
      v-if="iconClass !== null"
      :icon-class="iconClass"
      :style="{ marginRight: iconButton ? '0px' : '8px' }"
    />
    <div v-if="loading" class="loading-overlay">
      <svg-icon icon-class="loading" />
    </div>
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'ButtonTwoTone',
  props: {
    iconClass: {
      type: String,
      default: null,
    },
    iconButton: {
      type: Boolean,
      default: false,
    },
    horizontalPadding: {
      type: Number,
      default: 16,
    },
    color: {
      type: String,
      default: 'blue',
    },
    backgroundColor: {
      type: String,
      default: '',
    },
    textColor: {
      type: String,
      default: '',
    },
    shape: {
      type: String,
      default: 'square',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    buttonStyle() {
      let styles = {
        borderRadius: this.shape === 'round' ? '50%' : '8px',
        padding: `8px ${this.horizontalPadding}px`,
        // height: "38px",
        width: this.shape === 'round' ? '38px' : 'auto',
        pointerEvents: this.loading ? 'none' : 'auto',
      };
      if (this.backgroundColor !== '')
        styles.backgroundColor = this.backgroundColor;
      if (this.textColor !== '') styles.color = this.textColor;
      return styles;
    },
  },
};
</script>

<style lang="scss" scoped>
button {
  position: relative;
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 18px;
  font-weight: 600;
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
  margin-right: 12px;
  transition: 0.2s;
  user-select: none;
  overflow: hidden;
  .svg-icon {
    width: 16px;
    height: 16px;
  }
  &:hover {
    transform: scale(1.06);
  }
  &:active {
    transform: scale(0.94);
  }
}
button.grey {
  background-color: var(--color-secondary-bg);
  color: var(--color-text);
  opacity: 0.78;
}
button.transparent {
  background-color: transparent;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);

  display: flex;
  align-items: center;
  justify-content: center;

  .svg-icon {
    width: 24px;
    height: 24px;
  }
}
</style>
