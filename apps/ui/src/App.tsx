import { ElectronToRendererMessage, WindowStateChange } from '@web-scraper/common'
import { Fragment, useState } from 'react'
import { Toaster } from './components/ui/sonner'
import { GlobalProviders } from './context/global-providers'
import { ViewContext } from './context/view-context'
import { usePersistentState } from './hooks/usePersistentState'
import { Layout } from './layout/layout'
import { ViewContainer } from './layout/view-container'
import { ApiModule } from './modules/api-module'
import { NAVIGATION, View } from './navigation'

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

  const mainViewIndex = NAVIGATION.findIndex(
    (item) => item.view === view || item.subViews.some((subView) => subView.view === view),
  )

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
            className="grid grid-rows-1 h-full overflow-hidden transition-transform duration-500 relative"
            style={{
              width: `${NAVIGATION.length * 100}vw`,
              gridTemplateColumns: `repeat(${NAVIGATION.length}, 1fr)`,
              transform: `translateX(-${mainViewIndex * 100}vw)`,
            }}
          >
            {NAVIGATION.map((item, index) => (
              <Fragment key={item.view}>
                <ViewContainer
                  key={item.view}
                  component={item.component}
                  active={view === item.view}
                />
                {item.subViews.map((subView) => (
                  <ViewContainer
                    key={subView.view}
                    component={subView.component}
                    active={view === subView.view}
                    className="absolute top-0"
                    style={{ left: `${index * 100}vw` }}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </Layout>
        <Toaster />
      </ViewContext.Provider>
    </GlobalProviders>
  )
}
