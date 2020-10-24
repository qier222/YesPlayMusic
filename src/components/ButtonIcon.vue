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
  --button-icon: var(--color-text-0);
  --button-icon-hover: var(--color-bg-3);
}

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
    color: var(--button-icon);
    height: 16px;
    width: 16px;
  }
  &:first-child {
    margin-left: 0;
  }
  &:hover {
    background: var(--button-icon-hover);
  }
  &:active {
    transform: scale(0.92);
  }
}
</style>
