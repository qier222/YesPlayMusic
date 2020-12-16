<template>
  <div>
    <div class="shade" @click="close" v-show="show">
      <div class="description-full" @click.stop>
        <span>{{ text }}</span>
        <span class="close" @click="close">
          {{ $t("modal.close") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Modal",
  props: {
    show: Boolean,
    close: Function,
    text: String,
  },
};
</script>

<style lang="scss" scoped>
.shade {
  background: rgba(255, 255, 255, 0.38);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .description-full {
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 12px 16px -8px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(12px) opacity(1);
    padding: 32px;
    border-radius: 12px;
    width: 50vw;
    margin: auto 0;
    font-size: 14px;
    z-index: 100;
    display: flex;
    flex-direction: column;

    .close {
      display: flex;
      justify-content: flex-end;
      font-size: 16px;
      margin-top: 20px;
      color: var(--color-primary);
      cursor: pointer;
    }
  }
}

[data-theme="dark"] {
  .shade {
    background: rgba(0, 0, 0, 0.38);
    color: var(--color-text);
    .description-full {
      background: rgba(46, 46, 46, 0.68);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
  }
}
</style>
