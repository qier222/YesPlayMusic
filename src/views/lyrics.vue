<template>
  <transition name="slide-up">
    <div class="lyrics-page" :class="{ 'no-lyric': noLyric }" :view="view">
      <transition name="slide-fade">
        <div
          class="lyrics-container"
          :class="{ open: view == 'lyrics' }"
          ref="lyricsContainer"
          v-show="!noLyric"
          @scroll="blurEffect($event)"
        >
          <div class="line" id="line-1"></div>
          <div
            class="line"
            :class="{
              highlight: highlightLyricIndex === index,
            }"
            :style="lineStyles"
            v-for="(line, index) in lyricWithTranslation"
            :key="index"
            :id="`line${index}`"
            @click="seek(line.time)"
            ><span v-html="formatLine(line)"></span
          ></div>
        </div>
      </transition>
      <Next :open="view == 'nextup'" ref="nextUpSideBar" />
      <div class="mask"></div>
      <div class="cover-view" :class="{ open: view == 'cover' }" ref="cover">
        <div class="container">
          <div class="cover">
            <div class="cover-container">
              <img :src="imageUrl" />
              <div
                class="shadow"
                :style="{ backgroundImage: `url(${imageUrl})` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div class="info">
        <div class="top-part">
          <div class="track-info">
            <div class="title" :title="currentTrack.name"
              ><router-link
                :to="`/${player.playlistSource.type}/${player.playlistSource.id}`"
                @click.native="toggleLyrics"
                >{{ currentTrack.name }}</router-link
              ></div
            >
            <div class="subtitle"
              ><router-link
                :to="`/artist/${currentTrack.ar[0].id}`"
                @click.native="toggleLyrics"
                >{{ currentTrack.ar[0].name }}</router-link
              >
              -
              <router-link
                :to="`/album/${currentTrack.al.id}`"
                @click.native="toggleLyrics"
                :title="currentTrack.al.name"
                >{{ currentTrack.al.name }}</router-link
              ></div
            >
          </div>
          <div class="buttons">
            <button-icon
              @click.native="playerRef.likeCurrentSong"
              :title="$t('player.like')"
              ><svg-icon
                :icon-class="
                  playerRef.isCurrentTrackLiked ? 'heart-solid' : 'heart'
                "
            /></button-icon>
            <!-- <button-icon @click.native="openMenu" title="Menu"
                  ><svg-icon icon-class="more"
                /></button-icon> -->
          </div>
        </div>
      </div>
      <div class="controls">
        <div class="progress-bar">
          <span>{{ formatTrackTime(progress) || "0:00" }}</span>
          <div class="slider">
            <vue-slider
              v-model="progress"
              :min="0"
              :max="progressMax"
              :interval="1"
              :drag-on-click="true"
              :duration="0"
              :dotSize="12"
              :height="2"
              :tooltipFormatter="formatTrackTime"
              @drag-end="setSeek"
              ref="progress"
            ></vue-slider
          ></div>
          <span>{{ formatTrackTime(progressMax) }}</span>
        </div>
        <div class="media-controls">
          <button-icon
            @click.native="playerRef.repeat"
            :title="
              player.repeatMode === 'one'
                ? $t('player.repeatTrack')
                : $t('player.repeat')
            "
            :class="{ active: player.repeatMode !== 'off' }"
          >
            <svg-icon
              icon-class="repeat"
              v-show="player.repeatMode !== 'one'"
            />
            <svg-icon
              icon-class="repeat-1"
              v-show="player.repeatMode === 'one'"
            />
          </button-icon>
          <div class="middle">
            <button-icon
              @click.native="playerRef.previous"
              :title="$t('player.previous')"
              ><svg-icon icon-class="previous"
            /></button-icon>
            <button-icon
              @click.native="playerRef.play"
              :title="$t(player.playing ? 'player.pause' : 'player.play')"
              ><svg-icon :icon-class="playerRef.playing ? 'pause' : 'play'"
            /></button-icon>
            <button-icon
              @click.native="playerRef.next"
              :title="$t('player.next')"
              ><svg-icon icon-class="next"
            /></button-icon>
          </div>
          <button-icon
            @click.native="playerRef.shuffle"
            :title="$t('player.shuffle')"
            :class="{ active: player.shuffle }"
            ><svg-icon icon-class="shuffle"
          /></button-icon>
        </div>
        <div class="view-controls">
          <button-icon
            @click.native="setView('lyrics')"
            :title="
              view == 'lyrics'
                ? $t('player.closeLyrics')
                : $t('player.openLyrics')
            "
          >
            <svg-icon
              :icon-class="view == 'lyrics' ? 'lyrics-fill' : 'lyrics'"
            />
          </button-icon>
          <button-icon
            @click.native="setView('nextup')"
            :title="
              view == 'nextup'
                ? $t('player.closeNextUp')
                : $t('player.openNextUp')
            "
          >
            <svg-icon icon-class="list" />
          </button-icon>
        </div>
      </div>
      <div class="close-button" @click="toggleLyrics">
        <button><svg-icon icon-class="arrow-down" /></button>
      </div>
    </div>
  </transition>
