<template>
  <div class="daily-recommend-card" @click="goToDailyTracks">
    <img :src="coverUrl" loading="lazy" />
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
import locale from '@/locale';
import { mapMutations, mapState, mapActions } from 'vuex';
import { dailyRecommendTracks } from '@/api/playlist';
import { isAccountLoggedIn } from '@/utils/auth';
import sample from 'lodash/sample';

const defaultCovers = [
  'https://p2.music.126.net/0-Ybpa8FrDfRgKYCTJD8Xg==/109951164796696795.jpg',
  'https://p2.music.126.net/QxJA2mr4hhb9DZyucIOIQw==/109951165422200291.jpg',
  'https://p1.music.126.net/AhYP9TET8l-VSGOpWAKZXw==/109951165134386387.jpg',
];

export default {
  name: 'DailyTracksCard',
  data() {
    return { useAnimation: false };
  },
  computed: {
    ...mapState(['dailyTracks']),
    coverUrl() {
      return `${
        this.dailyTracks[0]?.al.picUrl || sample(defaultCovers)
      }?param=1024y1024`;
    },
  },
  created() {
    if (this.dailyTracks.length === 0) this.loadDailyTracks();
  },
  methods: {
    ...mapActions(['showToast']),
    ...mapMutations(['updateDailyTracks']),
    loadDailyTracks() {
      if (!isAccountLoggedIn()) return;
      dailyRecommendTracks()
        .then(result => {
          this.updateDailyTracks(result.data.dailySongs);
        })
        .catch(() => {});
    },
    goToDailyTracks() {
      this.$router.push({ name: 'dailySongs' });
    },
    playDailyTracks() {
      if (!isAccountLoggedIn()) {
        this.showToast(locale.t('toast.needToLogin'));
        return;
      }
      let trackIDs = this.dailyTracks.map(t => t.id);
      this.$store.state.player.replacePlaylist(
        trackIDs,
        '/daily/songs',
        'url',
        this.dailyTracks[0].id
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.daily-recommend-card {
  border-radius: 1rem;
  height: 198px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  animation: move 38s infinite;
  animation-direction: alternate;
  z-index: -1;
}

.container {
  background: linear-gradient(to left, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.28));
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
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}
</style>
