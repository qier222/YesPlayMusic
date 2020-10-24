<template>
  <div class="login">
    <div class="section-1">
      <img src="/img/logos/netease-music.png" />
    </div>
    <div class="title">{{ $t("login.loginText") }}</div>
    <div class="section-2">
      <div class="input-box" v-show="mode === 'phone'">
        <div class="container" :class="{ active: inputFocus === 'phone' }">
          <svg-icon icon-class="mobile" />
          <div class="inputs">
            <input
              id="countryCode"
              :placeholder="
                inputFocus === 'phone' ? '' : $t('login.countryCode')
              "
              v-model="countryCode"
              @focus="inputFocus = 'phone'"
              @blur="inputFocus = ''"
            />
            <input
              id="phoneNumber"
              :placeholder="inputFocus === 'phone' ? '' : $t('login.phone')"
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
              :placeholder="inputFocus === 'email' ? '' : $t('login.email')"
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
              :placeholder="
                inputFocus === 'password' ? '' : $t('login.password')
              "
              v-model="password"
              @focus="inputFocus = 'password'"
              @blur="inputFocus = ''"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="confirm">
      <button @click="login" v-show="!processing">
        {{ $t("login.login") }}
      </button>
      <button v-show="processing" class="loading" disabled>
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <div class="other-login">
      <a v-show="mode === 'phone'" @click="mode = 'email'">{{
        $t("login.loginWithEmail")
      }}</a>
      <a v-show="mode === 'email'" @click="mode = 'phone'">{{
        $t("login.loginWithPhone")
      }}</a>
    </div>
    <div class="notice" v-html="$t('login.notice')"></div>
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
      // Cookies.set("MUSIC_U", true, { expires: 3650 });
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
          this.countryCode === "" ||
          this.phone === "" ||
          this.password === ""
        ) {
          alert("国家区号、手机或密码不正确");
          this.processing = false;
          return;
        }
        loginWithPhone({
          countrycode: this.countryCode.replace("+", "").replace(/\s/g, ""),
          phone: this.phoneNumber.replace(/\s/g, ""),
          password: "fakePassword",
          md5_password: md5(this.password).toString(),
        })
          .then((data) => {
            if (data.code !== 502) {
              this.updateUser(data.profile);
              this.afterLogin();
            }
          })
          .catch((error) => {
            this.processing = false;
            alert(error);
          });
      } else {
        let emailReg = /^[A-Za-z0-9]+([_][A-Za-z0-9]+)*@([A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/;
        if (
          this.email === "" ||
          this.password === "" ||
          !emailReg.test(this.email)
        ) {
          alert("邮箱或密码不正确");
          this.processing = false;
          return;
        }
        loginWithEmail({
          email: this.email.replace(/\s/g, ""),
          password: "fakePassword",
          md5_password: md5(this.password).toString(),
        })
          .then((data) => {
            if (data.code !== 502) {
              this.updateUser(data.profile);
              this.afterLogin();
            }
          })
          .catch((error) => {
            this.processing = false;
            alert(error);
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.login {
  --account-login-title: var(--color-text-1);
  --account-login-icon: var(--color-text-6);
  --account-login-container-bg: var(--color-bg-3);
  --account-login-container-icon: var(--color-text-5);
  --account-login-input: var(--color-text-1);
  --account-login-active: var(--color-primary-light);
  --account-login-color: var(--color-primary);
  --account-login-other-link: var(--color-text-2);
  --account-login-notice-border: var(--color-border-2);
  --account-login-notice: var(--color-text-4);
}

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
  color: var(--account-login-title);
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
    color: var(--account-login-icon);
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
    background: var(--account-login-container-bg);
    border-radius: 8px;
    width: 300px;
  }

  .svg-icon {
    height: 18px;
    width: 18px;
    color: var(--account-login-container-icon);
    margin: {
      left: 12px;
      right: 6px;
    }
  }

  .inputs {
    display: flex;
    width: 85%;
  }

  input {
    font-size: 20px;
    border: none;
    background: transparent;
    width: 100%;
    font-weight: 600;
    margin-top: -1px;
    color: var(--account-login-input);
  }

  input#countryCode {
    flex: 3;
  }
  input#phoneNumber {
    flex: 12;
  }

  .active {
    background: var(--account-login-active);
    input,
    .svg-icon {
      color: var(--account-login-color);
    }
  }
}

.confirm button {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  background-color: var(--account-login-active);
  color: var(--account-login-color);
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
    color: var(--account-login-other-link);
  }
}

.notice {
  width: 300px;
  border-top: 1px solid var(--color-border-2);
  margin-top: 48px;
  padding-top: 12px;
  font-size: 12px;
  color: var(--account-login-notice);
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
  background-color: var(--account-login-color);
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
