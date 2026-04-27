<template>
  <div v-show="show" ref="messages">
    <div class="header">
      <button-icon class="back-btn" @click.native="goBack">
        <svg-icon icon-class="arrow-left" />
      </button-icon>
      <img class="avatar" :src="avatarUrl | resizeImage" loading="lazy" />
      <div class="user-info">
        <h2>{{ nickname }}</h2>
      </div>
    </div>

    <div ref="chatContainer" class="chat-container">
      <div
        v-for="msg in messages"
        :key="msg.msgId"
        class="msg-item"
        :class="{ 'msg-mine': msg.fromUser.userId === myUserId }"
      >
        <img
          v-if="msg.fromUser.userId !== myUserId"
          class="msg-avatar"
          :src="msg.fromUser.avatarUrl | resizeImage"
          loading="lazy"
        />
        <div class="msg-bubble">
          <!-- 文字消息 -->
          <div v-if="msg.type === 'text'" class="msg-text">
            {{ msg.msg }}
          </div>
          <!-- 歌曲消息 -->
          <div
            v-else-if="msg.type === 'song'"
            class="msg-song"
            @click="playSong(msg.song)"
          >
            <img
              v-if="msg.song"
              class="song-cover"
              :src="(msg.song.album ? msg.song.album.picUrl : '') | resizeImage"
              loading="lazy"
            />
            <div class="song-info">
              <div class="song-name">{{
                msg.song ? msg.song.name : $t('messages.song')
              }}</div>
              <div class="song-artist">{{
                msg.song && msg.song.artists ? msg.song.artists[0].name : ''
              }}</div>
            </div>
            <svg-icon icon-class="play" class="play-icon" />
          </div>
          <!-- 歌单消息 -->
          <div
            v-else-if="msg.type === 'playlist'"
            class="msg-playlist"
            @click="goPlaylist(msg.playlist)"
          >
            <img
              v-if="msg.playlist"
              class="playlist-cover"
              :src="msg.playlist.coverImgUrl | resizeImage"
              loading="lazy"
            />
            <div class="playlist-info">
              <div class="playlist-name">{{
                msg.playlist ? msg.playlist.name : $t('messages.playlist')
              }}</div>
            </div>
          </div>
          <!-- 专辑消息 -->
          <div
            v-else-if="msg.type === 'album'"
            class="msg-album"
            @click="goAlbum(msg.album)"
          >
            <img
              v-if="msg.album"
              class="album-cover"
              :src="msg.album.picUrl | resizeImage"
              loading="lazy"
            />
            <div class="album-info">
              <div class="album-name">{{
                msg.album ? msg.album.name : $t('messages.album')
              }}</div>
            </div>
          </div>
          <!-- 图片消息 -->
          <div v-else-if="msg.type === 'image'" class="msg-image">
            <img :src="msg.msg" loading="lazy" />
          </div>
          <!-- 其他消息类型 -->
          <div v-else class="msg-text msg-unknown">
            [{{ $t('messages.unsupportedType') }}]
          </div>
          <div class="msg-time">{{ formatTime(msg.time) }}</div>
        </div>
        <img
          v-if="msg.fromUser.userId === myUserId"
          class="msg-avatar"
          :src="myAvatarUrl | resizeImage"
          loading="lazy"
        />
      </div>
      <div v-if="messages.length === 0" class="empty">
        {{ $t('messages.noMessages') }}
      </div>
    </div>

    <div class="input-bar">
      <input
        v-model="inputText"
        type="text"
        :placeholder="$t('messages.inputPlaceholder')"
        @keydown.enter="sendText"
      />
      <button class="send-btn" :disabled="!inputText.trim()" @click="sendText">
        <svg-icon icon-class="play" />
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { isAccountLoggedIn } from '@/utils/auth';
import { getPrivateMsgHistory, sendTextMsg } from '@/api/message';
import NProgress from 'nprogress';
import ButtonIcon from '@/components/ButtonIcon.vue';

