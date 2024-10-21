import { ElectronToRendererMessage, WindowStateChange } from '@web-scraper/common'
import { Button } from './components/ui/button'
import { GlobalProviders } from './context/global-providers'
import { ViewContext } from './context/view-context'
import { usePersistentState } from './hooks/usePersistentState'
import { Layout } from './layout/layout'
import { ApiModule } from './modules/api-module'
import { Toaster } from './components/ui/sonner'
import { toast } from 'sonner'

export function App() {
  return (
    <ApiModule.Provider>
      <ViewBase />
    </ApiModule.Provider>
  )
}

function ViewBase() {
  const [maximized, setMaximized] = usePersistentState('window-maximized', 'false', sessionStorage)

  ApiModule.useEvent(ElectronToRendererMessage.windowStateChanged, (_, stateChange) => {
    if (stateChange === WindowStateChange.MAXIMIZE) {
      setMaximized('true')
    }
    if (stateChange === WindowStateChange.UNMAXIMIZE) {
      setMaximized('false')
    }
  })

  return (
    <GlobalProviders>
      <ViewContext.Provider
        value={{
          // viewName,
          // previousViewName,
          // nextViewName,
          // viewTransitionState,
          // requestViewChange: handleViewChange,
          // viewSettings: currentView.viewSettings,
          maximized: maximized === 'true',
        }}
      >
        <Layout>
          <h1>Web Scraper</h1>
          <Button onClick={() => toast('Hello, world!')}>Test</Button>
        </Layout>
        <Toaster />
      </ViewContext.Provider>
    </GlobalProviders>
  )
}
