<template v-for="comment in comments" :key="comment.commentId">
  <div class="commentListItems">
    <CommentFloorItem
      class="commentListItems"
      v-for="comment in comments"
      :key="comment.commentId"
      :comment="comment"
      :type="type"
      :id="id"
    />
    <div class="more">
      <div class="button" @click="moreComment"> 加载更多 </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { getFloorComment } from '@/api/comment';

import CommentFloorItem from '@/components/CommentFloorItem.vue';

export default {
  name: 'CommentFloor',
  components: {
    CommentFloorItem,
  },
  props: ['parentCommentId', 'replyCount', 'type', 'id'],
  data() {
    return {
      comments: [],
      limit: 5,
    };
  },
  computed: {
    ...mapState(['player']),
  },
  mounted() {
    let params = {
      id: this.id,
      type: this.type,
      parentCommentId: this.parentCommentId,
      limit: 5,
    };
    getFloorComment(params).then(data => {
      if (data.code === 200) {
        this.comments = data.data.comments;
      }
    });
  },
  methods: {
    ...mapActions(['showToast']),
    moreComment() {
      this.limit += 5;
      let params = {
        id: this.id,
        type: this.type,
        parentCommentId: this.parentCommentId,
        limit: this.limit,
      };
      if (this.limit - 5 >= this.replyCount) {
        this.showToast('没有更多评论');
        return;
      }
      getFloorComment(params).then(data => {
        if (data.code === 200) {
          this.comments = data.data.comments;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.commentListItems {
  margin-top: 15px;
}

.button {
  user-select: none;
  cursor: pointer;
  padding: 8px 16px;
  margin: 30px 16px 6px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  border-radius: 10px;
  background-color: var(--color-secondary-bg);
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

.more {
  width: 100%;
  .button {
  }
}
</style>
