import { cx, css } from '@emotion/css'
import { useEffect, useRef, useState, useMemo } from 'react'
import qrCode from 'qrcode'

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
          console.log(image)
        })
    }
  }, [text])

  const encodedImage = useMemo(() => encodeURIComponent(image), [image])

  return (
    <img
      className={cx('', className)}
      src={`data:image/svg+xml;utf8,${encodedImage}`}
    ></img>
  )
}

const Login = () => {
  return <div></div>
  return (
    <div className='fixed inset-0 z-30 flex justify-center rounded-24 bg-black/80 pt-56 backdrop-blur-3xl'>
      <div className='flex flex-col items-center'>
        <div
          className={cx(
            'rounded-48 bg-white/10 p-9',
            css`
              width: 392px;
              height: fit-content;
            `
          )}
        >
          <div className='text-center text-18 font-medium text-night-600'>
            Log in with NetEase QR
          </div>

          <div className='mt-4 rounded-24 bg-white p-2.5'>
            <QRCode
              text='tetesoahfoahdodaoshdoaish'
              className={css`
                border-radius: 17px;
              `}
            />
          </div>

          <div className='mt-4 flex items-center'>
            <div className='h-px flex-grow bg-white/20'></div>
            <div className='mx-2 text-16 font-medium text-white'>or</div>
            <div className='h-px flex-grow bg-white/20'></div>
          </div>

          <div className='mt-4 flex justify-center'>
            <button className='text-16 font-medium text-night-50'>
              Use Phone or Email
            </button>
          </div>
        </div>

        {/* Close */}
        <div className='mt-10 h-14 w-14 rounded-full bg-white/10'></div>
      </div>
    </div>
  )
}

export default Login
