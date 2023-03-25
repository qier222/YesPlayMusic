import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const Devtool = () => {
  return (
    <ReactQueryDevtools
      initialIsOpen={false}
      toggleButtonProps={{
        style: {
          position: 'fixed',
          top: 36,
          right: 148,
          bottom: 'atuo',
          left: 'auto',
        },
      }}
    />
  )
}

export default Devtool
