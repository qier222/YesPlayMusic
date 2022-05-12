<template>
  <div class="comment">
    <h1>{{ title }}{{ $t('player.comment') }}</h1>
    <div class="tab">
      <button class="tab-button button" @click="openAddCommentModal"
        ><svg-icon icon-class="plus" />{{ $t('comment.newComment') }}
      </button>
      <div class="tab-sort" role="group">
        <input
          id="recommend"
          v-model="sortType"
          type="radio"
          name="sort"
          :value="1"
        />
        <label
          class="button"
          :class="{ active: sortType === 1 }"
          for="recommend"
        >
          {{ $t('comment.recommend') }}
        </label>

        <input
          id="hot"
          v-model="sortType"
          type="radio"
          name="sort"
          :value="2"
        />
        <label class="button" :class="{ active: sortType === 2 }" for="hot">
          {{ $t('comment.hot') }}
        </label>

        <input
          id="latest"
          v-model="sortType"
          type="radio"
          name="sort"
          :value="3"
        />
        <label class="button" :class="{ active: sortType === 3 }" for="latest">
          {{ $t('comment.latest') }}
        </label>
      </div>
    </div>
    <!-- 通过更新key来刷新子组件 -->
    <CommentList :key="timer" :sort-type="sortType" :type="type" :id="id" />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { isAccountLoggedIn } from '@/utils/auth';
import locale from '@/locale';

import CommentList from '@/components/CommentList.vue';

export default {
  name: 'Comment',
  components: {
    CommentList,
  },
  data() {
    return {
      sortType: 1,
      timer: '',
      title: '',
    };
  },
  computed: {
    ...mapState(['player']),
  },
  props: ['type', 'id'],
  watch: {
    sortType() {
      this.timer = new Date().getTime();
    },
  },
  methods: {
    ...mapMutations(['updateModal']),
    openAddCommentModal() {
      if (!isAccountLoggedIn()) {
        this.showToast(locale.t('toast.needToLogin'));
        return;
      }
      this.updateModal({
        modalName: 'newCommentModal',
        key: 'params',
        value: {
          t: 1,
          type: this.type,
          id: this.id,
          content: '',
          commentId: '',
        },
      });
      this.updateModal({
        modalName: 'newCommentModal',
        key: 'show',
        value: true,
      });
    },
  },
  mounted() {
    if (typeof this.type === 'undefined') this.$router.go(-1);
    switch (this.type) {
      case 0:
        this.title = '歌曲';
        break;
      case 2:
        this.title = '歌单';
        break;
    }
  },
};
</script>

<style lang="scss" scoped>
button.tab-button {
  float: left;
  height: 40px;
  color: var(--color-text);
  border-radius: 8px;
  padding: 0 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
  opacity: 0.68;
  font-weight: 600;
  background-color: var(--color-secondary-bg);
  .svg-icon {
    width: 14px;
    height: 14px;
    margin-right: 8px;
  }
  &:hover {
    opacity: 1;
    background: var(--color-secondary-bg);
  }
  &:active {
    opacity: 1;
    transform: scale(0.92);
  }
}

h1 {
  font-size: 42px;
  color: var(--color-text);
  display: flex;
  align-items: center;
  .avatar {
    height: 44px;
    margin-right: 12px;
    vertical-align: -7px;
    border-radius: 50%;
    border: rgba(0, 0, 0, 0.2);
  }
}

.tab-sort {
  margin-left: 30px;
  position: relative;
  display: -ms-inline-flexbox;
  display: inline-flex;
  vertical-align: middle;
  background-color: var(--color-secondary-bg);
  border-radius: 10px;
}

input,
label {
  cursor: pointer;
}

input {
  position: absolute;
  clip: rect(0, 0, 0, 0);
}

label {
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  padding: 0.375rem 0.75rem;
}

.button {
  height: 28px;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 12px;
  border-radius: 10px;
  color: var(--color-secondary);
  transition: 0.2s;

  &:hover {
    background-color: var(--color-primary-bg);
    color: var(--color-primary);
  }
}
.button.active {
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}
</style>
