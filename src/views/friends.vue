<template>
  <div class="friends-shell">
    <div class="friends-mask" @click="closeSidebar"></div>

    <aside class="friends-sidebar" :class="{ 'chat-open': !!activeContact }">
      <header class="sidebar-header">
        <h2>{{ $t('friends.title') }}</h2>
        <button class="sidebar-close" @click="closeSidebar">
          <svg-icon icon-class="x" />
        </button>
      </header>

      <div class="sidebar-body">
        <section class="list-pane">
          <div v-show="!activeContact" class="section-tabs">
            <button
              class="tab"
              :class="{ active: currentTab === 'contacts' }"
              @click="switchTab('contacts')"
            >
              {{ $t('friends.recentContacts') }}
            </button>
            <button
              class="tab"
              :class="{ active: currentTab === 'follows' }"
              @click="switchTab('follows')"
            >
              {{ $t('friends.following') }}
            </button>
            <button
              class="tab"
              :class="{ active: currentTab === 'followeds' }"
              @click="switchTab('followeds')"
            >
              {{ $t('friends.followers') }}
            </button>
          </div>

          <div class="friends-list">
            <div
              v-for="user in currentUsers"
              :key="user.userId"
              class="friend-item"
              :class="{ active: isActiveContact(user.userId) }"
              @click="openChat(user.userId, user.nickname, user.avatarUrl)"
            >
              <img
                class="avatar"
                :src="user.avatarUrl | resizeImage"
                loading="lazy"
              />
              <div class="info">
                <div class="name">{{ user.nickname }}</div>
                <div v-if="currentTab === 'contacts'" class="last-msg">
                  {{ user.lastMsg || '' }}
                </div>
                <div v-else class="signature">{{ user.signature || '' }}</div>
              </div>
              <div v-if="currentTab === 'contacts'" class="time">
                {{ formatContactTime(user.lastMsgTime) }}
              </div>
              <button
                v-else
                class="follow-btn"
                :class="{
                  followed: user.followed,
                  'hover-unfollow': user.followed && hoveredBtn === user.userId,
                }"
                @mouseenter="user.followed && (hoveredBtn = user.userId)"
                @mouseleave="hoveredBtn = null"
                @click.stop="toggleFollow(user)"
              >
                {{
                  !user.followed
                    ? $t('friends.follow')
                    : hoveredBtn === user.userId
                    ? $t('friends.unfollow')
                    : isMutual(user.userId)
                    ? $t('friends.mutual')
                    : $t('friends.following')
                }}
              </button>
            </div>

            <div v-if="currentUsers.length === 0" class="empty">
              {{ emptyText }}
            </div>
          </div>
        </section>

        <section class="chat-pane" :class="{ open: !!activeContact }">
          <template v-if="activeContact">
            <div class="chat-header">
              <img
                class="chat-avatar"
                :src="activeContact.avatarUrl | resizeImage"
                loading="lazy"
              />
              <div class="chat-user">
                <h3>{{ activeContact.nickname }}</h3>
              </div>
              <button class="chat-close" @click="closeChat">
                <svg-icon icon-class="x" />
              </button>
            </div>

            <div ref="chatContainer" class="chat-container">
              <div
                v-for="msg in messages"
                :key="msg.msgId"
                class="msg-item"
                :class="{ 'msg-mine': isMine(msg) }"
              >
                <img
                  class="msg-avatar"
                  :src="getMessageAvatar(msg) | resizeImage"
                  loading="lazy"
                />

                <div class="msg-body">
                  <div v-if="msg.type === 'text'" class="msg-text">
                    {{ msg.msg }}
                  </div>

                  <div
                    v-else-if="msg.type === 'song'"
                    class="msg-card"
                    @click="playSong(msg.song)"
                  >
                    <img
                      v-if="msg.song"
                      class="card-cover"
                      :src="
                        (msg.song.album ? msg.song.album.picUrl : '')
                          | resizeImage
                      "
                      loading="lazy"
                    />
                    <div class="card-info">
                      <div class="card-title">{{
                        msg.song ? msg.song.name : $t('messages.song')
                      }}</div>
                      <div class="card-subtitle">{{
                        msg.song && msg.song.artists
                          ? msg.song.artists[0].name
                          : ''
                      }}</div>
                    </div>
                  </div>

                  <div
                    v-else-if="msg.type === 'playlist'"
                    class="msg-card"
                    @click="goPlaylist(msg.playlist)"
                  >
                    <img
                      v-if="msg.playlist"
                      class="card-cover"
                      :src="msg.playlist.coverImgUrl | resizeImage"
                      loading="lazy"
                    />
                    <div class="card-info">
                      <div class="card-title">{{
                        msg.playlist
                          ? msg.playlist.name
                          : $t('messages.playlist')
                      }}</div>
                    </div>
                  </div>

                  <div
                    v-else-if="msg.type === 'album'"
                    class="msg-card"
                    @click="goAlbum(msg.album)"
                  >
                    <img
                      v-if="msg.album"
                      class="card-cover"
                      :src="msg.album.picUrl | resizeImage"
                      loading="lazy"
                    />
                    <div class="card-info">
                      <div class="card-title">{{
                        msg.album ? msg.album.name : $t('messages.album')
                      }}</div>
                    </div>
                  </div>

                  <div v-else-if="msg.type === 'image'" class="msg-image">
                    <img :src="msg.image || msg.msg" loading="lazy" />
                  </div>

                  <div v-else class="msg-text msg-unknown">
                    [{{ $t('messages.unsupportedType') }}]
                  </div>

                  <div class="msg-time">{{ formatChatTime(msg.time) }}</div>
                </div>
              </div>

              <div v-if="messages.length === 0" class="empty-chat">
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
              <button
                class="send-btn"
                :disabled="!inputText.trim()"
                @click="sendText"
              >
                <svg-icon icon-class="play" />
              </button>
            </div>
          </template>

          <div v-else class="chat-placeholder">
            {{ $t('friends.recentContacts') }}
          </div>
        </section>
      </div>
    </aside>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { isAccountLoggedIn } from '@/utils/auth';
