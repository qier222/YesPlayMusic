import { createBreakpoint } from 'react-use'

const useBreakpoint = createBreakpoint({
  sm: 767,
  md: 1023,
  lg: 1279,
  xl: 1535,
  '2xl': 1536,
}) as () => 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export default useBreakpoint
