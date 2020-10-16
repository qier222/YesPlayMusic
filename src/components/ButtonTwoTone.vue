<template>
  <button :style="buttonStyle" :class="color">
    <svg-icon
      v-if="iconClass !== null"
      :iconClass="iconClass"
      :style="{ marginRight: iconButton ? '0px' : '8px' }"
    />
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: "ButtonTwoTone",
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
      default: "blue",
    },
    shape: {
      type: String,
      default: "square",
    },
  },
  computed: {
    buttonStyle() {
      return {
        borderRadius: this.shape === "round" ? "50%" : "8px",
        padding: `8px ${this.horizontalPadding}px`,
        height: "38px",
        width: this.shape === "round" ? "38px" : "auto",
      };
    },
  },
};
</script>

<style lang="scss" scoped>
button {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  background-color: rgba(51, 94, 234, 0.1);
  color: #335eea;
  margin-right: 12px;
  transition: 0.2s;
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
  background-color: #f5f5f7;
  color: rgba(0, 0, 0, 0.5);
}
button.transparent {
  background-color: transparent;
}
</style>
