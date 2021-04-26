<template>
  <span class="artist-in-line">
    {{ computedPrefix }}
    <span v-for="(ar, index) in filteredArtists" :key="ar.id">
      <router-link :to="`/artist/${ar.id}`">{{ ar.name }}</router-link>
      <span v-if="index !== filteredArtists.length - 1">, </span>
    </span>
  </span>
</template>

<script>
export default {
  name: 'ArtistInLine',
  props: {
    artists: {
      type: Array,
      required: true,
    },
    exclude: {
      type: String,
      default: '',
    },
    prefix: {
      type: String,
      default: '',
    },
  },
  computed: {
    filteredArtists() {
      return this.artists.filter(a => a.name !== this.exclude);
    },
    computedPrefix() {
      if (this.filteredArtists.length !== 0) return this.prefix;
      else return '';
    },
  },
};
</script>

<style lang="scss" scoped></style>
