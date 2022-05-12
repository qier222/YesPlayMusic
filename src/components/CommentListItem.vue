<template>
  <div class="item">
    <img class="item-avatar" :src="comment.user.avatarUrl" />
    <div class="item-right">
      <div class="item-right-username">{{ comment.user.nickname }}</div>
      <div class="item-right-comment">{{ comment.content }}</div>
      <div class="item-right-info">
        <span>{{ comment.timeStr }}</span>
        <span class="item-right-info-like">
          <button
            :title="$t('comment.like')"
            :class="{
              active: comment.liked,
            }"
            @click="likeOrDislikeComment"
          >
            <svg-icon icon-class="like" />
          </button>
          {{ comment.likedCount }}
        </span>
        <span
          v-show="comment.replyCount > 0"
          class="item-right-info-floor btn"
          @click="getFloorComment"
        >
          查看{{ comment.replyCount }}条回复
        </span>
        <span class="item-right-info-reply btn" @click="openAddCommentModal"
          >回复</span
        >
      </div>
      <CommentFloor
        v-show="showFloor"
        :parentCommentId="comment.commentId"
        :replyCount="comment.replyCount"
        :type="type"
        :id="id"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import { likeOrDislikeComment } from '@/api/comment';
import { isAccountLoggedIn } from '@/utils/auth';
import locale from '@/locale';

import CommentFloor from '@/components/CommentFloor';

export default {
  name: 'CommentListItem',
  components: {
    CommentFloor,
  },
  props: ['comment', 'type', 'id'],
  data() {
    return {
      showFloor: false,
    };
  },
  computed: {
    ...mapState(['player']),
  },
  methods: {
    ...mapActions(['showToast']),
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
          t: 2,
          type: this.type,
          id: this.id,
          content: '',
          commentId: this.comment.commentId,
        },
      });
      this.updateModal({
        modalName: 'newCommentModal',
        key: 'show',
        value: true,
      });
    },
    // 点赞/取消赞操作有延迟
    likeOrDislikeComment() {
      if (!isAccountLoggedIn()) {
        this.showToast(locale.t('toast.needToLogin'));
        return;
      }
      let params = {
        id: this.id,
        cid: this.comment.commentId,
        t: this.comment.liked === false ? 1 : 0,
        type: this.type,
      };
      likeOrDislikeComment(params).then(data => {
        if (data.code === 200) {
          this.showToast(locale.t('comment.successLike'));
        }
      });
    },
    getFloorComment() {
      this.showFloor = !this.showFloor;
    },
  },
};
</script>

<style lang="scss" scoped>
.item {
  float: left;
  width: 100%;
  margin-bottom: 30px;
  .item-avatar {
    float: left;
    width: 80px;
    border-radius: 50%;
  }

  .item-right {
    margin-left: 100px;
    .item-right-username {
      font-weight: bold;
      color: #61666d;
      font-size: 15px;
    }

    .item-right-comment {
      margin-top: 10px;
      font-size: 16px;
    }

    .item-right-info {
      color: #9499a0;
      font-size: 14px;
      .item-right-info-like {
        margin-left: 30px;
      }
      .active .svg-icon {
        color: var(--color-primary);
      }
      .item-right-info-floor {
        margin-left: 30px;
        cursor: pointer;
      }
      .item-right-info-reply {
        margin-left: 30px;
        cursor: pointer;
      }
    }
  }
}

.btn {
  color: var(--color-text);
  border-radius: 8px;
  padding: 8px;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
  opacity: 0.68;
  font-weight: 500;
  &:hover {
    opacity: 1;
    background: var(--color-secondary-bg);
  }
  &:active {
    opacity: 1;
    transform: scale(0.92);
  }
}

button {
  justify-content: center;
  align-items: center;
  padding: 8px;
  background: transparent;
  border-radius: 25%;
  transition: 0.2s;
  .svg-icon {
    color: var(--color-text);
    height: 16px;
    width: 16px;
  }
  &:first-child {
    margin-left: 0;
  }
  &:hover {
    background: var(--color-secondary-bg-for-transparent);
  }
  &:active {
    transform: scale(0.92);
  }
}
</style>
