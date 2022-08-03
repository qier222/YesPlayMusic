import { cx, css } from '@emotion/css'
import { useEffect, useState, useMemo } from 'react'
import qrCode from 'qrcode'
import { useQuery } from '@tanstack/react-query'
import { checkLoginQrCodeStatus, fetchLoginQrCodeKey } from '@/web/api/auth'
import toast from 'react-hot-toast'
import { setCookies } from '@/web/utils/cookie'
import uiStates from '@/web/states/uiStates'
import reactQueryClient from '@/web/utils/reactQueryClient'
import { UserApiNames } from '@/shared/api/User'

const QRCode = ({ className, text }: { className?: string; text: string }) => {
  const [image, setImage] = useState<string>('')

  useEffect(() => {
    if (text) {
      qrCode
        .toString(text, {
          margin: 0,
          color: { light: '#ffffff00' },
          type: 'svg',
        })
        .then(image => {
          setImage(image)
        })
    }
  }, [text])

  const encodedImage = useMemo(() => encodeURIComponent(image), [image])

  return (
    <img
      className={cx('aspect-square', className)}
      src={text ? `data:image/svg+xml;utf8,${encodedImage}` : undefined}
    ></img>
  )
}

const LoginWithQRCode = () => {
  const {
    data: key,
    status: keyStatus,
    refetch: refetchKey,
  } = useQuery(
    ['qrCodeKey'],
    async () => {
      const result = await fetchLoginQrCodeKey()
      if (result.data.code !== 200) {
        throw Error(`Failed to fetch QR code key: ${result.data.code}`)
      }
      return result
    },
    {
      cacheTime: 0,
      retry: true,
      retryDelay: 500,
      refetchOnWindowFocus: false,
      refetchInterval: 1000 * 60 * 5, // 5 min
    }
  )

  const { data: status } = useQuery(
    ['qrCodeStatus'],
    async () => checkLoginQrCodeStatus({ key: key?.data?.unikey || '' }),
    {
      refetchInterval: 1000,
      enabled: !!key?.data?.unikey,
      onSuccess: status => {
        switch (status.code) {
          case 800:
            refetchKey()
            break
          case 801:
            // setQrCodeMessage('打开网易云音乐，扫码登录')
            break
          case 802:
            // setQrCodeMessage('等待确认')
            break
          case 803:
            if (!status.cookie) {
              toast('checkLoginQrCodeStatus returned 803 without cookie')
              break
            }
            setCookies(status.cookie)
            reactQueryClient.refetchQueries([UserApiNames.FetchUserAccount])
            uiStates.showLoginPanel = false
            break
        }
      },
    }
  )

  const text = useMemo(
    () =>
      key?.data?.unikey
        ? `https://music.163.com/login?codekey=${key.data.unikey}`
        : '',
    [key?.data?.unikey]
  )

  return (
    <>
      <div className='text-center text-18 font-medium text-white/20'>
        Log in with NetEase QR
      </div>

      <div className='mt-4 rounded-24 bg-white p-2.5'>
        <QRCode
          text={text}
          className={cx(
            'w-full',
            css`
              border-radius: 17px;
            `
          )}
        />
      </div>
    </>
  )
}

export default LoginWithQRCode
