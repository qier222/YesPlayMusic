import { css, cx } from '@emotion/css'
import { motion } from 'framer-motion'

export interface DropdownItem {
  label: string
  onClick: () => void
}

function Dropdown({ items, onClose }: { items: DropdownItem[]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.1,
        },
      }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={cx(
        'origin-top rounded-12 border border-white/[.06] bg-gray-900/95 p-px py-2.5 shadow-xl outline outline-1 outline-black backdrop-blur-3xl',
        css`
          min-width: 200px;
        `
      )}
    >
      {items.map((item, index) => (
        <div
          className='active:bg-gray/50 relative flex w-full items-center justify-between whitespace-nowrap rounded-[5px] p-3 text-16 font-medium text-neutral-200 transition-colors duration-400 hover:bg-white/[.06]'
          key={index}
          onClick={() => {
            item.onClick()
            onClose()
          }}
        >
          {item.label}
        </div>
      ))}
    </motion.div>
  )
}

export default Dropdown
