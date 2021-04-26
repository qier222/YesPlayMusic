<template>
  <div class="mv">
    <div class="current-video">
      <div class="video">
        <video ref="videoPlayer" class="plyr"></video>
      </div>
      <div class="video-info">
        <div class="title">
          <router-link :to="'/artist/' + mv.data.artistId">{{
            mv.data.artistName
          }}</router-link>
          -
          {{ mv.data.name }}
          <div class="like-button">
            <button-icon @click.native="likeMV">
              <svg-icon v-if="mv.subed" icon-class="heart-solid"></svg-icon>
              <svg-icon v-else icon-class="heart"></svg-icon>
            </button-icon>
          </div>
        </div>
        <div class="info">
          {{ mv.data.playCount | formatPlayCount }} Views ·
          {{ mv.data.publishTime }}
        </div>
      </div>
    </div>
    <div class="more-video">
      <div class="section-title">{{ $t('mv.moreVideo') }}</div>
      <MvRow :mvs="simiMvs" />
    </div>
  </div>
</template>

<script>
import { mvDetail, mvUrl, simiMv, likeAMV } from '@/api/mv';
import { isAccountLoggedIn } from '@/utils/auth';
import NProgress from 'nprogress';
import '@/assets/css/plyr.css';
import Plyr from 'plyr';

import ButtonIcon from '@/components/ButtonIcon.vue';
import MvRow from '@/components/MvRow.vue';
import { mapActions } from 'vuex';

export default {
  name: 'mv',
  components: {
    MvRow,
    ButtonIcon,
  },
  beforeRouteUpdate(to, from, next) {
    this.getData(to.params.id);
    next();
  },
  data() {
    return {
      mv: {
        url: '',
        data: {
          name: '',
          artistName: '',
          playCount: '',
          publishTime: '',
        },
      },
      player: null,
      simiMvs: [],
    };
  },
  mounted() {
    let videoOptions = {
      settings: ['quality'],
      autoplay: false,
      quality: {
        default: 1080,
        options: [1080, 720, 480, 240],
      },
    };
    if (this.$route.query.autoplay === 'true') videoOptions.autoplay = true;
    this.player = new Plyr(this.$refs.videoPlayer, videoOptions);
    this.player.volume = this.$store.state.player.volume;
    this.player.on('playing', () => {
      this.$store.state.player.pause();
    });
    this.getData(this.$route.params.id);
    console.log('网易云你这mv音频码率也太糊了吧🙄');
  },
  methods: {
    ...mapActions(['showToast']),
    getData(id) {
      mvDetail(id).then(data => {
        this.mv = data;
        let requests = data.data.brs.map(br => {
          return mvUrl({ id, r: br.br });
        });
        Promise.all(requests).then(results => {
          let sources = results.map(result => {
            return {
              src: result.data.url.replace(/^http:/, 'https:'),
              type: 'video/mp4',
              size: result.data.r,
            };
          });
          this.player.source = {
            type: 'video',
            title: this.mv.data.name,
            sources: sources,
            poster: this.mv.data.cover.replace(/^http:/, 'https:'),
          };
          NProgress.done();
        });
      });
      simiMv(id).then(data => {
        this.simiMvs = data.mvs;
      });
    },
    likeMV() {
      if (!isAccountLoggedIn()) {
        this.showToast('此操作需要登录网易云账号');
        return;
      }
      likeAMV({
        mvid: this.mv.data.id,
        t: this.mv.subed ? 0 : 1,
      }).then(data => {
        if (data.code === 200) this.mv.subed = !this.mv.subed;
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.video {
  --plyr-color-main: #335eea;
  --plyr-control-radius: 8px;
}

.mv {
  width: 100%;
}
.current-video {
  width: 100%;
}
.video {
  border-radius: 16px;
  background: transparent;
  overflow: hidden;
  max-height: 100vh;
}

.video-info {
  margin-top: 12px;
  color: var(--color-text);
  .title {
    font-size: 24px;
    font-weight: 600;
  }
  .artist {
    font-size: 14px;
    opacity: 0.88;
    margin-top: 2px;
    font-weight: 600;
  }
  .info {
    font-size: 12px;
    opacity: 0.68;
    margin-top: 12px;
  }
}

.more-video {
  margin-top: 48px;
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text);
    opacity: 0.88;
  }
}

.like-button {
  display: inline-block;
  .svg-icon {
    height: 18px;
    width: 18px;
    color: var(--color-primary);
  }
}
</style>
