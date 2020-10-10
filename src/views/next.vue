<template>
  <div class="next-tracks">
    <h1>Now Playing</h1>
    <div class="track-list">
      <div class="track playing">
        <img :src="currentTrack.album.picUrl | resizeImage" />
        <div class="title-and-artist">
          <div class="container">
            <div class="title">
              {{ currentTrack.name }}
            </div>
            <div class="artist">
              <span v-for="(ar, index) in currentTrack.artists" :key="ar.id">
                <router-link :to="`/artist/${ar.id}`">{{ ar.name }}</router-link
                ><span v-if="index !== currentTrack.artists.length - 1"
                  >,
                </span>
              </span>
            </div>
          </div>
          <div></div>
        </div>
        <div class="album">
          <div class="container">
            <router-link :to="`/album/${currentTrack.album.id}`">{{
              currentTrack.album.name
            }}</router-link>
          </div>
          <div></div>
        </div>
        <div class="time">
          {{ currentTrack.time | formatTime }}
        </div>
      </div>
    </div>
    <h1>Next Up</h1>
    <div class="track-list">
      <div
        class="track"
        v-for="track in tracks"
        :class="{ disable: !track.playable }"
        :title="!track.playable ? track.reason : ''"
        :key="`${track.id}-${track.sort}`"
        @dblclick="playTrackOnListByID(track.id)"
      >
        <img :src="track.album.picUrl | resizeImage" />
        <div class="title-and-artist">
          <div class="container">
            <div class="title">
              {{ track.name }}
            </div>
            <div class="artist">
              <span v-for="(ar, index) in track.artists" :key="ar.id">
                <router-link :to="`/artist/${ar.id}`">{{ ar.name }}</router-link
                ><span v-if="index !== track.artists.length - 1">, </span>
              </span>
            </div>
          </div>
          <div></div>
        </div>
        <div class="album">
          <div class="container">
            <router-link :to="`/album/${track.album.id}`">{{
              track.album.name
            }}</router-link>
          </div>
          <div></div>
        </div>
        <div class="time">
          {{ parseInt((track.time % (1000 * 60 * 60)) / (1000 * 60)) }}:{{
            parseInt((track.time % (1000 * 60)) / 1000)
              .toString()
              .padStart(2, "0")
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "Next",
  computed: {
    ...mapState(["player"]),
    currentTrack() {
      return this.player.currentTrack;
    },
    tracks() {
      function compare(property) {
        return function(obj1, obj2) {
          var value1 = obj1[property];
          var value2 = obj2[property];
          return value1 - value2;
        };
      }
      return this.player.list
        .filter(
          (t) => t.sort > this.player.currentTrack.sort // && t.playable === true
        )
        .sort(compare("sort"));
    },
  },
  methods: {
    ...mapActions(["playTrackOnListByID"]),
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
