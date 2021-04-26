<template>
  <div class="login">
    <div class="section-1">
      <img src="/img/logos/netease-music.png" />
    </div>
    <div class="title">{{ $t('login.loginText') }}</div>
    <div class="section-2">
      <div v-show="mode === 'phone'" class="input-box">
        <div class="container" :class="{ active: inputFocus === 'phone' }">
          <svg-icon icon-class="mobile" />
          <div class="inputs">
            <input
              id="countryCode"
              v-model="countryCode"
              :placeholder="
                inputFocus === 'phone' ? '' : $t('login.countryCode')
              "
              @focus="inputFocus = 'phone'"
              @blur="inputFocus = ''"
              @keyup.enter="login"
            />
            <input
              id="phoneNumber"
              v-model="phoneNumber"
              :placeholder="inputFocus === 'phone' ? '' : $t('login.phone')"
              @focus="inputFocus = 'phone'"
              @blur="inputFocus = ''"
              @keyup.enter="login"
            />
          </div>
        </div>
      </div>
      <div v-show="mode === 'email'" class="input-box">
        <div class="container" :class="{ active: inputFocus === 'email' }">
          <svg-icon icon-class="mail" />
          <div class="inputs">
            <input
              id="email"
              v-model="email"
              type="email"
              :placeholder="inputFocus === 'email' ? '' : $t('login.email')"
              @focus="inputFocus = 'email'"
              @blur="inputFocus = ''"
              @keyup.enter="login"
            />
          </div>
        </div>
      </div>
      <div class="input-box">
        <div class="container" :class="{ active: inputFocus === 'password' }">
          <svg-icon icon-class="lock" />
          <div class="inputs">
            <input
              id="password"
              v-model="password"
              type="password"
              :placeholder="
                inputFocus === 'password' ? '' : $t('login.password')
              "
              @focus="inputFocus = 'password'"
              @blur="inputFocus = ''"
              @keyup.enter="login"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="confirm">
      <button v-show="!processing" @click="login">
        {{ $t('login.login') }}
      </button>
      <button v-show="processing" class="loading" disabled>
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <div class="other-login">
      <a v-show="mode === 'phone'" @click="mode = 'email'">{{
        $t('login.loginWithEmail')
      }}</a>
      <a v-show="mode === 'email'" @click="mode = 'phone'">{{
        $t('login.loginWithPhone')
      }}</a>
    </div>
    <div
      class="notice"
      v-html="isElectron ? $t('login.noticeElectron') : $t('login.notice')"
    ></div>
  </div>
</template>

<script>
import NProgress from 'nprogress';
import { loginWithPhone, loginWithEmail } from '@/api/auth';
import { setCookies } from '@/utils/auth';
import md5 from 'crypto-js/md5';
import { mapMutations } from 'vuex';
import nativeAlert from '@/utils/nativeAlert';

export default {
  name: 'Login',
  data() {
    return {
      processing: false,
      mode: 'email',
      countryCode: '+86',
      phoneNumber: '',
      email: '',
      password: '',
      smsCode: '',
      inputFocus: '',
    };
  },
  computed: {
    isElectron() {
      return process.env.IS_ELECTRON;
    },
  },
  created() {
    if (this.$route.query.mode === 'phone') {
      this.mode = 'phone';
    }
    NProgress.done();
  },
  methods: {
    ...mapMutations(['updateData']),
    validatePhone() {
      if (
        this.countryCode === '' ||
        this.phone === '' ||
        this.password === ''
      ) {
        nativeAlert('国家区号或手机号不正确');
        this.processing = false;
        return false;
      }
      return true;
    },
    validateEmail() {
      const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (
        this.email === '' ||
        this.password === '' ||
        !emailReg.test(this.email)
      ) {
        nativeAlert('邮箱不正确');
        return false;
      }
      return true;
    },
    login() {
      if (this.mode === 'phone') {
        this.processing = this.validatePhone();
        if (!this.processing) return;
        loginWithPhone({
          countrycode: this.countryCode.replace('+', '').replace(/\s/g, ''),
          phone: this.phoneNumber.replace(/\s/g, ''),
          password: 'fakePassword',
          md5_password: md5(this.password).toString(),
        })
          .then(this.handleLoginResponse)
          .catch(error => {
            this.processing = false;
            nativeAlert(`发生错误，请检查你的账号密码是否正确\n${error}`);
          });
      } else {
        this.processing = this.validateEmail();
        if (!this.processing) return;
        loginWithEmail({
          email: this.email.replace(/\s/g, ''),
          password: 'fakePassword',
          md5_password: md5(this.password).toString(),
        })
          .then(this.handleLoginResponse)
          .catch(error => {
            this.processing = false;
            nativeAlert(`发生错误，请检查你的账号密码是否正确\n${error}`);
          });
      }
    },
    handleLoginResponse(data) {
      if (!data) {
        this.processing = false;
        return;
      }
      if (data.code === 200) {
        setCookies(data.cookie);
        this.updateData({ key: 'user', value: data.profile });
        this.updateData({ key: 'loginMode', value: 'account' });
        this.$router.push({ path: '/library' });
      } else {
        this.processing = false;
        console.log(data.msg);
        nativeAlert(data.msg ?? data.message ?? '账号或密码错误，请检查');
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
  justify-content: center;
  min-height: calc(100vh - 192px);
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 48px;
  color: var(--color-text);
}

.section-1 {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  img {
    height: 64px;
    margin: 20px;
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
  color: var(--color-text);

  .container {
    display: flex;
    align-items: center;
    height: 46px;
    background: var(--color-secondary-bg);
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
    width: 85%;
  }

  input {
    font-size: 20px;
    border: none;
    background: transparent;
    width: 100%;
    font-weight: 600;
    margin-top: -1px;
    color: var(--color-text);
  }

  input::placeholder {
    color: var(--color-text);
    opacity: 0.38;
  }

  input#countryCode {
    flex: 3;
  }
  input#phoneNumber {
    flex: 12;
  }

  .active {
    background: var(--color-primary-bg);
    input,
    .svg-icon {
      color: var(--color-primary);
    }
  }
}

.confirm button {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
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
    color: var(--color-text);
    opacity: 0.68;
  }
}

.notice {
  width: 300px;
  border-top: 1px solid rgba(128, 128, 128);
  margin-top: 48px;
  padding-top: 12px;
  font-size: 12px;
  color: var(--color-text);
  opacity: 0.48;
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
  background-color: var(--color-primary);
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
