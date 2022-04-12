<template>
  <div v-show="show" class="shade" @click="clickOutside">
    <div class="modal" :style="modalStyles" @click.stop>
      <div class="header">
        <div class="title">{{ title }}</div>
        <button class="close" @click="close"
          ><svg-icon icon-class="x"
        /></button>
      </div>
      <div class="content"><slot></slot></div>
      <div v-if="showFooter" class="footer">
        <!-- <button>取消</button>
        <button class="primary">确定</button> -->
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: Boolean,
    close: Function,
    title: {
      type: String,
      default: 'Title',
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
    width: {
      type: String,
      default: '50vw',
    },
    clickOutsideHide: {
      type: Boolean,
      default: false,
    },
    minWidth: {
      type: String,
      default: 'calc(min(23rem, 100vw))',
    },
  },
  computed: {
    modalStyles() {
      return {
        width: this.width,
        minWidth: this.minWidth,
      };
    },
  },
  methods: {
    clickOutside() {
      if (this.clickOutsideHide) {
        this.close();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.shade {
  background: rgba(255, 255, 255, 0.58);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 12px 16px -8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(12px) opacity(1);
  padding: 24px 0;
  border-radius: 12px;
  width: 50vw;
  margin: auto 0;
  font-size: 14px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 128px - 64px);

  ::-webkit-scrollbar {
    width: 4px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
    border: unset;
    width: 0;
  }
  ::-webkit-scrollbar-thumb {
    background: var(--color-secondary-bg-for-transparent);
  }
}

@supports (-moz-appearance: none) {
  .modal {
    background: var(--color-body-bg) !important;
  }
}

.content {
  overflow: auto;
  overflow-x: hidden;
  padding: 0 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 24px 24px 24px;
  .title {
    font-weight: 600;
    font-size: 20px;
  }
  button {
    color: var(--color-text);
    border-radius: 50%;
    height: 32px;
    width: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.68;
    transition: 0.2s;
    &:hover {
      opacity: 1;
      background: var(--color-secondary-bg-for-transparent);
    }
  }
  .svg-icon {
    height: 18px;
    width: 18px;
  }
}

.footer {
  padding-top: 16px;
  margin: 16px 24px 24px 24px;
  border-top: 1px solid rgba(128, 128, 128, 0.18);
  display: flex;
  justify-content: flex-end;
  margin-bottom: -8px;
  button {
    color: var(--color-text);
    background: var(--color-secondary-bg-for-transparent);
    border-radius: 8px;
    padding: 6px 16px;
    font-size: 14px;
    margin-left: 12px;
    transition: 0.2s;
    &:active {
      transform: scale(0.94);
    }
  }
  button.primary {
    color: var(--color-primary-bg);
    background: var(--color-primary);
    font-weight: 500;
  }
  button.block {
    width: 100%;
    margin-left: 0;
    &:active {
      transform: scale(0.98);
    }
  }
}

[data-theme='dark'] {
  .shade {
    background: rgba(0, 0, 0, 0.38);
    color: var(--color-text);
  }

  .modal {
    background: rgba(36, 36, 36, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
}
</style>
