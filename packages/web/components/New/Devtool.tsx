import { ReactQueryDevtools } from 'react-query/devtools'

const Devtool = () => {
  return (
    <ReactQueryDevtools
      initialIsOpen={false}
      toggleButtonProps={{
        style: {
          position: 'fixed',
          bottom: 0,
          right: 0,
          left: 'auto',
        },
      }}
    />
  )
}

export default Devtool
