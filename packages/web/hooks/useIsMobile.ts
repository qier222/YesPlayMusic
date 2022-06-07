import useBreakpoint from './useBreakpoint'

const useIsMobile = () => {
  const breakpoint = useBreakpoint()
  return ['sm', 'md'].includes(breakpoint)
}

export default useIsMobile
