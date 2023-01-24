import { formatDate } from '@/web/utils/common'
import Icon from '@/web/components/Icon'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import useIsMobile from '@/web/hooks/useIsMobile'
import { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const Info = ({
  title,
  creatorName,
  creatorLink,
  description,
  extraInfo,
  isLoading,
}: {
  title?: string
  creatorName?: string
  creatorLink?: string
  description?: string
  extraInfo?: string | ReactNode
  isLoading?: boolean
}) => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  return (
    <div>
      {/* Title */}
      {isLoading ? (
        <div className='mt-2.5  text-28 font-semibold text-transparent lg:mt-0 lg:text-36 lg:font-medium'>
          <span className='rounded-full bg-white/10'>PLACEHOLDER</span>
        </div>
      ) : (
        <div className='mt-2.5 text-28 font-semibold transition-colors duration-300 dark:text-white/80 lg:mt-0 lg:text-36 lg:font-medium'>
          {title}
        </div>
      )}

      {/* Creator */}
      {isLoading ? (
        <div className='mt-2.5 lg:mt-6'>
          <span className='text-24 font-medium text-transparent'>
            <span className='rounded-full bg-white/10'>PLACEHOLDER</span>
          </span>
        </div>
      ) : (
        <div className='mt-2.5 lg:mt-6'>
          <span
            onClick={() => creatorLink && navigate(creatorLink)}
            className='text-24 font-medium transition-colors duration-300 dark:text-white/40 hover:dark:text-neutral-100'
          >
            {creatorName}
          </span>
        </div>
      )}

      {/* Extra info */}
      {isLoading ? (
        <div className='mt-1 flex items-center text-12 font-medium text-transparent lg:text-14 lg:font-bold'>
          <span className='rounded-full bg-white/10'>PLACEHOLDER</span>
        </div>
      ) : (
        <div className='mt-1 flex items-center text-12 font-medium transition-colors duration-300 dark:text-white/40 lg:text-14 lg:font-bold'>
          {extraInfo}
        </div>
      )}

      {/* Description */}
      {!isMobile && description && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='line-clamp-3 mt-6 whitespace-pre-wrap text-14 font-bold dark:text-white/40'
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        ></motion.div>
      )}
    </div>
  )
}

export default Info
