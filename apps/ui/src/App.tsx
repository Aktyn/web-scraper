import { ElectronToRendererMessage, WindowStateChange } from '@web-scraper/common'
import { useState } from 'react'
import { Toaster } from './components/ui/sonner'
import { GlobalProviders } from './context/global-providers'
import { ViewContext } from './context/view-context'
import { usePersistentState } from './hooks/usePersistentState'
import { Layout } from './layout/layout'
import { ViewContainer } from './layout/view-container'
import { ApiModule } from './modules/api-module'
import { Navigation, View } from './navigation'

export function App() {
  return (
    <ApiModule.Provider>
      <ViewBase />
    </ApiModule.Provider>
  )
}

function ViewBase() {
  const [maximized, setMaximized] = usePersistentState('window-maximized', 'false', sessionStorage)
  const [view, setView] = useState(View.DASHBOARD)

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
          view,
          setView,
          maximized: maximized === 'true',
        }}
      >
        <Layout>
          <div
            className="grid grid-rows-1 h-full overflow-hidden transition-transform duration-500"
            style={{
              width: `${Navigation.length * 100}vw`,
              gridTemplateColumns: `repeat(${Navigation.length}, 1fr)`,
              transform: `translateX(-${view * 100}vw)`,
            }}
          >
            {Navigation.map((item) => (
              <ViewContainer key={item.view} navigationItem={item} active={view === item.view} />
            ))}
          </div>
        </Layout>
        <Toaster />
      </ViewContext.Provider>
    </GlobalProviders>
  )
}
