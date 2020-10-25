<template>
  <div class="next-tracks">
    <h1>{{ $t("next.nowPlaying") }}</h1>
    <TrackList
      :tracks="[currentTrack]"
      :type="'playlist'"
      dbclickTrackFunc="none"
    />
    <h1>{{ $t("next.nextUp") }}</h1>

    <TrackList
      :tracks="sortedTracks"
      :type="'playlist'"
      dbclickTrackFunc="playTrackOnListByID"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { getTrackDetail } from "@/api/track";
import TrackList from "@/components/TrackList.vue";

export default {
  name: "Next",
  components: {
    TrackList,
  },
  data() {
    return {
      tracks: [],
    };
  },
  computed: {
    ...mapState(["player"]),
    currentTrack() {
      return this.player.currentTrack;
    },
    playerShuffle() {
      return this.player.shuffle;
    },
    sortedTracks() {
      function compare(property) {
        return function(obj1, obj2) {
          var value1 = obj1[property];
          var value2 = obj2[property];
          return value1 - value2;
        };
      }
      return this.tracks
        .filter(
          (t) => this.player.list.find((t2) => t2.id === t.id) !== undefined
        )
        .filter((t) => t.sort > this.player.currentTrack.sort)
        .sort(compare("sort"));
    },
  },
  watch: {
    currentTrack() {
      this.loadTracks();
    },
    playerShuffle() {
      this.tracks = this.tracks.map((t) => {
        t.sort = this.player.list.find((t2) => t.id === t2.id).sort;
        return t;
      });
    },
  },
  methods: {
    ...mapActions(["playTrackOnListByID"]),
    loadTracks() {
      console.time("loadTracks");
      let loadedTrackIDs = this.tracks.map((t) => t.id);
      let basicTracks = this.player.list
        .filter(
          (t) =>
            t.sort > this.player.currentTrack.sort &&
            t.sort <= this.player.currentTrack.sort + 100
        )
        .filter((t) => loadedTrackIDs.includes(t.id) === false);

      let trackIDs = basicTracks.map((t) => t.id);
      if (trackIDs.length > 0) {
        getTrackDetail(trackIDs.join(",")).then((data) => {
          let newTracks = data.songs.map((t) => {
            t.sort = this.player.list.find((t2) => t2.id == t.id).sort;
            return t;
          });
          this.tracks.push(...newTracks);
        });
      }
      console.timeEnd("loadTracks");
    },
  },
  activated() {
    this.loadTracks();
  },
};
</script>

<style lang="scss" scoped>
.next-tracks {
  width: 78vw;
}
h1 {
  margin-top: 36px;
  margin-bottom: 18px;
  cursor: default;
  color: var(--color-text);
}
</style>
