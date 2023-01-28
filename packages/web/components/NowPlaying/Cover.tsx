import player from '@/web/states/player'
import { resizeImage } from '@/web/utils/common'
import { ease } from '@/web/utils/const'
import { cx } from '@emotion/css'
import { useAnimation, motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnapshot } from 'valtio'
import { subscribeKey } from 'valtio/utils'

const Cover = () => {
  const { track } = useSnapshot(player)
  const [cover, setCover] = useState(track?.al.picUrl)
  const controls = useAnimation()
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = subscribeKey(player, 'track', async () => {
      const coverUrl = player.track?.al.picUrl
      await controls.start({
        opacity: 0,
        transition: { duration: 0.2 },
      })
      setCover(coverUrl)
      if (!coverUrl) return
      const img = new Image()
      img.onload = () => {
        controls.start({
          opacity: 1,
          transition: { duration: 0.2 },
        })
      }
      img.src = coverUrl
    })
    return unsubscribe
  }, [])

  return (
    <motion.img
      animate={controls}
      transition={{ ease }}
      className='absolute inset-0 w-full'
      src={cover}
      onClick={() => {
        const id = track?.al.id
        if (id) navigate(`/album/${id}`)
      }}
    />
  )
}

export default Cover
