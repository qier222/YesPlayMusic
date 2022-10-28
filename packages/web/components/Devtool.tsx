import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import useIsMobile from '@/web/hooks/useIsMobile'

const Devtool = () => {
  const isMobile = useIsMobile()
  return (
    <ReactQueryDevtools
      initialIsOpen={false}
      toggleButtonProps={{
        style: {
          position: 'fixed',
          ...(isMobile
            ? {
                top: 0,
                right: 0,
                bottom: 'auto',
                left: 'atuo',
              }
            : {
                top: 36,
                right: 148,
                bottom: 'atuo',
                left: 'auto',
              }),
        },
      }}
    />
  )
}

export default Devtool
