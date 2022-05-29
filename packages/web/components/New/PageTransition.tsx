import { motion } from 'framer-motion'
import { ease } from '@/web/utils/const'

const PageTransition = ({
  children,
  disableEnterAnimation,
}: {
  children: React.ReactNode
  disableEnterAnimation?: boolean
}) => {
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
