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
        </div>
        <div class="info">
          {{ mv.data.playCount | formatPlayCount }} Views ·
          {{ mv.data.publishTime }}
        </div>
      </div>
    </div>
    <div class="more-video">
      <div class="section-title">{{ $t("mv.moreVideo") }}</div>
      <MvRow :mvs="simiMvs" />
    </div>
  </div>
</template>

<script>
import NProgress from "nprogress";
import { mvDetail, mvUrl, simiMv } from "@/api/mv";
import Plyr from "plyr";
import "@/assets/css/plyr.css";

import MvRow from "@/components/MvRow.vue";

export default {
  name: "mv",
  components: {
    MvRow,
  },
  data() {
    return {
      mv: {
        url: "",
        data: {
          name: "",
          artistName: "",
          playCount: "",
          publishTime: "",
        },
      },
      player: null,
      simiMvs: [],
    };
  },
  methods: {
    getData(id) {
      mvDetail(id).then((data) => {
        this.mv = data;
        let requests = data.data.brs.map((br) => {
          return mvUrl({ id, r: br.br });
        });
        Promise.all(requests).then((results) => {
          let sources = results.map((result) => {
            return {
              src: result.data.url.replace(/^http:/, "https:"),
              type: "video/mp4",
              size: result.data.r,
            };
          });
          this.player.source = {
            type: "video",
            title: this.mv.data.name,
            sources: sources,
            poster: this.mv.data.cover.replace(/^http:/, "https:"),
          };
          NProgress.done();
        });
      });
      simiMv(id).then((data) => {
        this.simiMvs = data.mvs;
      });
    },
  },
  mounted() {
    let videoOptions = {
      settings: ["quality"],
      autoplay: false,
      quality: {
        default: 1080,
        options: [1080, 720, 480, 240],
      },
    };
    if (this.$route.query.autoplay === "true") videoOptions.autoplay = true;
    this.player = new Plyr(this.$refs.videoPlayer, videoOptions);
    this.player.volume = this.$store.state.player.volume;
    this.player.on("playing", () => {
      this.$store.state.howler.pause();
    });
    this.getData(this.$route.params.id);
    console.log("网易云你这mv音频码率也太糊了吧🙄");
  },
  beforeRouteUpdate(to, from, next) {
    this.getData(to.params.id);
    next();
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
  .title {
    font-size: 24px;
    font-weight: 600;
  }
  .artist {
    font-size: 14px;
    color: var(--color-text-1);
    margin-top: 2px;
    font-weight: 600;
  }
  .info {
    font-size: 12px;
    color: var(--color-text-2);
    margin-top: 12px;
  }
}

.more-video {
  margin-top: 48px;
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-1);
  }
}
</style>
