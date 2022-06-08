import { motion } from 'framer-motion'
import { ease } from '@/web/utils/const'
import useIsMobile from '@/web/hooks/useIsMobile'

const PageTransition = ({
  children,
  disableEnterAnimation,
}: {
  children: React.ReactNode
  disableEnterAnimation?: boolean
}) => {
  const isMobile = useIsMobile()
  if (isMobile) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: disableEnterAnimation ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
