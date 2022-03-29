import '../packages/renderer/src/styles/global.scss'

import type { ReactNode } from 'react';

type AppProps = {
  Component: ReactNode;
};

function App({ Component }: AppProps) {
  return <Component />;
}

App.displayName = 'VitebookApp';

export default App;
