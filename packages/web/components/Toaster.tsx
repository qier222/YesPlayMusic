import { css, cx } from '@emotion/css'
import { Toaster as ReactHotToaster } from 'react-hot-toast'

const Toaster = () => {
  return (
    <ReactHotToaster
      position='top-center'
      containerStyle={{ top: '80px' }}
      toastOptions={{
        className: cx(
          css`
            border-radius: 99999px !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: #000 !important;
            box-shadow: none !important;
            line-height: unset !important;
            user-select: none !important;
            font-size: 12px !important;
            padding: 10px 16px !important;
            font-weight: 500 !important;
            & div[role='status'] {
              margin: 0 8px !important;
            }
          `
        ),
        success: {
          iconTheme: {
            primary: 'green',
            secondary: '#fff',
          },
        },
      }}
    />
  )
}

export default Toaster
