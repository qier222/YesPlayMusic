import useBreakpoint from '@/web/hooks/useBreakpoint'
import { ReactQueryDevtools } from 'react-query/devtools'

const Devtool = () => {
  const breakpoint = useBreakpoint()
  const isMobile = ['sm', 'md'].includes(breakpoint)
  return (
    <ReactQueryDevtools
      initialIsOpen={false}
      toggleButtonProps={{
        style: {
          position: 'fixed',
          bottom: isMobile ? 'auto' : 0,
          right: 0,
          top: isMobile ? 0 : 1,
          left: 'auto',
        },
      }}
    />
  )
}

export default Devtool
