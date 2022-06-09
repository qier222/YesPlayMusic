import useBreakpoint from '@/web/hooks/useBreakpoint'
import { ReactQueryDevtools } from 'react-query/devtools'
import useIsMobile from '@/web/hooks/useIsMobile'

const Devtool = () => {
  const isMobile = useIsMobile()
  return (
    <ReactQueryDevtools
      initialIsOpen={false}
      toggleButtonProps={{
        style: {
          position: 'fixed',
          bottom: isMobile ? 'auto' : 0,
          right: 0,
          top: isMobile ? 0 : 'auto',
          left: 'auto',
        },
      }}
    />
  )
}

export default Devtool