export default {
  name: 'Messages',
  components: { ButtonIcon },
  data() {
    return {
      show: false,
      messages: [],
      inputText: '',
      uid: 0,
      nickname: '',
      avatarUrl: '',
      loading: false,
      hasMore: true,
    };
  },
  computed: {
    ...mapState(['data']),
    myUserId() {
      return this.data?.user?.userId;
    },
    myAvatarUrl() {
      return this.data?.user?.avatarUrl || '';
    },
  },
  created() {
    this.uid = Number(this.$route.params.uid);
    this.nickname = this.$route.query.nickname || '';
    this.avatarUrl = this.$route.query.avatarUrl || '';
    setTimeout(() => {
      if (!this.show) NProgress.start();
    }, 1000);
    this.loadMessages();
  },
  activated() {
    this.uid = Number(this.$route.params.uid);
    this.nickname = this.$route.query.nickname || '';
    this.avatarUrl = this.$route.query.avatarUrl || '';
    this.loadMessages();
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'friends' });
    },
    loadMessages() {
      if (!isAccountLoggedIn() || !this.uid) {
        NProgress.done();
        this.show = true;
        return;
      }
      getPrivateMsgHistory({ uid: this.uid, limit: 100 }).then(data => {
        this.messages = (data.msgs || []).reverse();
        NProgress.done();
        this.show = true;
        this.$nextTick(() => this.scrollToBottom());
      });
    },
    sendText() {
      const text = this.inputText.trim();
      if (!text) return;
      sendTextMsg({ user_ids: this.uid, msg: text }).then(data => {
        if (data.code === 200) {
          this.inputText = '';
          // 重新加载消息
          this.loadMessages();
        }
      });
    },
    scrollToBottom() {
      const container = this.$refs.chatContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    playSong(song) {
      if (song && song.id) {
        this.$store.state.player.playByID(song.id);
      }
    },
    goPlaylist(playlist) {
      if (playlist && playlist.id) {
        this.$router.push({ name: 'playlist', params: { id: playlist.id } });
      }
    },
    goAlbum(album) {
      if (album && album.id) {
        this.$router.push({ name: 'album', params: { id: album.id } });
      }
    },
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      if (diff < 60000) return this.$t('friends.justNow');
      if (diff < 86400000) {
        const hours = date.getHours().toString().padStart(2, '0');
        const mins = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${mins}`;
      }
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  .back-btn {
    margin-right: 16px;
    .svg-icon {
      height: 24px;
      width: 24px;
    }
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 14px;
    object-fit: cover;
  }

  .user-info {
    h2 {
      font-size: 24px;
      font-weight: 700;
      color: var(--color-text);
      margin: 0;
    }
  }
}

.chat-container {
  height: calc(100vh - 320px);
  overflow-y: auto;
  padding: 0 8px;
  margin-bottom: 16px;
}

.msg-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;

  &.msg-mine {
    flex-direction: row-reverse;

    .msg-bubble {
      align-items: flex-end;

      .msg-text {
        background: var(--color-primary);
        color: white;
      }

      .msg-time {
        text-align: right;
      }
    }
  }

  .msg-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin: 0 10px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .msg-bubble {
    max-width: 65%;
    display: flex;
    flex-direction: column;

    .msg-text {
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 15px;
      line-height: 1.5;
      background: var(--color-secondary-bg);
      color: var(--color-text);
      word-break: break-word;
    }

    .msg-unknown {
      opacity: 0.5;
      font-style: italic;
    }

    .msg-time {
      font-size: 11px;
      color: var(--color-text);
      opacity: 0.38;
      margin-top: 4px;
      padding: 0 4px;
    }

    .msg-song,
    .msg-playlist,
    .msg-album {
      display: flex;
      align-items: center;
      padding: 10px 14px;
      border-radius: 16px;
      background: var(--color-secondary-bg);
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background: var(--color-primary-bg-for-transparent);
      }

      .song-cover,
      .playlist-cover,
      .album-cover {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        margin-right: 10px;
        object-fit: cover;
      }

      .song-info,
      .playlist-info,
      .album-info {
        flex: 1;
        min-width: 0;

        .song-name,
        .playlist-name,
        .album-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .song-artist {
          font-size: 12px;
          color: var(--color-text);
          opacity: 0.58;
          margin-top: 2px;
        }
      }

      .play-icon {
        width: 20px;
        height: 20px;
        color: var(--color-primary);
        margin-left: 8px;
      }
    }

    .msg-image {
      img {
        max-width: 240px;
        border-radius: 12px;
      }
    }
  }
}

.empty {
  text-align: center;
  padding: 48px 0;
  font-size: 16px;
  color: var(--color-text);
  opacity: 0.48;
}

.input-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 24px;
  background: var(--color-secondary-bg);

  input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 15px;
    color: var(--color-text);
    outline: none;
    padding: 8px 0;
  }

  .send-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-primary);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    .svg-icon {
      width: 16px;
      height: 16px;
      color: white;
      margin-left: 2px;
    }

    &:hover {
      opacity: 0.88;
    }

    &:disabled {
      opacity: 0.4;
      cursor: default;
    }
  }
}
</style>