import {
  getPrivateMsgList,
  getPrivateMsgHistory,
  getUserFollows,
  getUserFolloweds,
  followUser,
  sendTextMsg,
} from '@/api/message';

export default {
  name: 'Friends',
  data() {
    return {
      currentTab: 'contacts',
      recentContacts: [],
      follows: [],
      followeds: [],
      activeContact: null,
      messages: [],
      inputText: '',
      hoveredBtn: null,
    };
  },
  computed: {
    ...mapState(['data']),
    userId() {
      return this.data?.user?.userId;
    },
    myAvatarUrl() {
      return this.data?.user?.avatarUrl || '';
    },
    currentUsers() {
      if (this.currentTab === 'contacts') return this.recentContacts;
      if (this.currentTab === 'follows') return this.follows;
      return this.followeds;
    },
    emptyText() {
      if (this.currentTab === 'contacts') return this.$t('friends.noContacts');
      if (this.currentTab === 'follows') return this.$t('friends.noFollowing');
      return this.$t('friends.noFollowers');
    },
    followedsIdSet() {
      return new Set(this.followeds.map(u => u.userId));
    },
    followsIdSet() {
      return new Set(this.follows.map(u => u.userId));
    },
  },
  created() {
    this.loadData();
  },
  mounted() {
    window.addEventListener('keydown', this.handleEscKeydown);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleEscKeydown);
  },
  methods: {
    handleEscKeydown(e) {
      if (e.key !== 'Escape') return;
      if (this.activeContact) {
        this.closeChat();
      } else {
        this.closeSidebar();
      }
    },
    closeSidebar() {
      this.closeChat();
      this.$store.commit('setFriendsSidebar', false);
    },
    loadData() {
      if (!isAccountLoggedIn()) {
        this.closeSidebar();
        return;
      }
      this.loadRecentContacts();
      this.loadFollows();
      this.loadFolloweds();
    },
    loadRecentContacts() {
      getPrivateMsgList().then(data => {
        const myId = this.userId;
        this.recentContacts = (data.msgs || []).map(msg => {
          const other =
            msg.fromUser && msg.fromUser.userId !== myId
              ? msg.fromUser
              : msg.toUser;

          const payload = this.parseMessagePayload(
            msg.lastMsg && msg.lastMsg.msg
          );

          return {
            userId: other ? other.userId : 0,
            nickname: other ? other.nickname : '',
            avatarUrl: other ? other.avatarUrl : '',
            lastMsg: this.getMessagePreview(payload),
            lastMsgTime: msg.lastMsg ? msg.lastMsg.time : msg.time,
          };
        });
      });
    },
    loadFollows() {
      if (!this.userId) return;
      getUserFollows({ uid: this.userId }).then(data => {
        this.follows = data.follow || [];
      });
    },
    loadFolloweds() {
      if (!this.userId) return;
      getUserFolloweds({ uid: this.userId }).then(data => {
        this.followeds = data.followeds || [];
      });
    },
    switchTab(tab) {
      this.currentTab = tab;
    },
    isActiveContact(uid) {
      return (
        this.activeContact && Number(this.activeContact.userId) === Number(uid)
      );
    },
    openChat(userId, nickname, avatarUrl) {
      const nextContact = {
        userId: Number(userId),
        nickname: nickname || '',
        avatarUrl: avatarUrl || '',
      };

      const changed =
        !this.activeContact ||
        Number(this.activeContact.userId) !== Number(nextContact.userId);

      this.activeContact = nextContact;
      if (changed || this.messages.length === 0) {
        this.loadChatMessages();
      }
    },
    closeChat() {
      this.activeContact = null;
      this.messages = [];
      this.inputText = '';
    },
    loadChatMessages() {
      if (!this.activeContact || !this.activeContact.userId) return;
      getPrivateMsgHistory({ uid: this.activeContact.userId, limit: 100 }).then(
        data => {
          this.messages = (data.msgs || [])
            .reverse()
            .map((item, index) => this.normalizeMessage(item, index));
          this.$nextTick(() => this.scrollToBottom());
        }
      );
    },
    sendText() {
      const text = this.inputText.trim();
      if (!text || !this.activeContact || !this.activeContact.userId) return;

      sendTextMsg({ user_ids: this.activeContact.userId, msg: text }).then(
        data => {
          if (data.code === 200) {
            this.inputText = '';
            this.loadChatMessages();
            this.loadRecentContacts();
          }
        }
      );
    },
    scrollToBottom() {
      const container = this.$refs.chatContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    isMine(msg) {
      return (
        Number(msg && msg.fromUser && msg.fromUser.userId) ===
        Number(this.userId)
      );
    },
    getMessageAvatar(msg) {
      if (this.isMine(msg)) {
        return (
          this.myAvatarUrl ||
          (msg.fromUser && msg.fromUser.avatarUrl) ||
          (this.activeContact && this.activeContact.avatarUrl) ||
          ''
        );
      }

      return (
        (msg.fromUser && msg.fromUser.avatarUrl) ||
        (this.activeContact && this.activeContact.avatarUrl) ||
        ''
      );
    },
    normalizeMessage(rawMessage, index) {
      const payload = this.parseMessagePayload(rawMessage && rawMessage.msg);
      const time = this.normalizeTimestamp(
        (rawMessage && rawMessage.time) ||
          (rawMessage && rawMessage.lastMsgTime) ||
          payload.time
      );

      return {
        msgId:
          (rawMessage &&
            (rawMessage.id || rawMessage.msgId || rawMessage.msgid)) ||
          `${time || Date.now()}-${index}`,
        fromUser: (rawMessage && rawMessage.fromUser) || {
          userId: 0,
          avatarUrl: '',
          nickname: '',
        },
        toUser: (rawMessage && rawMessage.toUser) || {
          userId: 0,
          avatarUrl: '',
          nickname: '',
        },
        time: time || Date.now(),
        type: this.resolveMessageType(payload),
        msg: this.getMessageText(payload),
        song: payload.song || payload.music || payload.songData || null,
        playlist: payload.playlist || payload.playlistData || null,
        album: payload.album || payload.albumData || null,
        image: this.getImageUrl(payload),
      };
    },
    parseMessagePayload(rawPayload) {
      if (!rawPayload) return {};
      if (typeof rawPayload === 'object') return rawPayload;
      if (typeof rawPayload !== 'string') return {};
      try {
        return JSON.parse(rawPayload);
      } catch (error) {
        return { msg: rawPayload };
      }
    },
    getMessageText(payload) {
      if (!payload) return '';
      if (typeof payload.msg === 'string') return payload.msg;
      if (typeof payload.pushMsg === 'string') return payload.pushMsg;
      if (
        payload.generalMsg &&
        typeof payload.generalMsg.inboxBriefContent === 'string'
      ) {
        return payload.generalMsg.inboxBriefContent;
      }
      return '';
    },
    getImageUrl(payload) {
      if (!payload) return '';
      return (
        payload.picUrl ||
        payload.imgUrl ||
        payload.imageUrl ||
        (payload.picInfo && (payload.picInfo.picUrl || payload.picInfo.url)) ||
        ''
      );
    },
    getMessagePreview(payload) {
      const text = this.getMessageText(payload);
      if (text) return text;
      if (this.getImageUrl(payload)) return '[图片]';
      if (payload.song || payload.music || payload.songData) {
        return `[${this.$t('messages.song')}]`;
      }
      if (payload.playlist || payload.playlistData) {
        return `[${this.$t('messages.playlist')}]`;
      }
      if (payload.album || payload.albumData) {
        return `[${this.$t('messages.album')}]`;
      }
      return '';
    },
    resolveMessageType(payload) {
      if (!payload) return 'unknown';
      if (payload.song || payload.music || payload.songData) return 'song';
      if (payload.playlist || payload.playlistData) return 'playlist';
      if (payload.album || payload.albumData) return 'album';
      if (this.getImageUrl(payload)) return 'image';
      if (Number(payload.type) === 16 && payload.picInfo) return 'image';
      if (this.getMessageText(payload)) return 'text';
      return 'unknown';
    },
    normalizeTimestamp(value) {
      const ts = Number(value);
      if (!Number.isFinite(ts) || ts <= 0) return 0;
      return ts < 1e12 ? ts * 1000 : ts;
    },
    formatContactTime(timestamp) {
      if (!timestamp) return '';
      const ts = this.normalizeTimestamp(timestamp);
      if (!ts) return '';

      const date = new Date(ts);
      const now = new Date();
      const diff = now - date;
      if (diff < 60000) return this.$t('friends.justNow');
      if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}${this.$t('friends.minutesAgo')}`;
      }
      if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}${this.$t('friends.hoursAgo')}`;
      }
      return `${date.getMonth() + 1}/${date.getDate()}`;
    },
    formatChatTime(timestamp) {
      const ts = this.normalizeTimestamp(timestamp);
      if (!ts) return '';

      const date = new Date(ts);
      if (Number.isNaN(date.getTime())) return '';

      const now = new Date();
      const isSameYear = date.getFullYear() === now.getFullYear();
      const isSameDay =
        isSameYear &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

      const hours = date.getHours().toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      const hm = `${hours}:${mins}`;

      if (isSameDay) return hm;
      if (isSameYear) return `${date.getMonth() + 1}/${date.getDate()} ${hm}`;
      return `${date.getFullYear()}/${
        date.getMonth() + 1
      }/${date.getDate()} ${hm}`;
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
    isMutual(userId) {
      // follows tab: check if they're also in my followeds
      if (this.currentTab === 'follows') return this.followedsIdSet.has(userId);
      // followeds tab: check if I also follow them
      if (this.currentTab === 'followeds') return this.followsIdSet.has(userId);
      return false;
    },
    toggleFollow(user) {
      const t = user.followed ? 0 : 1;
      followUser({ id: user.userId, t }).then(data => {
        if (data.code === 200) {
          this.$set(user, 'followed', !user.followed);
          this.hoveredBtn = null;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.friends-shell {
  position: fixed;
  inset: 0;
  z-index: 210;
}

.friends-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(2px);
}

.friends-sidebar {
  position: absolute;
  top: 72px;
  right: 0;
  bottom: 104px;
  width: 40vw;
  background: var(--color-body-bg);
  border-radius: 18px 0 0 18px;
  box-shadow: -20px 0 48px rgba(0, 0, 0, 0.2);
  border-left: 1px solid var(--color-secondary-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: sidebar-in 0.24s ease;
}

.sidebar-header {
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 0 16px;
  border-bottom: 1px solid var(--color-secondary-bg);

  h2 {
    margin: 0;
    font-size: 21px;
    color: var(--color-text);
  }
}

.sidebar-close,
.chat-close {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  opacity: 0.72;

  &:hover {
    opacity: 1;
    background: var(--color-secondary-bg);
  }

  .svg-icon {
    width: 15px;
    height: 15px;
  }
}

.sidebar-body {
  height: calc(100% - 58px);
  display: flex;
}

.list-pane {
  width: 100%;
  border-right: 1px solid transparent;
  transition: width 0.28s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;
}

.friends-sidebar.chat-open .list-pane {
  width: 15%;
  border-right-color: var(--color-secondary-bg);
}

.chat-pane {
  width: 0;
  opacity: 0;
  transform: translateX(100%);
  transition: width 0.28s ease, opacity 0.2s ease, transform 0.28s ease;
  overflow: hidden;
  pointer-events: none;
  display: flex;
  flex-direction: column;
}

.friends-sidebar.chat-open .chat-pane {
  width: 80%;
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.section-tabs {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid var(--color-secondary-bg);

  .tab {
    flex: 1;
    border: none;
    border-radius: 8px;
    padding: 8px 4px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    color: var(--color-text);
    opacity: 0.64;
    background: transparent;

    &:hover {
      background: var(--color-secondary-bg);
      opacity: 0.92;
    }

    &.active {
      background: var(--color-primary-bg-for-transparent);
      color: var(--color-primary);
      opacity: 1;
    }
  }
}

.friends-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.friend-item {
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;

  &:hover {
    background: var(--color-secondary-bg);
  }

  &.active {
    background: var(--color-primary-bg-for-transparent);
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .info {
    min-width: 0;
    flex: 1;
  }

  .name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 2px;
  }

  .last-msg,
  .signature {
    font-size: 12px;
    color: var(--color-text);
    opacity: 0.58;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .time {
    font-size: 11px;
    color: var(--color-text);
    opacity: 0.46;
    margin-left: 8px;
    white-space: nowrap;
  }

  .follow-btn {
    border: none;
    border-radius: 14px;
    width: 78px;
    padding: 4px 10px;
    font-size: 12px;
    color: #fff;
    background: var(--color-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    box-sizing: border-box;

    &.followed {
      background: var(--color-secondary-bg);
      color: var(--color-text);

      &.hover-unfollow {
        background: #e84040;
        color: #fff;
      }
    }
  }
}

.friends-sidebar.chat-open {
  .friend-item {
    justify-content: center;
    padding: 8px 4px;

    .avatar {
      margin-right: 0;
    }

    .info,
    .time,
    .follow-btn {
      display: none;
    }
  }
}

.empty {
  text-align: center;
  padding: 36px 8px;
  font-size: 13px;
  color: var(--color-text);
  opacity: 0.52;
}

.chat-header {
  height: 54px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-bottom: 1px solid var(--color-secondary-bg);

  .chat-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 8px;
    flex-shrink: 0;
  }

  .chat-user {
    min-width: 0;
    flex: 1;
  }

  h3 {
    margin: 0;
    font-size: 15px;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.msg-item {
  display: flex;
  align-items: flex-end;
  margin-bottom: 14px;

  .msg-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 8px;
    flex-shrink: 0;
  }

  .msg-body {
    max-width: calc(100% - 40px);
    display: flex;
    flex-direction: column;
  }

  &.msg-mine {
    justify-content: flex-end;

    .msg-avatar {
      order: 2;
      margin-right: 0;
      margin-left: 8px;
    }

    .msg-body {
      order: 1;
      align-items: flex-end;
    }

    .msg-text {
      background: var(--color-primary);
      color: #fff;
    }

    .msg-time {
      text-align: right;
    }
  }
}

.msg-text {
  padding: 8px 12px;
  border-radius: 14px;
  background: var(--color-secondary-bg);
  color: var(--color-text);
  font-size: 13px;
  line-height: 1.45;
  word-break: break-word;
}

.msg-unknown {
  opacity: 0.6;
}

.msg-card {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 14px;
  background: var(--color-secondary-bg);
  cursor: pointer;

  .card-cover {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    object-fit: cover;
    margin-right: 8px;
  }

  .card-info {
    min-width: 0;
    flex: 1;
  }

  .card-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-subtitle {
    margin-top: 2px;
    font-size: 11px;
    color: var(--color-text);
    opacity: 0.58;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.msg-image img {
  max-width: 100%;
  border-radius: 12px;
}

.msg-time {
  font-size: 11px;
  color: var(--color-text);
  opacity: 0.42;
  margin-top: 4px;
  padding: 0 4px;
}

.empty-chat,
.chat-placeholder {
  text-align: center;
  color: var(--color-text);
  opacity: 0.52;
  font-size: 13px;
  padding: 30px 12px;
}

.input-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--color-secondary-bg);
  padding: 10px;

  input {
    flex: 1;
    border: none;
    outline: none;
    border-radius: 16px;
    background: var(--color-secondary-bg);
    color: var(--color-text);
    padding: 8px 12px;
    font-size: 13px;
  }

  .send-btn {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    .svg-icon {
      width: 12px;
      height: 12px;
      margin-left: 1px;
    }

    &:disabled {
      opacity: 0.42;
      cursor: default;
    }
  }
}

@keyframes sidebar-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@media (max-width: 980px) {
  .friends-sidebar {
    width: 100vw;
    top: 64px;
    bottom: 0;
    border-radius: 0;
  }

  .friends-sidebar.chat-open .list-pane {
    width: 0;
    border-right: none;
  }

  .friends-sidebar.chat-open .chat-pane {
    width: 100%;
  }
}
</style>
