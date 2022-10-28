import player from '@/web/states/player'
import { resizeImage } from '@/web/utils/common'
import { ease } from '@/web/utils/const'
import { cx } from '@emotion/css'
import { useAnimation, motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnapshot } from 'valtio'

const Cover = () => {
  const { track } = useSnapshot(player)
  const [cover, setCover] = useState(track?.al.picUrl)
  const animationStartTime = useRef(0)
  const controls = useAnimation()
  const duration = 150 // ms
  const navigate = useNavigate()

  useEffect(() => {
    const resizedCover = resizeImage(track?.al.picUrl || '', 'lg')
    const animate = async () => {
      animationStartTime.current = Date.now()
      await controls.start({ opacity: 0 })
      setCover(resizedCover)
    }
    animate()
  }, [controls, track?.al.picUrl])

  // 防止狂点下一首或上一首造成封面与歌曲不匹配的问题
  useEffect(() => {
    const realCover = resizeImage(track?.al.picUrl ?? '', 'lg')
    if (cover !== realCover) setCover(realCover)
  }, [cover, track?.al.picUrl])

  const onLoad = () => {
    const passedTime = Date.now() - animationStartTime.current
    controls.start({
      opacity: 1,
      transition: {
        delay: passedTime > duration ? 0 : (duration - passedTime) / 1000,
      },
    })
  }

  return (
    <motion.img
      animate={controls}
      transition={{ duration: duration / 1000, ease }}
      className={cx('absolute inset-0 w-full')}
      src={cover}
      onLoad={onLoad}
      onClick={() => {
        const id = track?.al.id
        if (id) navigate(`/album/${id}`)
      }}
    />
  )
}

export default Cover
