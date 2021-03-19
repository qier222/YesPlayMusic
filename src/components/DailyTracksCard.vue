<template>
  <div
    class="daily-recommend-card"
    @click="goToDailyTracks"
    :style="cardStyles"
  >
    <div class="container">
      <div class="title-box">
        <div class="title">
          <span>每</span>
          <span>日</span>
          <span>推</span>
          <span>荐</span>
        </div>
      </div>
    </div>
    <button class="play-button" @click.stop="playDailyTracks">
      <svg-icon icon-class="play" />
    </button>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { dailyRecommendTracks } from "@/api/playlist";

export default {
  name: "DailyTracksCard",
  created() {
    if (this.dailyTracks.length === 0) this.loadDailyTracks();
  },
  computed: {
    ...mapState(["dailyTracks"]),
    cardStyles() {
      return {
        background:
          this.dailyTracks.length !== 0
            ? `no-repeat url("${this.dailyTracks[0].al.picUrl}?param=1024y1024") center/cover`
            : "",
      };
    },
  },
  methods: {
    ...mapMutations(["updateDailyTracks"]),
    loadDailyTracks() {
      dailyRecommendTracks().then((result) => {
        this.updateDailyTracks(result.data.dailySongs);
      });
    },
    goToDailyTracks() {
      this.$router.push({ name: "dailySongs" });
    },
    playDailyTracks() {
      let trackIDs = this.dailyTracks.map((t) => t.id);
      this.$store.state.player.replacePlaylist(
        trackIDs,
        "/daily/songs",
        "url",
        this.dailyTracks[0].id
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.daily-recommend-card {
  border-radius: 1rem;
  animation: move 38s infinite;
  animation-direction: alternate;
  height: 198px;
  cursor: pointer;
  position: relative;
}

.container {
  background: linear-gradient(to left, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.38));
  height: 198px;
  width: 50%;
  display: flex;
  align-items: center;
  border-radius: 0.94rem;
}

.title-box {
  height: 148px;
  width: 148px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 25px;
  user-select: none;
  .title {
    height: 100%;
    width: 100%;
    font-weight: 600;
    font-size: 64px;
    line-height: 48px;
    opacity: 0.96;
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-items: center;
    place-items: center;
  }
}

.play-button {
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  position: absolute;
  right: 1.6rem;
  bottom: 1.4rem;
  background: rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  margin-bottom: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 44px;
  width: 44px;
  transition: 0.2s;
  cursor: default;

  .svg-icon {
    margin-left: 4px;
    height: 16px;
    width: 16px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.44);
  }
  &:active {
    transform: scale(0.94);
  }
}

@keyframes move {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 0% 100%;
  }
}
</style>
