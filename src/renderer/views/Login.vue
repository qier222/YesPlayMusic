<script setup lang="ts">
import { setCookies } from '@renderer/utils/cookie'
import md5 from 'md5'
import {
  loginWithEmail,
  loginWithPhone,
  fetchLoginQrCodeKey,
  checkLoginQrCodeStatus,
} from '@renderer/api/auth'
import type { CheckLoginQrCodeStatusResponse } from '@renderer/api/auth'
import { useQRCode } from '@vueuse/integrations/useQRCode'

const store = useStore()
const router = useRouter()

// switch login method
type Method = 'qrcode' | 'email' | 'phone'
const method = ref<Method>('phone')
const otherLoginMethods: {
  id: Method
  name: string
}[] = [
  {
    id: 'qrcode',
    name: 'QR Code',
  },
  {
    id: 'email',
    name: 'Email',
  },
  {
    id: 'phone',
    name: 'Phone',
  },
]

const changeMethod = (newMethod: Method) => {
  method.value = newMethod
  if (newMethod === 'qrcode') {
    resumeQrCodeTimer()
  } else {
    pauseQrCodeTimer()
  }
}
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// handle post login
const handlePostLogin = (cookies: string | undefined) => {
  if (!cookies) {
    alert('登录失败 [no cookie returned]')
    return
  }
  setCookies(cookies)
  router.push('/library')
}

// handle qrcode login
const qrCodeKey = ref<string>('')
const qrCodeStatus = ref<CheckLoginQrCodeStatusResponse | undefined>(undefined)
const refreshQrCode = async () => {
  fetchLoginQrCodeKey().then(result => {
    if (!result.data.unikey) return
    qrCodeKey.value = result.data.unikey
  })
}
if (method.value === 'qrcode') refreshQrCode()
const qrCodeUrl = computed<string>(() => {
  return `https://music.163.com/login?codekey=${qrCodeKey.value}`
})
const qrCode = useQRCode(qrCodeUrl, {
  width: 1024,
  margin: 0,
  color: {
    dark: '#335eea', // TODO: change brand color
    light: '#ffffff00',
  },
})
const { pause: pauseQrCodeTimer, resume: resumeQrCodeTimer } = useIntervalFn(
  () => {
    checkLoginQrCodeStatus({ key: qrCodeKey.value }).then(result => {
      qrCodeStatus.value = result
      const code = result.code
      if (code === 800) refreshQrCode()
      if (code === 803) {
        pauseQrCodeTimer()
        handlePostLogin(result.cookie)
      }
    })
  },
  2000
)
const qrCodeMessage = computed<string>(() => {
  const table = {
    800: '二维码已失效，请重新扫码',
    802: '扫描成功，请在手机上确认登录',
    803: '登录成功，请稍等...',
  }
  const code = qrCodeStatus.value?.code
  if (code) if (table[code]) return table[code]
  return 'Open NetEase app, scan QR Code to login'
})

// handle phone & email login
const showPassword = ref<boolean>(false)
const email = ref<string>('')
const phone = ref<string>('')
const countryCode = toRef(store.uiStates, 'loginPhoneCountryCode')
const password = ref<string>('')
const login = () => {
  if (method.value === 'phone') doPhoneLogin()
  else doEmailLogin()
}
const doPhoneLogin = async () => {
  let countrycode = 86
  const newCountryCode = countryCode.value.replace('+', '').trim()
  if (Number(newCountryCode) !== NaN) {
    countrycode = Number(newCountryCode)
  }
  const result = await loginWithPhone({
    countrycode,
    phone: phone.value.trim(),
    password: password.value.trim(),
    md5_password: md5(password.value.trim()),
  })
  handlePostLogin(result.cookie)
}
const doEmailLogin = async () => {
  const result = await loginWithEmail({
    email: email.value.trim(),
    md5_password: md5(password.value.trim()),
  })
  handlePostLogin(result.cookie)
}
</script>

