<template>
  <div class="playlist">
    <div class="info">
      <div class="title">
        {{ fav.id }}
      </div>
    </div>
    <TrackListBili v-show="show" :id="fav.id" :tracks="tracks" />
  </div>
</template>

<script>
import TrackListBili from '@/components/TrackListBili.vue';
import { getBiliFav } from '@/utils/biliFav';

export default {
  name: 'Bilifav',
  components: {
    TrackListBili,
  },
  data() {
    return {
      show: false,
      fav: {
        id: 0,
      },
      tracks: [],
    };
  },
  created() {
    this.fav.id = Number(this.$route.params.id);
    console.log(this.fav.id);
    this.loadData();
  },
  methods: {
    loadData() {
      // 加载收藏夹tracks
      getBiliFav(this.fav.id).then(res => {
        this.tracks = res;
        this.show = true;
        console.log('tracks', this.tracks);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.playlist {
  margin-top: 32px;
}
.playlist-info {
  display: flex;
  margin-bottom: 72px;
  position: relative;
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    margin-left: 56px;
    .title {
      font-size: 36px;
      font-weight: 700;
      color: var(--color-text);

      .lock-icon {
        opacity: 0.28;
        color: var(--color-text);
        margin-right: 8px;
        .svg-icon {
          height: 26px;
          width: 26px;
        }
      }
    }
    .artist {
      font-size: 18px;
      opacity: 0.88;
      color: var(--color-text);
      margin-top: 24px;
    }
    .date-and-count {
      font-size: 14px;
      opacity: 0.68;
      color: var(--color-text);
      margin-top: 2px;
    }
    .description {
      font-size: 14px;
      opacity: 0.68;
      color: var(--color-text);
      margin-top: 24px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      cursor: pointer;
      &:hover {
        transition: opacity 0.3s;
        opacity: 0.88;
      }
    }
    .buttons {
      margin-top: 32px;
      display: flex;
      button {
        margin-right: 16px;
      }
    }
  }
}

.special-playlist {
  margin-top: 192px;
  margin-bottom: 128px;
  border-radius: 1.25em;
  text-align: center;

  @keyframes letterSpacing4 {
    from {
      letter-spacing: 0px;
    }

    to {
      letter-spacing: 4px;
    }
  }

  @keyframes letterSpacing1 {
    from {
      letter-spacing: 0px;
    }

    to {
      letter-spacing: 1px;
    }
  }

  .title {
    font-size: 84px;
    line-height: 1.05;
    font-weight: 700;
    text-transform: uppercase;

    letter-spacing: 4px;
    animation-duration: 0.8s;
    animation-name: letterSpacing4;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    // background-image: linear-gradient(
    //   225deg,
    //   var(--color-primary),
    //   var(--color-primary)
    // );

    img {
      height: 78px;
      border-radius: 0.125em;
      margin-right: 24px;
    }
  }
  .subtitle {
    font-size: 18px;
    letter-spacing: 1px;
    margin: 28px 0 54px 0;
    animation-duration: 0.8s;
    animation-name: letterSpacing1;
    text-transform: uppercase;
    color: var(--color-text);
  }
  .buttons {
    margin-top: 32px;
    display: flex;
    justify-content: center;
    button {
      margin-right: 16px;
    }
  }
}

.gradient-test {
  background-image: linear-gradient(to left, #92fe9d 0%, #00c9ff 100%);
}

[data-theme='dark'] {
  .gradient-radar {
    background-image: linear-gradient(to left, #92fe9d 0%, #00c9ff 100%);
  }
}

.gradient-radar {
  background-image: linear-gradient(to left, #0ba360 0%, #3cba92 100%);
}

.gradient-blue-purple {
  background-image: linear-gradient(
    45deg,
    #89c4f5 0%,
    #6284ff 42%,
    #ff0000 100%
  );
}

.gradient-sharp-blue {
  background-image: linear-gradient(45deg, #00c6fb 0%, #005bea 100%);
}

.gradient-yellow-pink {
  background-image: linear-gradient(45deg, #f6d365 0%, #fda085 100%);
}

.gradient-pink {
  background-image: linear-gradient(45deg, #ee9ca7 0%, #ffdde1 100%);
}

.gradient-indigo-pink-yellow {
  background-image: linear-gradient(
    43deg,
    #4158d0 0%,
    #c850c0 46%,
    #ffcc70 100%
  );
}

.gradient-light-red-light-blue {
  background-image: linear-gradient(
    225deg,
    hsl(190, 30%, 50%) 0%,
    #081abb 38%,
    #ec3841 58%,
    hsl(13, 99%, 49%) 100%
  );
}

.gradient-fog {
  background: linear-gradient(-180deg, #bcc5ce 0%, #929ead 98%),
    radial-gradient(
      at top left,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
  background-blend-mode: screen;
}

.gradient-red {
  background-image: linear-gradient(213deg, #ff0844 0%, #ffb199 100%);
}

.gradient-sky-blue {
  background-image: linear-gradient(147deg, #48c6ef 0%, #6f86d6 100%);
}

.gradient-dark-blue-midnight-blue {
  background-image: linear-gradient(213deg, #09203f 0%, #537895 100%);
}

.gradient-yellow-red {
  background: linear-gradient(147deg, #fec867 0%, #f72c61 100%);
}

.gradient-yellow {
  background: linear-gradient(147deg, #fceb02 0%, #fec401 100%);
}

.gradient-midnight-blue {
  background-image: linear-gradient(-20deg, #2b5876 0%, #4e4376 100%);
}

.gradient-orange-red {
  background-image: linear-gradient(147deg, #ffe53b 0%, #ff2525 74%);
}

.gradient-moonstone-blue {
  background-image: linear-gradient(
    147deg,
    hsl(200, 34%, 8%) 0%,
    hsl(204, 35%, 38%) 50%,
    hsl(200, 34%, 18%) 100%
  );
}

.gradient-pink-purple-blue {
  background-image: linear-gradient(
    to right,
    #ff3cac 0%,
    #784ba0 50%,
    #2b86c5 100%
  ) !important;
}

.gradient-green {
  background-image: linear-gradient(
    90deg,
    #c6f6d5,
    #68d391,
    #38b2ac
  ) !important;
}

.user-info {
  h1 {
    font-size: 42px;
    position: relative;
    color: var(--color-text);
    .avatar {
      height: 44px;
      margin-right: 12px;
      vertical-align: -7px;
      border-radius: 50%;
      border: rgba(0, 0, 0, 0.2);
    }
  }
}

.search-box {
  display: flex;
  position: absolute;
  right: 20px;
  bottom: -55px;
  justify-content: flex-end;
  -webkit-app-region: no-drag;

  .container {
    display: flex;
    align-items: center;
    height: 32px;
    background: var(--color-secondary-bg-for-transparent);
    border-radius: 8px;
    width: 200px;
  }

  .svg-icon {
    height: 15px;
    width: 15px;
    color: var(--color-text);
    opacity: 0.28;
    margin: {
      left: 8px;
      right: 4px;
    }
  }

  input {
    font-size: 16px;
    border: none;
    background: transparent;
    width: 96%;
    font-weight: 600;
    margin-top: -1px;
    color: var(--color-text);
  }

  .active {
    background: var(--color-primary-bg-for-transparent);
    input,
    .svg-icon {
      opacity: 1;
      color: var(--color-primary);
    }
  }
}

[data-theme='dark'] {
  .search-box {
    .active {
      input,
      .svg-icon {
        color: var(--color-text);
      }
    }
  }
}

.search-box-likepage {
  display: flex;
  position: absolute;
  right: 12vw;
  top: 95px;
  justify-content: flex-end;
  -webkit-app-region: no-drag;

  .input {
    transition: all 0.5s;
  }

  .container {
    display: flex;
    align-items: center;
    height: 32px;
    background: var(--color-secondary-bg-for-transparent);
    border-radius: 8px;
  }

  .svg-icon {
    height: 15px;
    width: 15px;
    color: var(--color-text);
    opacity: 0.28;
    margin: {
      left: 8px;
      right: 8px;
    }
  }

  input {
    font-size: 16px;
    border: none;
    background: transparent;
    width: 96%;
    font-weight: 600;
    margin-top: -1px;
    color: var(--color-text);
  }

  .active {
    background: var(--color-primary-bg-for-transparent);
    input,
    .svg-icon {
      opacity: 1;
      color: var(--color-primary);
    }
  }
}

[data-theme='dark'] {
  .search-box-likepage {
    .active {
      input,
      .svg-icon {
        color: var(--color-text);
      }
    }
  }
}

@media (max-width: 1336px) {
  .search-box-likepage {
    right: 8vw;
  }
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
