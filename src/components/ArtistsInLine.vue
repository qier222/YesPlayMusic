<template>
  <span class="artist-in-line">
    <span v-for="(ar, index) in slicedArtists" :key="ar.id">
      <router-link :to="`/artist/${ar.id}`">{{ ar.name }}</router-link>
      <span v-if="index !== slicedArtists.length - 1">, </span>
    </span>
  </span>
</template>

<script>
export default {
  name: "ArtistInLine",
  props: {
    artists: {
      type: Array,
      required: true,
    },
    showFirstArtist: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    slicedArtists() {
      return this.showFirstArtist
        ? this.artists
        : this.artists.slice(1, this.artists.length);
    },
  },
};
</script>

<style lang="scss" scoped></style>
