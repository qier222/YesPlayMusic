import { average } from 'color.js'
import { colord } from 'colord'
import SvgIcon from '@/components/SvgIcon'

enum ACTION {
  DISLIKE = 'dislike',
  PLAY = 'play',
  NEXT = 'next',
}

const FMCard = () => {
  const coverUrl =
    'https://p1.music.126.net/lEzPSOjusKaRXKXT3987lQ==/109951166035876388.jpg?param=512y512'
  const [background, setBackground] = useState('')

  useEffect(() => {
    average(coverUrl, { amount: 1, format: 'hex', sample: 1 }).then(color => {
      const to = colord(color as string)
        .darken(0.15)
        .rotate(-5)
        .toHex()
      setBackground(`linear-gradient(to bottom right, ${color}, ${to})`)
    })
  }, [coverUrl])

  return (
    <div
      className='relative flex h-[198px] overflow-hidden rounded-2xl p-4'
      style={{ background }}
    >
      <img className='rounded-lg shadow-2xl' src={coverUrl} />

      <div className='ml-5 flex w-full flex-col justify-between text-white'>
        {/* Track info */}
        <div>
          <div className='text-xl font-semibold'>How Can I Make It OK?</div>
          <div className='opacity-75'>Wolf Alice</div>
        </div>

        <div className='flex items-center justify-between'>
          {/* Actions */}

          <div>
            {Object.values(ACTION).map(action => (
              <button
                key={action}
                className='btn-pressed-animation btn-hover-animation mr-1 cursor-default rounded-lg p-2 transition duration-200 after:bg-white/10'
              >
                <SvgIcon name={action} className='h-5 w-5' />
              </button>
            ))}
          </div>

          {/* FM logo */}
          <div className='right-4 bottom-5 flex text-white opacity-20'>
            <SvgIcon name='fm' className='mr-2 h-5 w-5' />
            <span className='font-semibold'>私人FM</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FMCard
