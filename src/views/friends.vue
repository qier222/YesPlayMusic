<template>
  <div v-show="show" ref="friends">
    <h1>{{ $t('friends.title') }}</h1>

    <div class="section-tabs">
      <div class="tabs">
        <div
          class="tab"
          :class="{ active: currentTab === 'contacts' }"
          @click="switchTab('contacts')"
        >
          {{ $t('friends.recentContacts') }}
        </div>
        <div
          class="tab"
          :class="{ active: currentTab === 'follows' }"
          @click="switchTab('follows')"
        >
          {{ $t('friends.following') }}
        </div>
        <div
          class="tab"
          :class="{ active: currentTab === 'followeds' }"
          @click="switchTab('followeds')"
        >
          {{ $t('friends.followers') }}
        </div>
      </div>
    </div>

    <!-- 最近联系人 -->
    <div v-show="currentTab === 'contacts'" class="friends-list">
      <div
        v-for="contact in recentContacts"
        :key="contact.userId"
        class="friend-item"
        @click="openChat(contact.userId, contact.nickname, contact.avatarUrl)"
      >
        <img
          class="avatar"
          :src="contact.avatarUrl | resizeImage"
          loading="lazy"
        />
        <div class="info">
          <div class="name">{{ contact.nickname }}</div>
          <div class="last-msg">{{ contact.lastMsg || '' }}</div>
        </div>
        <div class="time">{{ formatTime(contact.lastMsgTime) }}</div>
      </div>
      <div v-if="recentContacts.length === 0" class="empty">
        {{ $t('friends.noContacts') }}
      </div>
    </div>

    <!-- 关注列表 -->
    <div v-show="currentTab === 'follows'" class="friends-list">
      <div
        v-for="user in follows"
        :key="user.userId"
        class="friend-item"
        @click="openChat(user.userId, user.nickname, user.avatarUrl)"
      >
        <img
          class="avatar"
          :src="user.avatarUrl | resizeImage"
          loading="lazy"
        />
        <div class="info">
          <div class="name">{{ user.nickname }}</div>
          <div class="signature">{{ user.signature || '' }}</div>
        </div>
        <button
          class="follow-btn"
          :class="{ followed: user.followed }"
          @click.stop="toggleFollow(user)"
        >
          {{ user.followed ? $t('friends.following') : $t('friends.follow') }}
        </button>
      </div>
      <div v-if="follows.length === 0" class="empty">
        {{ $t('friends.noFollowing') }}
      </div>
    </div>

    <!-- 粉丝列表 -->
    <div v-show="currentTab === 'followeds'" class="friends-list">
      <div
        v-for="user in followeds"
        :key="user.userId"
        class="friend-item"
        @click="openChat(user.userId, user.nickname, user.avatarUrl)"
      >
        <img
          class="avatar"
          :src="user.avatarUrl | resizeImage"
          loading="lazy"
        />
        <div class="info">
          <div class="name">{{ user.nickname }}</div>
          <div class="signature">{{ user.signature || '' }}</div>
        </div>
        <button
          class="follow-btn"
          :class="{ followed: user.followed }"
          @click.stop="toggleFollow(user)"
        >
          {{ user.followed ? $t('friends.following') : $t('friends.follow') }}
        </button>
      </div>
      <div v-if="followeds.length === 0" class="empty">
        {{ $t('friends.noFollowers') }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { isAccountLoggedIn } from '@/utils/auth';
import {
  getPrivateMsgList,
  getRecentContacts,
  getUserFollows,
  getUserFolloweds,
  followUser,
} from '@/api/message';
import NProgress from 'nprogress';

export default {
  name: 'Friends',
  data() {
    return {
      show: false,
      currentTab: 'contacts',
      recentContacts: [],
      follows: [],
      followeds: [],
    };
  },
  computed: {
    ...mapState(['data']),
    userId() {
      return this.data?.user?.userId;
    },
  },
  created() {
    setTimeout(() => {
      if (!this.show) NProgress.start();
    }, 1000);
    this.loadData();
  },
  activated() {
    this.$parent.$refs.scrollbar.restorePosition();
    this.loadData();
  },
  methods: {
    loadData() {
      if (!isAccountLoggedIn()) {
        NProgress.done();
        this.show = true;
        return;
      }
      this.loadRecentContacts();
      this.loadFollows();
      this.loadFolloweds();
    },
    loadRecentContacts() {
      getRecentContacts()
        .then(data => {
          this.recentContacts = data.contacts || [];
          NProgress.done();
          this.show = true;
        })
        .catch(() => {
          // fallback: 用私信列表
          getPrivateMsgList().then(data => {
            this.recentContacts = (data.msgs || []).map(msg => ({
              userId: msg.fromUser.userId,
              nickname: msg.fromUser.nickname,
              avatarUrl: msg.fromUser.avatarUrl,
              lastMsg: msg.lastMsg,
              lastMsgTime: msg.lastMsgTime,
            }));
            NProgress.done();
            this.show = true;
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
    openChat(userId, nickname, avatarUrl) {
      this.$router.push({
        name: 'messages',
        params: { uid: userId },
        query: { nickname, avatarUrl },
      });
    },
    toggleFollow(user) {
      const t = user.followed ? 0 : 1;
      followUser({ id: user.userId, t }).then(data => {
        if (data.code === 200) {
          this.$set(user, 'followed', !user.followed);
        }
      });
    },
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      if (diff < 60000) return this.$t('friends.justNow');
      if (diff < 3600000)
        return `${Math.floor(diff / 60000)}${this.$t('friends.minutesAgo')}`;
      if (diff < 86400000)
        return `${Math.floor(diff / 3600000)}${this.$t('friends.hoursAgo')}`;
      return `${date.getMonth() + 1}/${date.getDate()}`;
    },
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-size: 42px;
  color: var(--color-text);
  margin-bottom: 24px;
}

.section-tabs {
  margin-bottom: 24px;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  font-size: 18px;
  color: var(--color-text);

  .tab {
    font-weight: 600;
    padding: 8px 14px;
    margin-right: 14px;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    transition: 0.2s;
    opacity: 0.68;

    &:hover {
      opacity: 0.88;
      background-color: var(--color-secondary-bg);
    }
  }

  .tab.active {
    opacity: 0.88;
    background-color: var(--color-secondary-bg);
  }
}

.friends-list {
  min-height: calc(100vh - 260px);
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-secondary-bg);
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 14px;
    object-fit: cover;
  }

  .info {
    flex: 1;
    min-width: 0;

    .name {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 4px;
    }

    .last-msg,
    .signature {
      font-size: 13px;
      color: var(--color-text);
      opacity: 0.58;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .time {
    font-size: 12px;
    color: var(--color-text);
    opacity: 0.48;
    margin-left: 12px;
    white-space: nowrap;
  }

  .follow-btn {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--color-primary);
    color: white;
    border: none;

    &:hover {
      opacity: 0.88;
    }

    &.followed {
      background: var(--color-secondary-bg);
      color: var(--color-text);
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
</style>
