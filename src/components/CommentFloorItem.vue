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
        <span class="item-right-info-reply" @click="openAddCommentModal"
          >回复</span
        >
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { likeOrDislikeComment } from '@/api/comment';
import { isAccountLoggedIn } from '@/utils/auth';
import locale from '@/locale';

export default {
  name: 'CommentListItem',
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
  .item-avatar {
    float: left;
    width: 50px;
    border-radius: 50%;
  }

  .item-right {
    margin-left: 70px;
    .item-right-username {
      font-weight: bold;
      color: var(--color-secondary);
      font-size: 14px;
    }

    .item-right-comment {
      margin-top: 2px;
      font-size: 15px;
    }

    .item-right-info {
      color: var(--color-secondary);
      font-size: 13px;
      margin-top: -8px;
      .item-right-info-like {
        margin-left: 30px;
      }
      .active .svg-icon {
        color: var(--color-primary);
      }
      .item-right-info-floor {
        margin-left: 30px;
      }
      .item-right-info-reply {
        margin-left: 30px;
      }
    }
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