</template>

<script>
// The lyrics page of Apple Music is so gorgeous, so I copy the design.
// Some of the codes are from https://github.com/sl1673495/vue-netease-music

import { mapState, mapMutations } from "vuex";
import VueSlider from "vue-slider-component";
import { formatTrackTime } from "@/utils/common";
import { getLyric } from "@/api/track";
import { lyricParser } from "@/utils/lyrics";
import ButtonIcon from "@/components/ButtonIcon.vue";
import Next from "@/views/next.vue";

export default {
  name: "Lyrics",
  components: {
    VueSlider,
    ButtonIcon,
    Next,
  },
  data() {
    return {
      lyricsInterval: null,
      lyric: [],
      tlyric: [],
      highlightLyricIndex: -1,
      minimize: true,
      view: "cover",
      layoutBreakpoint: 1000, // this must be the same as the SCSS variable $layoutBreakpoint
    };
  },
  computed: {
    ...mapState(["player"]),
    currentTrack() {
      return this.player.currentTrack;
    },
    imageUrl() {
      return this.player.currentTrack.al.picUrl + "?param=1024y1024";
    },
    progress: {
      get() {
        return this.$parent.$refs.player.progress;
      },
      set(value) {
        this.$parent.$refs.player.setProgress(value);
      },
    },
    progressMax() {
      return this.$parent.$refs.player.progressMax;
    },
    lyricWithTranslation() {
      let ret = [];
      // 空内容的去除
      const lyricFiltered = this.lyric.filter(({ content }) =>
        Boolean(content)
      );
      // content统一转换数组形式
      if (lyricFiltered.length) {
        lyricFiltered.forEach((l) => {
          const { rawTime, time, content } = l;
          const lyricItem = { time, content, contents: [content] };
          const sameTimeTLyric = this.tlyric.find(
            ({ rawTime: tLyricRawTime }) => tLyricRawTime === rawTime
          );
          if (sameTimeTLyric) {
            const { content: tLyricContent } = sameTimeTLyric;
            if (content) {
              lyricItem.contents.push(tLyricContent);
            }
          }
          ret.push(lyricItem);
        });
      } else {
        ret = lyricFiltered.map(({ time, content }) => ({
          time,
          content,
          contents: [content],
        }));
      }
      return ret;
    },
    haveTranslation() {
      return this.tlyric.length > 0;
    },
    lineStyles() {
      return {
        fontSize: this.haveTranslation ? "28px" : "36px",
      };
    },
    playerRef() {
      return this.$parent.$refs.player;
    },
    showLyrics() {
      return this.$store.state.showLyrics;
    },
    noLyric() {
      return this.lyric.length == 0;
    },
  },
  created() {
    this.getLyric();
  },
  destroyed() {
    clearInterval(this.lyricsInterval);
  },
  methods: {
    ...mapMutations(["toggleLyrics"]),
    getLyric() {
      return getLyric(this.currentTrack.id).then((data) => {
        if (!data?.lrc?.lyric) {
          this.lyric = [];
          this.tlyric = [];
          return false;
        } else {
          let { lyric, tlyric } = lyricParser(data);
          this.lyric = lyric;
          this.tlyric = tlyric;
          return true;
        }
      });
    },
    formatTrackTime(value) {
      return formatTrackTime(value);
    },
    setSeek() {
      let value = this.$refs.progress.getValue();
      this.$parent.$refs.player.setProgress(value);
      this.$parent.$refs.player.player.seek(value);
    },
    seek(value) {
      this.$parent.$refs.player.setProgress(value);
      this.$parent.$refs.player.player.seek(value);
    },
    setView(value) {
      if (this.view == value) {
        this.view = "cover";
      } else {
        this.view = value;
      }
    },
    blurEffect(ev) {
      for (let i = 0; i < ev.target.children.length; i++) {
        const el = ev.target.children[i];

        const percentageStandard =
          window.innerWidth <= this.layoutBreakpoint
            ? 44 + 2 * 24
            : window.innerHeight / 2;
        const distanceToCenterPx =
          el.getBoundingClientRect().y +
          el.clientHeight / 2 -
          percentageStandard;
        const distanceToCenterPercentage =
          Math.abs(distanceToCenterPx) /
          (distanceToCenterPx < 0
            ? percentageStandard
            : window.innerHeight - percentageStandard);
        const functionedEffectValue =
          1 - Math.sqrt(1 - Math.pow(distanceToCenterPercentage, 2));
        el.style.setProperty(
          "--func-val",
          isNaN(functionedEffectValue) ? "" : functionedEffectValue.toFixed(2)
        );
      }
    },
    setLyricsInterval() {
      this.lyricsInterval = setInterval(() => {
        const progress = this.player.seek() ?? 0;
        let oldHighlightLyricIndex = this.highlightLyricIndex;
        this.highlightLyricIndex = this.lyric.findIndex((l, index) => {
          const nextLyric = this.lyric[index + 1];
          return (
            progress >= l.time && (nextLyric ? progress < nextLyric.time : true)
          );
        });
        if (oldHighlightLyricIndex !== this.highlightLyricIndex) {
          const el = document.getElementById(`line${this.highlightLyricIndex}`);
          if (el) {
            const duration = 500;
            var start;
            var animationProgress;
            const oldY = el.parentNode.scrollTop;
            const newY =
              window.innerWidth <= this.layoutBreakpoint
                ? el.offsetTop - 44 - 2 * 24
                : el.offsetTop - window.innerHeight / 2 + el.clientHeight / 2;
            const distance = oldY - newY;
            var animation = (timeStamp) => {
              if (!start) {
                start = timeStamp;
              }
              animationProgress = (timeStamp - start) / duration;
              if (animationProgress < 1) {
                el.parentNode.scrollTo(
                  0,
                  oldY -
                    Math.sqrt(
                      2 * animationProgress - Math.pow(animationProgress, 2)
                    ) *
                      distance
                );
                window.requestAnimationFrame(animation);
              } else {
                window.cancelAnimationFrame(animation);
              }
            };

            window.requestAnimationFrame(animation);
          }
        }
      }, 50);
    },
    formatLine(line) {
      const showLyricsTranslation = this.$store.state.settings
        .showLyricsTranslation;
      if (showLyricsTranslation && line.contents[1]) {
        return `<span>${line.contents[0]}<br/>${line.contents[1]}</span>`;
      } else {
        return `<span>${line.contents[0]}</span>`;
      }
    },
  },
  watch: {
    currentTrack() {
      this.getLyric();
    },
    showLyrics(show) {
      if (show) {
        this.setLyricsInterval();
      } else {
        clearInterval(this.lyricsInterval);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$layoutBreakpoint: 1000px;
$animationCurve: cubic-bezier(0.2, 0, 0, 1);
$animationDuration: 0.5s;
$animationDurationFast: 0.4s;

.lyrics-page {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 200;
  background: var(--color-body-bg);
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: calc(44px + 2 * 24px);
  pointer-events: none;
  transition: all $animationDuration $animationCurve;
  @media (max-width: $layoutBreakpoint) {
    [view="nextup"] & {
      background: var(--color-navbar-bg);
      backdrop-filter: blur(16px);
      pointer-events: initial;
    }
  }
}

.cover-view {
  --cover-img-width: 40vw;
  --cover-img-max-width: 55vh;
  position: fixed;
  right: 50vw;
  bottom: 40vh;
  width: 40vw;
  height: 55vh;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all $animationDurationFast $animationCurve;
  @media (max-width: $layoutBreakpoint) {
    --cover-img-width: 44px;
    width: var(--cover-img-width);
    height: var(--cover-img-width);
    right: calc(100vw - 24px - var(--cover-img-width));
    bottom: calc(100vh - 24px - var(--cover-img-width));
  }
  [view="cover"] & {
    height: 55vh;
    right: 30vw;
    bottom: 40vh;
    @media (max-width: $layoutBreakpoint) {
      --cover-img-width: 80vw;
      --cover-img-max-width: 60vh;
      right: 10vw;
      width: 80vw;
      justify-content: center;
    }
  }

  .container {
    .cover {
      position: relative;

      .cover-container {
        position: relative;
      }

      @media (max-width: $layoutBreakpoint) {
        .cover-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }

      img {
        border-radius: 0.25em;
        width: var(--cover-img-width);
        height: var(--cover-img-width);
        max-width: var(--cover-img-max-width);
        max-height: var(--cover-img-max-width);
        user-select: none;
        object-fit: cover;
        transition: all $animationDurationFast $animationCurve;
        [view="cover"] & {
          border-radius: 0.75em;
        }
      }
      .shadow {
        position: absolute;
        top: 12px;
        width: var(--cover-img-width);
        height: var(--cover-img-width);
        max-width: var(--cover-img-max-width);
        max-height: var(--cover-img-max-width);
        filter: blur(16px) opacity(0.6);
        transform: scale(0.92, 0.96);
        z-index: -1;
        background-size: cover;
        border-radius: 0.75em;
        transition: all $animationDurationFast $animationCurve;
        @media (max-width: $layoutBreakpoint) {
          top: 0;
          filter: blur(2px) opacity(0.6);
          border-radius: 0.25em;
        }
        [view="cover"] & {
          top: 12px;
          filter: blur(16px) opacity(0.6);
          border-radius: 0.75em;
        }
      }
    }
  }
}

.info {
  position: fixed;
  display: flex;
  align-items: flex-end;
  color: var(--color-text);
  right: 50vw;
  width: 40vw;
  height: 10vh;
  bottom: calc(30vh - 12px);
  transition: all $animationDurationFast $animationCurve;
  @media (max-width: $layoutBreakpoint) {
    width: calc(100vw - 4 * 24px - 2 * 44px);
    height: 44px;
    right: calc(2 * 24px + 44px);
    bottom: calc(100vh - 24px - 44px);
  }
  [view="cover"] & {
    right: 30vw;
    width: 40vw;
    bottom: calc(30vh - 12px);
    @media (max-width: $layoutBreakpoint) {
      width: 80vw;
      right: 10vw;
    }
  }
  .title {
    margin-top: 0;
    font-size: 1.4rem;
    font-weight: 600;
    opacity: 0.88;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
  }
  .subtitle {
    margin-top: 0;
    font-size: 1rem;
    opacity: 0.58;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
  }

  .top-part {
    flex: 1;
    display: flex;
    justify-content: space-between;
    .buttons {
      display: flex;
      align-items: center;
      button {
        margin: 0 0 0 4px;
      }
      .svg-icon {
        opacity: 0.58;
        height: 18px;
        width: 18px;
      }
    }
  }
}

.controls {
  position: fixed;
  right: 50vw;
  bottom: 0;
  width: 40vw;
  height: 30vh;
  color: var(--color-text);
  transition: all $animationDuration $animationCurve;
  [view="cover"] & {
    right: 30vw;
    width: 40vw;
  }
  @media (max-width: $layoutBreakpoint) {
    right: 10vw !important;
    width: 80vw !important;
    [view="nextup"] & {
      right: 0vw !important;
      width: 80vw !important;
      padding: 0 10vw;
      backdrop-filter: blur(16px);
      background-color: var(--color-navbar-bg);
    }
  }
  .progress-bar {
    margin-top: 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .slider {
      width: 100%;
      flex-grow: grow;
      padding: 0 10px;
    }
    span {
      font-size: 15px;
      opacity: 0.58;
      min-width: 28px;
    }
  }
  .media-controls {
    display: flex;
    justify-content: center;
    margin-top: 18px;
    align-items: center;
    button {
      margin: 0;
    }
    .svg-icon {
      opacity: 0.38;
      height: 14px;
      width: 14px;
    }
    .active .svg-icon {
      opacity: 0.88;
    }
    .middle {
      padding: 0 16px;
      display: flex;
      align-items: center;
      button {
        margin: 0 8px;
      }
      button:nth-child(2) .svg-icon {
        height: 28px;
        width: 28px;
        padding: 2px;
      }
      .svg-icon {
        opacity: 0.88;
        height: 22px;
        width: 22px;
      }
      @media (max-width: $layoutBreakpoint) {
        button:nth-child(2) .svg-icon {
          height: 48px;
          width: 48px;
        }
        .svg-icon {
          height: 36px;
          width: 36px;
        }
      }
    }
  }
  .view-controls {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin-top: 16px;
    .button-icon {
      width: 36px;
      height: 36px;
    }
  }
}

.lyrics-container {
  position: fixed;
  left: 55vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 460px;
  color: var(--color-text);
  overflow-y: auto;
  transform: scale(0.9);
  filter: blur(16px);
  transition: $animationDuration;
  opacity: 0;
  pointer-events: none;
  @media (max-width: $layoutBreakpoint) {
    left: 0;
    right: 0;
  }
  &.open {
    opacity: 1;
    pointer-events: initial;
    transform: initial;
    filter: initial;
  }
  .line {
    --func-val: 1;
    // margin-top: 38px;
    padding: 18px;
    transition: background 0.2s,
      transform $animationDuration cubic-bezier(0.2, 0, 0, 1);
    border-radius: 12px;
    filter: blur(12px);
    filter: blur(calc(var(--func-val) * 12px));
    opacity: calc(1 - var(--func-val));
    transform: scale(0.9) translate(-5%, 0);
    user-select: none;
    &:hover {
      background: var(--color-secondary-bg);
    }
    &#line-1 {
      pointer-events: none;
    }
    &.highlight {
      transform: scale(1) translate(0, 0);
    }
    span {
      opacity: 0.28;
      cursor: default;
    }
  }
  .highlight span {
    opacity: 0.98;
    transition: $animationDuration;
  }
}
::-webkit-scrollbar {
  display: none;
}
.lyrics-container .line:first-child {
  margin-top: 50vh;
}
.lyrics-container .line:last-child {
  margin-bottom: calc(50vh - 128px);
  @media (max-width: $layoutBreakpoint) {
    margin-bottom: calc(100vh - 128px - 2 * 24px - 44px);
  }
}

.next-tracks {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 55vw;
  width: auto;
  max-width: 460px;
  padding: calc(2 * 24px + 44px) 0 30vh 0;
  opacity: 0;
  pointer-events: none;
  border-left-color: transparent;
  transform: scale(0.9);
  filter: blur(16px);
  transition: $animationDuration;
  z-index: unset;
  background-color: transparent;
  backdrop-filter: none;
  @media (max-width: $layoutBreakpoint) {
    left: 0;
    right: 0;
  }
  &.open {
    opacity: 1;
    pointer-events: initial;
    transform: initial;
    filter: initial;
  }
}

@media (max-width: $layoutBreakpoint) {
  .lyrics-container,
  .next-tracks {
    width: calc(100vw - 2 * 16px) !important;
    padding: calc(2 * 24px + 44px) 16px !important;
    max-width: none !important;
  }
}

.close-button {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 300;
  border-radius: 0.75rem;
  height: 44px;
  width: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.28;
  transition: 0.2s;
  -webkit-app-region: no-drag;
  .svg-icon {
    color: var(--color-text);
    padding-top: 5px;
    height: 22px;
    width: 22px;
  }
  &:hover {
    background: var(--color-secondary-bg);
    opacity: 0.88;
  }
}

.view-controls-floating {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 36px 0;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  display: none;
  transition: 0.2s;
  &.hide {
    opacity: 0;
    pointer-events: none;
  }
  @media (max-width: $layoutBreakpoint) {
    & {
      display: flex;
    }
  }
  .button-icon {
    width: 36px;
    height: 36px;
  }
}

.lyrics-page.no-lyric {
  .left-side {
    transition: all $animationDuration $animationCurve;
    transform: translateX(27vh);
    margin-right: 0;
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all $animationDurationFast $animationCurve;
}
.slide-up-enter, .slide-up-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translateY(100%);
}

.slide-fade-enter-active {
  transition: all $animationDuration $animationCurve;
}
.slide-fade-leave-active {
  transition: all $animationDuration $animationCurve;
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(27vh);
  opacity: 0;
}
</style>
