<template>
  <footer>
    <ButtonTwoTone :iconClass="'settings'" :color="'grey'">
      {{ $t("footer.settings") }}
    </ButtonTwoTone>
  </footer>
</template>

<script>
import ButtonTwoTone from "@/components/ButtonTwoTone.vue";

export default {
  name: "Footer",
  components: {
    ButtonTwoTone,
  },
};
</script>

<style lang="scss" scoped>
footer {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}
</style>
