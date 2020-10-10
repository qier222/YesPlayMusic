<template>
  <button :style="{ padding: `8px ${horizontalPadding}px` }" :class="color">
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
  },
};
</script>

<style lang="scss" scoped>
button {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  background-color: rgba(51, 94, 234, 0.1);
  color: #335eea;
  border-radius: 8px;
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
</style>
