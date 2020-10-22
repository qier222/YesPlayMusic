<template>
  <div class="context-menu">
    <div
      class="menu"
      tabindex="-1"
      ref="menu"
      v-if="showMenu"
      @blur="closeMenu"
      :style="{ top: top, left: left }"
      @click="closeMenu"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "ContextMenu",
  data() {
    return {
      showMenu: false,
      top: "0px",
      left: "0px",
    };
  },
  methods: {
    setMenu(top, left) {
      let largestHeight =
        window.innerHeight - this.$refs.menu.offsetHeight - 25;
      let largestWidth = window.innerWidth - this.$refs.menu.offsetWidth - 25;
      if (top > largestHeight) top = largestHeight;
      if (left > largestWidth) left = largestWidth;
      this.top = top + "px";
      this.left = left + "px";
    },

    closeMenu() {
      this.showMenu = false;
    },

    openMenu(e) {
      this.showMenu = true;
      this.$nextTick(
        function () {
          this.$refs.menu.focus();
          this.setMenu(e.y, e.x);
        }.bind(this)
      );
      e.preventDefault();
    },
  },
};
</script>

<style lang="scss" scoped>
.context-menu {
  width: 100%;
  height: 100%;
}

.menu {
  position: fixed;
  min-width: 136px;
  list-style: none;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(12px);
  border-radius: 8px;
  box-sizing: border-box;
  padding: 6px;
  z-index: 1000;

  &:focus {
    outline: none;
  }
}

.menu .item {
  font-weight: 600;
  font-size: 14px;
  padding: 10px 14px;
  border-radius: 7px;
  cursor: default;
  &:hover {
    background: #eaeffd;
    color: #335eea;
  }
}
</style>
