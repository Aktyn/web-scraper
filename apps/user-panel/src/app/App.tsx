import { Suspense, useCallback, useState } from 'react'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { CloseRounded } from '@mui/icons-material'
import { CssBaseline, IconButton, ThemeProvider } from '@mui/material'
import { ElectronToRendererMessage, WindowStateChange } from '@web-scraper/common'
import { SnackbarProvider, closeSnackbar } from 'notistack'
import { FullViewLoader } from './components/common/loader/FullViewLoader'
import { Config } from './config'
import { ViewContext, ViewTransitionState, type ViewName } from './context/viewContext'
import { useMounted } from './hooks/useMounted'
import { usePersistentState } from './hooks/usePersistentState'
import { Layout } from './layout/Layout'
import { ApiModule } from './modules/ApiModule'
import { NotificationsModule } from './modules/NotificationsModule'
import { ScraperExecutionModule } from './modules/ScraperExecutionModule'
import { ScraperTestingSessionsModule } from './modules/ScraperTestingSessionsModule'
import { Navigation } from './navigation'
import { baseTheme } from './themes'
import { UserDataProvider } from './userData/UserDataProvider'

const emotionCache = createCache({
  key: 'css',
  prepend: true,
})

export const App = () => {
  return (
    <ApiModule.Provider>
      <ViewBase />
    </ApiModule.Provider>
  )
}

function ViewBase() {
  const mounted = useMounted()

  const [viewName, setViewName] = useState<ViewName>('DATA_MANAGER') //TODO: restore DASHBOARD
  const [previousViewName, setPreviousViewName] = useState<ViewName | null>(null)
  const [nextViewName, setNextViewName] = useState<ViewName | null>(null)
  const [viewTransitionState, setViewTransitionState] = useState(ViewTransitionState.IDLE)
  const [maximized, setMaximized] = usePersistentState('window-maximized', 'false', sessionStorage)

  const currentView = Navigation[viewName]
  const nextView = nextViewName ? Navigation[nextViewName] : null

  const handleViewChange = useCallback(
    (viewName: ViewName) => {
      if (viewTransitionState !== ViewTransitionState.IDLE) {
        return
      }

      setNextViewName(viewName)
      setViewTransitionState(ViewTransitionState.LEAVING)

      const onViewLeavingTransitionEnd = () => {
        if (!mounted.current) {
          return
        }
        setViewTransitionState(ViewTransitionState.ENTERING)
        setNextViewName(null)
        setViewName((previous) => {
          setPreviousViewName(previous)
          return viewName
        })
        setTimeout(onViewEnteringTransitionEnd, Config.VIEW_TRANSITION_DURATION / 2)
      }

      const onViewEnteringTransitionEnd = () => {
        if (!mounted.current) {
          return
        }
        setViewTransitionState(ViewTransitionState.IDLE)
      }

      setTimeout(onViewLeavingTransitionEnd, Config.VIEW_TRANSITION_DURATION / 2)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewTransitionState],
  )

  ApiModule.useEvent(ElectronToRendererMessage.windowStateChanged, (_, stateChange) => {
    if (stateChange === WindowStateChange.MAXIMIZE) {
      setMaximized('true')
    }
    if (stateChange === WindowStateChange.UNMAXIMIZE) {
      setMaximized('false')
    }
  })

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={currentView.theme ?? baseTheme}>
        <CssBaseline>
          <SnackbarProvider
            maxSnack={10}
            autoHideDuration={5000}
            anchorOrigin={{
              horizontal: 'center',
              vertical: 'top',
            }}
            action={(key) => (
              <IconButton onClick={() => key && closeSnackbar(key)}>
                <CloseRounded />
              </IconButton>
            )}
          >
            <ViewContext.Provider
              value={{
                viewName,
                previousViewName,
                nextViewName,
                viewTransitionState,
                requestViewChange: handleViewChange,
                viewSettings: currentView.viewSettings,
                maximized: maximized === 'true',
              }}
            >
              <UserDataProvider>
                <NotificationsModule.Provider>
                  <ScraperTestingSessionsModule.Provider>
                    <ScraperExecutionModule.Provider>
                      <Layout>
                        <Suspense fallback={<FullViewLoader />}>
                          <currentView.component key={viewName} />
                        </Suspense>
                        {nextView && (
                          // Preloads next view file
                          <Suspense fallback={null}>
                            <nextView.component key={nextViewName} doNotRender />
                          </Suspense>
                        )}
                      </Layout>
                    </ScraperExecutionModule.Provider>
                  </ScraperTestingSessionsModule.Provider>
                </NotificationsModule.Provider>
              </UserDataProvider>
            </ViewContext.Provider>
          </SnackbarProvider>
        </CssBaseline>
      </ThemeProvider>
    </CacheProvider>
  )
}
