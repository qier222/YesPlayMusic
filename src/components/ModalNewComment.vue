<template>
  <Modal
    class="add-comment-modal"
    :show="show"
    :close="close"
    title="发表评论"
    width="25vw"
  >
    <template slot="default">
      <textarea
        v-model="content"
        type="text"
        placeholder="评论内容"
        maxlength="500"
      />
    </template>
    <template slot="footer">
      <button class="primary block" @click="sendComment">发送</button>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/Modal.vue';
import { mapMutations, mapState, mapActions } from 'vuex';
import { sendOrReplyOrDeleteComment } from '@/api/comment';
import locale from '@/locale';

export default {
  name: 'ModalNewComment',
  components: {
    Modal,
  },
  data() {
    return {
      content: '',
    };
  },
  computed: {
    ...mapState(['modals', 'player']),
    show: {
      get() {
        return this.modals.newCommentModal.show;
      },
      set(value) {
        this.updateModal({
          modalName: 'newCommentModal',
          key: 'show',
          value,
        });
        if (value) {
          this.$store.commit('enableScrolling', false);
        } else {
          this.$store.commit('enableScrolling', true);
        }
      },
    },
  },
  methods: {
    ...mapMutations(['updateModal', 'updateData']),
    ...mapActions(['showToast']),
    close() {
      this.show = false;
      this.content = '';
    },
    sendComment() {
      let params = this.$store.state.modals.newCommentModal.params;
      params.content = this.content;
      sendOrReplyOrDeleteComment(params).then(data => {
        if (data.code === 200) {
          this.close();
          this.showToast(locale.t('comment.successSend'));
        } else this.showToast('添加评论失败');
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.add-comment-modal {
  .content {
    display: flex;
    flex-direction: column;
    textarea {
      margin-bottom: 12px;
    }
    textarea[type='text'] {
      height: 10vw;
      width: calc(100% - 24px);
      flex: 1;
      background: var(--color-secondary-bg-for-transparent);
      font-size: 16px;
      border: none;
      font-weight: 600;
      padding: 8px 12px;
      border-radius: 8px;
      margin-top: -1px;
      color: var(--color-text);
      &:focus {
        background: var(--color-primary-bg-for-transparent);
        opacity: 1;
      }
      [data-theme='light'] &:focus {
        color: var(--color-primary);
      }
    }
  }
}
</style>
