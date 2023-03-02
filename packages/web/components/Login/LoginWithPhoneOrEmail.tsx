import { cx, css } from '@emotion/css'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  loginWithEmail,
  LoginWithEmailResponse,
  loginWithPhone,
  LoginWithPhoneResponse,
} from '@/web/api/auth'
import md5 from 'md5'
import toast from 'react-hot-toast'
import { setCookies } from '@/web/utils/cookie'
import { AnimatePresence, motion } from 'framer-motion'
import { ease } from '@/web/utils/const'
import { useSnapshot } from 'valtio'
import uiStates from '@/web/states/uiStates'
import persistedUiStates from '@/web/states/persistedUiStates'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { UserApiNames } from '@/shared/api/User'
import { useTranslation } from 'react-i18next'

const LoginWithPhoneOrEmail = () => {
  const { t, i18n } = useTranslation()
  const isZH = i18n.language.startsWith('zh')

  const { loginPhoneCountryCode, loginType: persistedLoginType } = useSnapshot(persistedUiStates)
  const [email, setEmail] = useState<string>('')
  const [countryCode, setCountryCode] = useState<string>(loginPhoneCountryCode || '+86')
  const [phone, setPhone] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loginType, setLoginType] = useState<'phone' | 'email'>(
    persistedLoginType === 'email' ? 'email' : 'phone'
  )

  const handleAfterLogin = (result: LoginWithEmailResponse | LoginWithPhoneResponse) => {
    if (result?.code !== 200) return
    setCookies(result.cookie)
    reactQueryClient.refetchQueries([UserApiNames.FetchUserAccount])
    uiStates.showLoginPanel = false
  }

  const handleError = (data: any, error: any) => {
    if (data?.code === 200) return
    toast(
      `Login failed: ${
        data?.message ||
        data?.msg ||
        data?.error ||
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        error
      }`
    )
  }

  const doEmailLogin = useMutation(
    () =>
      loginWithEmail({
        email: email.trim(),
        md5_password: md5(password.trim()),
      }),
    { onSuccess: handleAfterLogin, onSettled: handleError }
  )

  const handleEmailLogin = () => {
    if (!email) {
      toast.error('Please enter email')
      return
    }
    if (!password) {
      toast.error('Please enter password')
      return
    }
    if (email.match(/^[^\s@]+@(126|163|yeah|188|vip\.163|vip\.126)\.(com|net)$/) == null) {
      toast.error('Please use netease email')
      return
    }

    doEmailLogin.mutate()
  }

  const doPhoneLogin = useMutation(
    () => {
      return loginWithPhone({
        countrycode: Number(countryCode.replace('+', '').trim()) || 86,
        phone: phone.trim(),
        md5_password: md5(password.trim()),
      })
    },
    { onSuccess: handleAfterLogin, onSettled: handleError }
  )

  const handlePhoneLogin = () => {
    if (!countryCode || !Number(countryCode.replace('+', '').trim())) {
      toast.error('Please enter country code')
      return
    }
    if (!phone) {
      toast.error('Please enter phone number')
      return
    }
    if (!password) {
      toast.error('Please enter password')
      return
    }

    doPhoneLogin.mutate()
  }

  const transition = {
    duration: 0.5,
    ease,
  }
  const variants = {
    hidden: {
      opacity: 0,
      transition,
    },
    show: {
      opacity: 1,
      transition,
    },
  }

  return (
    <>
      <div className='text-center text-18 font-medium text-white/20'>
        {!isZH && 'Login with '}
        <span
          className={cx(
            'transition-colors duration-300',
            loginType === 'phone' ? 'text-brand-600' : 'hover:text-white/70'
          )}
          onClick={() => {
            const type = loginType === 'phone' ? 'email' : 'phone'
            setLoginType(type)
            persistedUiStates.loginType = type
          }}
        >
          {t`auth.phone`}
          {isZH && '登录'}
        </span>
        {' / '}
        <span
          className={cx(
            'transition-colors duration-300',
            loginType === 'email' ? 'text-brand-600' : 'hover:text-white/70'
          )}
          onClick={() => {
            if (loginType !== 'email') setLoginType('email')
          }}
        >
          {t`auth.email`}
          {isZH && '登录'}
        </span>
      </div>

      {/* Phone input */}
      {loginType === 'phone' && (
        <div className='mt-4 rounded-12 bg-black/50 px-3 text-16 font-medium text-night-50'>
          <AnimatePresence>
            <motion.div
              variants={variants}
              initial='hidden'
              animate='show'
              exit='hidden'
              className='flex items-center '
            >
              <input
                onChange={e => {
                  setCountryCode(e.target.value)
                  persistedUiStates.loginPhoneCountryCode = e.target.value
                }}
                className={cx(
                  'my-3.5 flex-shrink-0 bg-transparent placeholder:text-white/30',
                  css`
                    width: 28px;
                  `
                )}
                placeholder='+86'
                value={countryCode}
              />
              <div className='mx-2 h-5 w-px flex-shrink-0 bg-white/20'></div>
              <input
                onChange={e => setPhone(e.target.value)}
                className='my-3.5 flex-grow appearance-none bg-transparent placeholder:text-white/30'
                placeholder={t`auth.phone`}
                type='tel'
                value={phone}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Email input */}
      {loginType === 'email' && (
        <div className='mt-4 flex items-center rounded-12 bg-black/50 px-3 py-3.5 text-16 font-medium text-night-50'>
          <AnimatePresence>
            <motion.div
              variants={variants}
              initial='hidden'
              animate='show'
              exit='hidden'
              className='w-full'
            >
              <input
                onChange={e => setEmail(e.target.value)}
                className='w-full flex-grow appearance-none bg-transparent placeholder:text-white/30'
                placeholder={t`auth.email`}
                type='email'
                value={email}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Password input */}
      <div className='mt-4 flex items-center rounded-12 bg-black/50 p-3 text-16 font-medium text-night-50'>
        <input
          onChange={e => setPassword(e.target.value)}
          className='w-full bg-transparent placeholder:text-white/30'
          placeholder={t`auth.password`}
          type='password'
          value={password}
        />
      </div>

      {/* Login button */}
      <div
        onClick={() => (loginType === 'phone' ? handlePhoneLogin() : handleEmailLogin())}
        className='mt-4 rounded-full bg-brand-700 p-4 text-center text-16 font-medium text-white'
      >
        {t`auth.login`}
      </div>
    </>
  )
}

export default LoginWithPhoneOrEmail