<template>
  <div class="grid h-full place-content-center">
    <div class="w-80">
      <div class="flex flex-col">
        <!-- Header -->
        <!-- <div
          class="flex flex-col items-center self-center mb-10 text-2xl font-bold text-gray-700"
        >
          <div class="flex items-center gap-3 mb-6">
            <img
              src="/images/yesplaymusic.png"
              alt="YesPlayMusic"
              class="w-12 h-12"
            />
            <SvgIcon name="x" class="w-6 h-6 text-gray-400" />
            <img
              src="/images/netease-music.png"
              alt="NetEase Music"
              class="w-12 h-12"
            />
          </div>
          Connect to Netease
        </div> -->

        <!-- Qr Code -->
        <div
          v-show="method === 'qrcode'"
          class="flex flex-col items-center justify-center"
        >
          <div class="rounded-3xl border p-6">
            <img :src="qrCode" alt="QR Code" class="no-drag" />
          </div>
          <div class="mt-4 text-sm text-gray-500">
            {{ qrCodeMessage }}
          </div>
        </div>

        <!-- Email input -->
        <div v-show="method === 'email'" class="w-full">
          <div class="mb-1 text-sm font-medium text-gray-700">Email</div>
          <input
            class="w-full rounded-md border border-gray-300 px-2 py-2"
            type="email"
            v-model="email"
          />
        </div>

        <!-- Phone input -->
        <div v-show="method === 'phone'" class="w-full">
          <div class="mb-1 text-sm font-medium text-gray-700">Phone</div>
          <div class="flex w-full">
            <input
              class="rounded-md rounded-r-none border border-r-0 border-gray-300 px-3 py-2"
              :class="{
                'w-14': countryCode.length <= 3,
                'w-16': countryCode.length == 4,
                'w-20': countryCode.length >= 5,
              }"
              type="text"
              v-model="countryCode"
              placeholder="+86"
            />
            <input
              class="flex-grow rounded-md rounded-l-none border border-gray-300 px-3 py-2"
              type="text"
              v-model="phone"
            />
          </div>
        </div>

        <!-- Password input -->
        <div v-show="method !== 'qrcode'" class="mt-3 flex w-full flex-col">
          <div class="mb-1 text-sm font-medium text-gray-700">Password</div>
          <div class="flex w-full">
            <input
              class="w-full rounded-md rounded-r-none border border-r-0 border-gray-300 px-2 py-2"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
            />
            <div
              class="flex items-center justify-center rounded-md rounded-l-none border border-l-0 border-gray-300 pr-1"
            >
              <button
                @click="togglePassword"
                class="cursor-default rounded p-1.5 text-gray-400 transition duration-300 hover:bg-gray-100 hover:text-gray-600"
              >
                <SvgIcon
                  class="h-5 w-5"
                  :name="showPassword ? 'eye-off' : 'eye'"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Login button -->
        <button
          v-show="method !== 'qrcode'"
          @click="login"
          class="my-2 mt-6 flex w-full cursor-default items-center justify-center rounded-lg bg-brand-100 py-2 text-lg font-semibold text-brand-500 transition duration-200"
        >
          Login
        </button>
      </div>

      <!-- Other login methods -->
      <div class="mt-8 mb-4 flex w-full items-center">
        <span class="h-px flex-grow bg-gray-300"></span>
        <span class="mx-2 text-sm text-gray-400">or</span>
        <span class="h-px flex-grow bg-gray-300"></span>
      </div>
      <div class="flex gap-3">
        <button
          v-for="item in otherLoginMethods"
          v-show="method !== item.id"
          @click="changeMethod(item.id)"
          class="flex w-full cursor-default items-center justify-center rounded-lg bg-gray-100 py-2 font-medium text-gray-600 transition duration-300 hover:bg-gray-200 hover:text-gray-800"
        >
          <SvgIcon class="mr-2 h-5 w-5" :name="item.id" />
          <span>{{ item.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
