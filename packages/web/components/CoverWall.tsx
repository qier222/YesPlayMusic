import cx from 'classnames'

const bigCover = [0, 2, 3, 8, 9, 11, 16, 18, 24, 26, 27]

const CoverWall = ({ covers }: { covers: string[] }) => {
  return (
    <div className='grid auto-rows-auto grid-cols-8 gap-[13px]	'>
      {covers.map((cover, index) => (
        <img
          src={cover}
          key={cover}
          className={cx(
            'rounded-3xl',
            bigCover.includes(index) && 'col-span-2 row-span-2'
          )}
        />
      ))}
    </div>
  )
}

export default CoverWall
