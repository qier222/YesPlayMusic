import { formatDate } from '@/web/utils/common'
import Icon from '@/web/components/Icon'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import useIsMobile from '@/web/hooks/useIsMobile'
import { ReactNode } from 'react'

const Info = ({
  title,
  creatorName,
  creatorLink,
  description,
  extraInfo,
}: {
  title?: string
  creatorName?: string
  creatorLink?: string
  description?: string
  extraInfo?: string | ReactNode
}) => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  return (
    <div>
      {/* Title */}
      <div className='mt-2.5 text-28 font-semibold dark:text-white/80 lg:mt-0 lg:text-36 lg:font-medium'>
        {title}
      </div>

      {/* Creator */}
      <div className='mt-2.5 lg:mt-6'>
        <span
          onClick={() => creatorLink && navigate(creatorLink)}
          className='text-24 font-medium transition-colors duration-300 dark:text-white/40 hover:dark:text-neutral-100 '
        >
          {creatorName}
        </span>
      </div>

      {/* Extra info */}
      <div className='mt-1 flex items-center text-12 font-medium dark:text-white/40 lg:text-14 lg:font-bold'>
        {extraInfo}
      </div>

      {/* Description */}
      {!isMobile && (
        <div
          className='line-clamp-3 mt-6 whitespace-pre-wrap text-14 font-bold dark:text-white/40'
          dangerouslySetInnerHTML={{
            __html: description || '',
          }}
        ></div>
      )}
    </div>
  )
}

export default Info
