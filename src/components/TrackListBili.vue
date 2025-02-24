<template>
  <div class="track-list">
    <div :style="listStyles">
      <TrackListItemBili
        v-for="(track, index) in tracks"
        :key="track.id ? track.id : `${track.id}${index}`"
        :track-no="index + 1"
        :track-prop="track"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import TrackListItemBili from './TrackListItemBili.vue';

export default {
  name: 'TrackListBili',
  components: {
    TrackListItemBili,
  },
  props: {
    id: { type: Number, required: true },
    tracks: { type: Array, required: true },
  },
  data() {
    return {
      showPlayCount: false,
      columnNumber: 5,
      gap: '44px 24px',
      playButtonSize: 22,
      listStyles: {},
      rightClickedTrack: {
        id: 0,
        name: '',
        ar: [{ name: '' }],
        al: { picUrl: '' },
      },
      rightClickedTrackIndex: -1,
    };
  },
  creatted() {
    this.listStyles = {
      display: 'grid',
      gap: '4px',
      gridTemplateColumns: `repeat(${this.columnNumber}, 1fr)`,
    };
  },
  computed: {
    ...mapState(['liked', 'player']),
    rowStyles() {
      return {
        'grid-template-columns': `repeat(${this.columnNumber}, 1fr)`,
        gap: this.gap,
      };
    },
    rightClickedTrackComputed() {
      return this.type === 'cloudDisk'
        ? {
            id: 0,
            name: '',
            ar: [{ name: '' }],
            al: { picUrl: '' },
          }
        : this.rightClickedTrack;
    },
  },
  methods: {
    ...mapMutations(['updateModal']),
    ...mapActions(['nextTrack', 'showToast', 'likeATrack']),
    getTitleLink(item) {
      return `/biliFav/${item.id}`;
    },
    openMenu(e, track, index = -1) {
      this.rightClickedTrack = track;
      this.rightClickedTrackIndex = index;
      this.$refs.menu.openMenu(e);
    },
    closeMenu() {
      this.rightClickedTrack = {
        id: 0,
        name: '',
        ar: [{ name: '' }],
        al: { picUrl: '' },
      };
      this.rightClickedTrackIndex = -1;
    },
    playThisList(trackID) {
      // playPlaylistByBID
      this.player.playPlaylistByBID(this.id, trackID);
    },
  },
};
</script>
