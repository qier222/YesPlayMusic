import SvgIcon from '@/components/SvgIcon'
import classNames from 'classnames'
import React, { useCallback, useState } from 'react'

export interface ImageConfig {
  /**
   * 指定圓角弧度的 Tailwind CSS Class。
   */
  roundedClass?: string;
  /**
   * 封面圖片的圖片連結。
   */
  imageUrl: string
}

export interface CoverProps extends ImageConfig {
  onClick?: () => void
  showPlayButton?: boolean
  showShadow?: boolean
}

/**
 * 智慧型背景陰影。
 */
export const NeonShadow = ({ roundedClass, imageUrl }: ImageConfig) => (
  <div
    className={classNames(
      'absolute top-2 z-[-1] h-full w-full scale-x-[.92] scale-y-[.96] rounded-xl',
      'bg-cover opacity-0 blur-lg filter transition duration-300 group-hover:opacity-60',
      roundedClass
    )}
    style={{
      backgroundImage: `url("${imageUrl}")`,
    }}
  ></div>
);

/**
 * 無法取得圖片時的預設封面圖。
 */
export const FallbackCover = React.memo(() => (
  <div className='box-content flex items-center justify-center w-full h-full text-gray-300 bg-gray-800 border border-black aspect-square rounded-xl border-opacity-5'>
    <SvgIcon name="music-note" className='w-1/2 h-1/2' />
  </div>
));

/**
 * 封面圖。
 */
export const ImageCover = ({ roundedClass, imageUrl, ...props }: ImageConfig & React.ComponentPropsWithoutRef<'img'>) => (
  <img
    className={classNames(
      'box-content aspect-square h-full w-full border border-black border-opacity-5 dark:border-white  dark:border-opacity-[.03]',
      roundedClass
    )}
    src={imageUrl}
    {...props}
  />
)

export const CenteredPlayButton = React.memo(() => (
  <div className='absolute top-0 hidden w-full h-full place-content-center group-hover:grid'>
    <button className='btn-pressed-animation grid h-11 w-11 cursor-default place-content-center rounded-full border border-white border-opacity-[.08] bg-white bg-opacity-[.14] text-white backdrop-blur backdrop-filter transition-all hover:bg-opacity-[.44]'>
      <SvgIcon className='ml-0.5 h-6 w-6' name='play-fill' />
    </button>
  </div>
));

/**
 * 封面圖。 
 */
export const Cover = ({
  imageUrl,
  onClick,
  roundedClass = 'rounded-xl',
  showPlayButton = false,
  showShadow = true,
}: CoverProps) => {
  const [isError, setIsError] = useState(false)
  const onImageErrorCallback = useCallback(() => imageUrl && setIsError(true), [imageUrl, setIsError]);

  return (
    <section onClick={onClick} className='relative z-0 cover group'>
      {/* Neon Shadow */}
      {showShadow && <NeonShadow roundedClass={roundedClass} imageUrl={imageUrl} />}

      {/* Cover */}
      {isError === false
        ? <ImageCover roundedClass={roundedClass} imageUrl={imageUrl} onError={onImageErrorCallback} />
        : <FallbackCover />}

      {/* Play button */}
      {showPlayButton && <CenteredPlayButton />}
    </section>
  )
}

export default React.memo(Cover)
