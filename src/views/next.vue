<template>
  <div class="next-tracks">
    <h1>Now Playing</h1>
    <TrackList
      :tracks="[currentTrack]"
      :type="'playlist'"
      dbclickTrackFunc="none"
    />
    <h1>Next Up</h1>

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
      showTracks: [],
    };
  },
  computed: {
    ...mapState(["player"]),
    currentTrack() {
      return this.player.currentTrack;
    },
    sortedTracks() {
      function compare(property) {
        return function(obj1, obj2) {
          var value1 = obj1[property];
          var value2 = obj2[property];
          return value1 - value2;
        };
      }
      let tracks = this.tracks
        .filter((t) => t.sort > this.player.currentTrack.sort)
        .sort(compare("sort"));
      return tracks;
    },
  },
  watch: {
    currentTrack() {
      this.loadTracks();
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
}

.track-list {
  user-select: none;
  .track {
    display: flex;
    align-items: center;

    padding: 8px;
    border-radius: 12px;
    img {
      border-radius: 8px;
      height: 56px;
      margin-right: 20px;
    }
    .title-and-artist {
      flex: 1;
      display: flex;
      .container {
        display: flex;
        flex-direction: column;
      }
      .title {
        font-size: 18px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.88);
        cursor: default;
      }
      .artist {
        margin-top: 2px;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.68);
        a {
          span {
            margin-right: 3px;
            color: rgba(0, 0, 0, 0.8);
          }
          &:hover {
            text-decoration: underline;
            cursor: pointer;
          }
        }
      }
    }
    .album {
      flex: 1;
      display: flex;
      .container {
        display: flex;
        flex-direction: column;
        &:hover {
          text-decoration: underline;
          cursor: pointer;
        }
      }
      font-size: 16px;
      color: rgba(0, 0, 0, 0.88);
    }
    .time {
      font-size: 16px;
      width: 50px;
      cursor: default;
      display: flex;
      justify-content: flex-end;
      margin-right: 10px;
      font-variant-numeric: tabular-nums;
    }
    &:hover {
      transition: all 0.3s;
      background: #f5f5f7;
    }
  }
  .track.playing {
    background: #eaeffd;
    .title,
    .time,
    .album {
      color: #335eea;
    }
    .artist {
      color: rgba(51, 94, 234, 0.88);
    }
  }
  .track.disable {
    img {
      filter: grayscale(1) opacity(0.6);
    }
    .title,
    .artist,
    .time,
    .album {
      color: rgba(0, 0, 0, 0.28);
    }
    &:hover {
      background: none;
    }
  }
}
</style>
