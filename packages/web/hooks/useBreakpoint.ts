import { createBreakpoint } from 'react-use'

const useBreakpoint = createBreakpoint({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}) as () => 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export default useBreakpoint
