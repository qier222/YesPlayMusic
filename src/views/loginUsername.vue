<template>
  <div class="login">
    <div>
      <div class="title">用户名登录</div>
      <div class="sestion">
        <div class="search-box">
          <div class="container">
            <svg-icon icon-class="search" />
            <div class="input">
              <input
                placeholder="请输入你的网易云用户名"
                v-model="keyword"
                @keydown.enter="search"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="sestion">
        <div class="name" v-show="activeUser.nickname === undefined">
          按Enter搜索
        </div>
        <div class="name" v-show="activeUser.nickname !== undefined">
          在列表中选中你的账号
        </div>
        <div class="user-list">
          <div
            class="user"
            v-for="user in result"
            :key="user.id"
            :class="{ active: user.nickname === activeUser.nickname }"
            @click="activeUser = user"
          >
            <img class="head" :src="user.avatarUrl | resizeImage" />
            <div class="nickname">
              {{ user.nickname }}
            </div>
          </div>
        </div>
      </div>
      <ButtonTwoTone
        @click.native="confirm"
        v-show="activeUser.nickname !== undefined"
        >确定</ButtonTwoTone
      >
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import NProgress from "nprogress";
import { search } from "@/api/others";
import Cookies from "js-cookie";
import { userPlaylist } from "@/api/user";

import ButtonTwoTone from "@/components/ButtonTwoTone.vue";

export default {
  name: "loginUsername",
  components: {
    ButtonTwoTone,
  },
  data() {
    return {
      keyword: "",
      result: [],
      activeUser: {},
    };
  },
  created() {
    NProgress.done();
  },
  methods: {
    ...mapMutations(["updateUser", "updateUserInfo"]),
    search() {
      search({ keywords: this.keyword, limit: 9, type: 1002 }).then((data) => {
        this.result = data.result.userprofiles;
        this.activeUser = this.result[0];
      });
    },
    confirm() {
      this.updateUser(this.activeUser);
      Cookies.set("loginMode", "username", { expires: 3650 });
      userPlaylist({
        uid: this.activeUser.userId,
        limit: 1,
      }).then((data) => {
        this.updateUserInfo({
          key: "likedSongPlaylistID",
          value: data.playlist[0].id,
        });
        this.$router.push({ path: "/library" });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.login {
  display: flex;
}

.title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 48px;
}

.sestion {
  margin-top: 18px;
  .name {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    color: rgba(0, 0, 0, 0.78);
  }
}

.search-box {
  .container {
    display: flex;
    align-items: center;
    height: 48px;
    border-radius: 11px;
    width: 326px;
    background: #eaeffd;
  }

  .svg-icon {
    height: 22px;
    width: 22px;
    color: #335eea;
    margin: {
      left: 12px;
      right: 8px;
    }
  }

  input {
    flex: 1;
    font-size: 22px;
    border: none;
    background: transparent;
    width: 115%;
    font-weight: 600;
    margin-top: -1px;
    color: #335eea;
    &::placeholder {
      color: #335eeac4;
    }
  }
}

.user-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 24px;
  margin-bottom: 24px;
}

.user {
  margin-right: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  padding: 12px 12px 12px 16px;
  border-radius: 8px;
  width: 256px;
  transition: 0.2s;
  user-select: none;
  .head {
    border-radius: 50%;
    height: 44px;
    width: 44px;
  }
  .nickname {
    font-size: 18px;
    margin-left: 12px;
  }
  &:hover {
    background: #f5f5f7;
  }
}

.user.active {
  transition: 0.2s;
  background: #eaeffd;
  .name {
    color: #335eea;
  }
}
</style>
