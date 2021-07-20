<template>
  <div v-show="show" class="dj-page">
    <div class="playlist-info">
      <Cover
        :id="rid"
        :image-url="picUrl"
        :show-play-button="true"
        :always-show-shadow="true"
        :click-cover-to-play="true"
        :fixed-size="288"
        type="dj"
        :cover-hover="false"
        :play-button-size="18"
      />
      <div class="info">
        <div class="title">{{ title }}</div>
        <div v-if="subtitle !== ''" class="subtitle">{{ subtitle }}</div>
        <div class="artist">Radio by {{ dj.nickname }}</div>
        <div class="date-and-count">
          <span :title="createTime | formatDate">{{
            new Date(createTime).getFullYear()
          }}</span>
          <span> · {{ programCount }} {{ $t('common.songs') }}</span>
        </div>
        <div class="description" @click="toggleFullDescription">
          {{ description }}
        </div>
        <div class="buttons" style="margin-top: 32px">
          <ButtonTwoTone icon-class="play" @click.native="playThisDj">
            {{ $t('common.play') }}
          </ButtonTwoTone>
        </div>
      </div>
    </div>
    <TrackList
      :id="rid"
      :tracks="programs"
      :type="'dj'"
      :dbclick-track-func="'playDjPrograms'"
    />
    <div class="load-more">
      <ButtonTwoTone
        v-show="hasMore"
        color="grey"
        :loading="loadingMore"
        @click.native="loadMore()"
        >{{ $t('explore.loadMore') }}</ButtonTwoTone
      >
    </div>
    <Modal
      :show="showFullDescription"
      :close="toggleFullDescription"
      :show-footer="false"
      :click-outside-hide="true"
      :title="$t('album.albumDesc')"
    >
      <p class="description-fulltext">
        {{ description }}
      </p>
    </Modal>
  </div>
</template>

<script>
import Cover from '@/components/Cover';
import NProgress from 'nprogress';
import { getDjDetail, getDjPrograms } from '@/api/dj';
import ButtonTwoTone from '@/components/ButtonTwoTone';
import Modal from '@/components/Modal';
import TrackList from '@/components/TrackList';
import { mapState } from 'vuex';

export default {
  name: 'Dj',
  components: {
    TrackList,
    Cover,
    ButtonTwoTone,
    Modal,
  },
  beforeRouteUpdate(to, from, next) {
    this.show = false;
    this.loadData(to.params.id);
    next();
  },
  data() {
    return {
      show: false,
      rid: 0,
      title: '',
      subtitle: '',
      description: '',
      picUrl: '',
      dj: {
        id: 0,
        nickname: '',
      },
      programCount: 0,
      programs: [],
      hasMore: true,
      loadingMore: true,
      showFullDescription: false,
      dynamicDetail: {},
      createTime: 0,
    };
  },
  computed: {
    ...mapState(['player']),
  },
  created() {
    this.loadData(this.$route.params.id);
  },
  methods: {
    playThisDj() {
      let programMap = {};
      let trackIDs = this.programs.map(t => {
        programMap[t.mainTrackId] = t.id;
        return t.mainTrackId;
      });
      this.player.replacePlaylist(trackIDs, programMap, 'dj');
    },
    loadData(rid) {
      setTimeout(() => {
        if (!this.show) NProgress.start();
      }, 1000);
      getDjDetail(rid).then(data => {
        data = data.data;
        this.rid = data.id;
        this.title = data.name;
        this.subtitle = data.rcmdText;
        this.description = data.desc;
        this.dj = data.dj;
        this.picUrl = data.picUrl;
        this.createTime = data.createTime;
        NProgress.done();
        this.show = true;

        this.loadMore(rid);
      });
    },
    loadMore() {
      this.loadingMore = true;
      getDjPrograms(this.$route.params.id, {
        limit: 50,
        offset: this.programs.length,
      }).then(data => {
        this.programCount = data.count;
        this.programs.push(
          ...data.programs.map(p => {
            p.mainSong = {
              ...p.mainSong,
              dt: p.duration,
              playable: true,
            };
            p = {
              ...p,
              al: {
                picUrl: p.coverUrl,
              },
              ar: [
                {
                  name: p.dj.nickname,
                },
              ],
            };
            return p;
          })
        );
        this.hasMore = data.more;
      });
      this.loadingMore = false;
    },
    toggleFullDescription() {
      this.showFullDescription = !this.showFullDescription;
      if (this.showFullDescription) {
        this.$store.commit('enableScrolling', false);
      } else {
        this.$store.commit('enableScrolling', true);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.dj-page {
  margin-top: 32px;
}
.playlist-info {
  display: flex;
  width: 78vw;
  margin-bottom: 72px;
  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    margin-left: 56px;
    color: var(--color-text);
    .title {
      font-size: 56px;
      font-weight: 700;
    }
    .subtitle {
      font-size: 22px;
      font-weight: 600;
    }
    .artist {
      font-size: 18px;
      opacity: 0.88;
      margin-top: 24px;
      a {
        font-weight: 600;
      }
    }
    .date-and-count {
      font-size: 14px;
      opacity: 0.68;
      margin-top: 2px;
    }
    .description {
      user-select: none;
      font-size: 14px;
      opacity: 0.68;
      margin-top: 24px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      cursor: pointer;
      white-space: pre-line;
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
.description-fulltext {
  font-size: 16px;
  margin-top: 24px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-line;
}
.load-more {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
