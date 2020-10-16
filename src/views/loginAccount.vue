<template>
  <div class="login">
    <div class="section-1">
      <img src="/img/logos/netease-music.png" />
    </div>
    <div class="title">登录网易云账号</div>
    <div class="section-2">
      <div class="input-box" v-show="mode === 'phone'">
        <div class="container" :class="{ active: inputFocus === 'phone' }">
          <svg-icon icon-class="mobile" />
          <div class="inputs">
            <input
              id="countryCode"
              :placeholder="inputFocus === 'phone' ? '' : '国际区号'"
              v-model="countryCode"
              @focus="inputFocus = 'phone'"
              @blur="inputFocus = ''"
            />
            <input
              id="phoneNumber"
              :placeholder="inputFocus === 'phone' ? '' : '手机号'"
              v-model="phoneNumber"
              @focus="inputFocus = 'phone'"
              @blur="inputFocus = ''"
            />
          </div>
        </div>
      </div>
      <div class="input-box" v-show="mode === 'email'">
        <div class="container" :class="{ active: inputFocus === 'email' }">
          <svg-icon icon-class="mail" />
          <div class="inputs">
            <input
              type="email"
              id="email"
              :placeholder="inputFocus === 'email' ? '' : '邮箱'"
              v-model="email"
              @focus="inputFocus = 'email'"
              @blur="inputFocus = ''"
            />
          </div>
        </div>
      </div>
      <div class="input-box">
        <div class="container" :class="{ active: inputFocus === 'password' }">
          <svg-icon icon-class="lock" />
          <div class="inputs">
            <input
              type="password"
              id="password"
              :placeholder="inputFocus === 'password' ? '' : '密码'"
              v-model="password"
              @focus="inputFocus = 'password'"
              @blur="inputFocus = ''"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="confirm">
      <button @click="login" v-show="!processing">登录</button>
      <button v-show="processing" class="loading" disabled>
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <div class="other-login">
      <a v-show="mode === 'phone'" @click="mode = 'email'">使用邮箱登录</a>
      <a v-show="mode === 'email'" @click="mode = 'phone'">使用手机号登录</a>
    </div>
    <div class="notice">
      YesPlayMusic 承诺不会保存你的任何账号信息到云端。<br />
      你的密码会在本地进行 MD5 加密后再传输到网易云 API。<br />
      YesPlayMusic 并非网易云官方网站，输入账号信息前请慎重考虑。 你也可以前往
      <a href="https://github.com/qier222/YesPlayMusic"
        >YesPlayMusic 的 GitHub 源代码仓库</a
      >
      自行构建并使用自托管的网易云 API。
    </div>
  </div>
</template>

<script>
import NProgress from "nprogress";
import { loginWithPhone, loginWithEmail } from "@/api/auth";
import md5 from "crypto-js/md5";
import { mapMutations } from "vuex";
import { userPlaylist } from "@/api/user";
import Cookies from "js-cookie";

export default {
  name: "Login",
  data() {
    return {
      processing: false,
      mode: "email",
      countryCode: "+86",
      phoneNumber: "",
      email: "",
      password: "",
      smsCode: "",
      inputFocus: "",
    };
  },
  created() {
    if (this.$route.query.mode === "phone") {
      this.mode = "phone";
    }
    NProgress.done();
  },
  methods: {
    ...mapMutations(["updateUser", "updateUserInfo"]),
    afterLogin() {
      Cookies.set("loginMode", "account", { expires: 3650 });
      userPlaylist({
        uid: this.$store.state.settings.user.userId,
        limit: 1,
      }).then((data) => {
        this.updateUserInfo({
          key: "likedSongPlaylistID",
          value: data.playlist[0].id,
        });
        this.$router.push({ path: "/library" });
      });
    },
    login() {
      this.processing = true;
      if (this.mode === "phone") {
        if (
          this.countrycode === "" ||
          this.phone === "" ||
          this.password === ""
        ) {
          alert("请输入完整的信息");
          this.processing = false;
          return;
        }
        loginWithPhone({
          countrycode: this.countryCode.replace("+", "").replaceAll(" ", ""),
          phone: this.phoneNumber.replaceAll(" ", ""),
          password: "fakePassword",
          md5_password: md5(this.password).toString(),
        })
          .then((data) => {
            this.updateUser(data.profile);
            this.afterLogin();
          })
          .catch(() => {
            this.processing = false;
          });
      } else {
        if (this.email === "" || this.password === "") {
          alert("请输入完整的信息");
          this.processing = false;
          return;
        }
        loginWithEmail({
          email: this.email.replaceAll(" ", ""),
          password: "fakePassword",
          md5_password: md5(this.password).toString(),
        })
          .then((data) => {
            this.updateUser(data.profile);
            this.afterLogin();
          })
          .catch(() => {
            this.processing = false;
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 192px);
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 48px;
}

.section-1 {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  img {
    height: 64px;
    margin: 20px;
  }
  .svg-icon {
    height: 24px;
    width: 24px;
    color: rgba(82, 82, 82, 0.28);
  }
}

.section-2 {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.input-box {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;

  .container {
    display: flex;
    align-items: center;
    height: 46px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 8px;
    width: 300px;
  }

  .svg-icon {
    height: 18px;
    width: 18px;
    color: #aaaaaa;
    margin: {
      left: 12px;
      right: 6px;
    }
  }

  .inputs {
    display: flex;
  }

  input {
    font-size: 20px;
    border: none;
    background: transparent;
    width: 96%;
    font-weight: 600;
    margin-top: -1px;
    color: rgba(0, 0, 0, 0.88);
  }

  input#countryCode {
    flex: 2;
  }
  input#phoneNumber {
    flex: 14;
  }

  .active {
    background: #eaeffd;
    input,
    .svg-icon {
      color: #335eea;
    }
  }
}

.confirm button {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  background-color: rgba(51, 94, 234, 0.1);
  color: #335eea;
  border-radius: 8px;
  margin-top: 24px;
  transition: 0.2s;
  padding: 8px;
  width: 100%;
  width: 300px;
  &:hover {
    transform: scale(1.06);
  }
  &:active {
    transform: scale(0.94);
  }
}

.other-login {
  margin-top: 24px;
  a {
    cursor: pointer;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.68);
  }
}

.notice {
  width: 300px;
  border-top: 1px solid rgba(0, 0, 0, 0.18);
  margin-top: 48px;
  padding-top: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.48);
}

@keyframes loading {
  0% {
    opacity: 0.2;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}

button.loading {
  height: 44px;
  cursor: unset;
  &:hover {
    transform: none;
  }
}
.loading span {
  width: 6px;
  height: 6px;
  background-color: #335eea;
  border-radius: 50%;
  margin: 0 2px;
  animation: loading 1.4s infinite both;
}

.loading span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading span:nth-child(3) {
  animation-delay: 0.4s;
}
</style>
