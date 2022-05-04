<template>
  <svg-icon icon-class="explicit" :style="svgStyle"></svg-icon>
</template>

<script>
import SvgIcon from '@/components/SvgIcon.vue';

export default {
  name: 'ExplicitSymbol',
  components: {
    SvgIcon,
  },
  props: {
    size: {
      type: Number,
      default: 16,
    },
  },
  data() {
    return {
      svgStyle: {},
    };
  },
  created() {
    this.svgStyle = {
      height: this.size + 'px',
      width: this.size + 'px',
      position: 'relative',
      left: '-1px',
    };
  },
};
</script>

<style lang="scss" scoped></style>
