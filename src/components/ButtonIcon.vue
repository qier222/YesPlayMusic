<template>
  <button class="button-icon"><slot></slot></button>
</template>

<script>
export default {
  name: "ButtonIcon",
};
</script>

<style lang="scss" scoped>
button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background: transparent;
  margin: 4px;
  border-radius: 25%;
  transition: 0.2s;
  .svg-icon {
    color: rgba(0, 0, 0, 0.88);
    height: 16px;
    width: 16px;
  }
  &:first-child {
    margin-left: 0;
  }
  &:hover {
    // background: #eaeffd;
    // .svg-icon {
    //   color: #335eea;
    // }
    background: #f5f5f7;
  }
  &:active {
    transform: scale(0.92);
    // background: #eaeffd;
    // .svg-icon {
    //   color: #335eea;
    // }
  }
}
</style>
