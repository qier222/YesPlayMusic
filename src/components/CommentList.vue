<template>
  <div class="commentListItems">
    <CommentListItem
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
import { getComment } from '@/api/comment';
import CommentListItem from '@/components/CommentListItem.vue';

export default {
  name: 'CommentList',
  components: {
    CommentListItem,
  },
  props: ['sortType', 'type', 'id'],
  data() {
    return {
      pageNo: 1,
      comments: [],
      replyCount: 0,
    };
  },
  computed: {
    ...mapState(['player']),
  },
  mounted() {
    let params = {
      id: this.id,
      type: this.type,
      sortType: this.sortType,
    };
    getComment(params).then(data => {
      if (data.code === 200) {
        this.comments = data.data.comments;
        this.replyCount = data.data.totalCount;
      }
    });
  },
  methods: {
    ...mapActions(['showToast']),
    // sortType为1时无法使用分页的方式获取
    // sortType为2时正常
    // sortType为3时需要加cursor时间
    moreComment() {
      ++this.pageNo;
      let params = [
        {
          id: this.id,
          type: this.type,
          sortType: this.sortType,
          pageSize: 20 * this.pageNo,
        },
        {
          id: this.id,
          type: this.type,
          sortType: this.sortType,
          pageNo: this.pageNo,
          pageSize: 20,
        },
        {
          id: this.id,
          type: this.type,
          sortType: this.sortType,
          pageNo: this.pageNo,
          pageSize: 20,
          cursor: 1602072870260,
        },
      ];
      if (this.pageNo * 20 - 20 >= this.replyCount) {
        this.showToast('没有更多评论');
        return;
      }
      getComment(params[this.sortType - 1]).then(data => {
        if (data.code === 200) {
          if (this.sortType === 1) this.comments = data.data.comments;
          else this.comments = this.comments.concat(data.data.comments);
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.commentListItems {
  margin-top: 30px;
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
</style>
