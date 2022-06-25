import { cx, css } from '@emotion/css'
import { useState } from 'react'
import { state } from '@/web/store'
import { useMutation } from 'react-query'
import { loginWithEmail, loginWithPhone } from '@/web/api/auth'
import md5 from 'md5'
import toast from 'react-hot-toast'
import { setCookies } from '@/web/utils/cookie'
import { AnimatePresence, motion } from 'framer-motion'
import { ease } from '@/web/utils/const'
import { useSnapshot } from 'valtio'

const LoginWithPhoneOrEmail = () => {
  const { persistedUiStates } = useSnapshot(state)
  const [email, setEmail] = useState<string>('')
  const [countryCode, setCountryCode] = useState<string>(
    persistedUiStates.loginPhoneCountryCode || '+86'
  )
  const [phone, setPhone] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loginType, setLoginType] = useState<'phone' | 'email'>(
    persistedUiStates.loginType === 'email' ? 'email' : 'phone'
  )

  const doEmailLogin = useMutation(
    () =>
      loginWithEmail({
        email: email.trim(),
        md5_password: md5(password.trim()),
      }),
    {
      onSuccess: result => {
        if (result?.code !== 200) {
          toast(`Login failed: ${result.code}`)
          return
        }
        setCookies(result.cookie)

        state.uiStates.showLoginPanel = false
      },
      onError: error => {
        toast(`Login failed: ${error}`)
      },
    }
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
    if (
      email.match(
        /^[^\s@]+@(126|163|yeah|188|vip\.163|vip\.126)\.(com|net)$/
      ) == null
    ) {
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
    {
      onSuccess: result => {
        if (result?.code !== 200) {
          toast(`Login failed: ${result.code}`)
          return
        }
        setCookies(result.cookie)
        state.uiStates.showLoginPanel = false
      },
      onError: error => {
        toast(`Login failed: ${error}`)
      },
    }
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
      <div className='text-center text-18 font-medium text-night-600'>
        Log in with{' '}
        <span
          className={cx(
            'transition-colors duration-300',
            loginType === 'phone' ? 'text-brand-600' : 'hover:text-night-50'
          )}
          onClick={() => {
            const type = loginType === 'phone' ? 'email' : 'phone'
            setLoginType(type)
            state.persistedUiStates.loginType = type
          }}
        >
          Phone
        </span>{' '}
        /{' '}
        <span
          className={cx(
            'transition-colors duration-300',
            loginType === 'email' ? 'text-brand-600' : 'hover:text-night-50'
          )}
          onClick={() => {
            if (loginType !== 'email') setLoginType('email')
          }}
        >
          Email
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
              className='flex items-center'
            >
              <input
                onChange={e => {
                  setCountryCode(e.target.value)
                  state.persistedUiStates.loginPhoneCountryCode = e.target.value
                }}
                className={cx(
                  'my-3.5 flex-shrink-0 bg-transparent',
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
                className='my-3.5 flex-grow appearance-none bg-transparent'
                placeholder='Phone'
                type='number'
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
            >
              <input
                onChange={e => setEmail(e.target.value)}
                className='flex-grow appearance-none bg-transparent'
                placeholder='Email'
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
          className='bg-transparent'
          placeholder='Password'
          type='password'
          value={password}
        />
      </div>

      {/* Login button */}
      <div
        onClick={() =>
          loginType === 'phone' ? handlePhoneLogin() : handleEmailLogin()
        }
        className='mt-4 rounded-full bg-brand-700 p-4 text-center text-16 font-medium text-white'
      >
        LOG IN
      </div>
    </>
  )
}

export default LoginWithPhoneOrEmail
