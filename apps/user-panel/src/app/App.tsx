import { Suspense, useCallback, useState } from 'react'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import { FullViewLoader } from './components/common/loader/FullViewLoader'
import { Config } from './config'
import { ViewContext, type ViewName, ViewTransitionState } from './context/viewContext'
import { useMounted } from './hooks/useMounted'
import { Layout } from './layout/Layout'
import Navigation from './navigation'
import { baseTheme } from './themes'
import { UserDataProvider } from './userData/UserDataProvider'

const emotionCache = createCache({
  key: 'css',
  prepend: true,
})

export const App = () => {
  const mounted = useMounted()

  const [viewName, setViewName] = useState<ViewName>('DASHBOARD')
  const [previousViewName, setPreviousViewName] = useState<ViewName | null>(null)
  const [nextViewName, setNextViewName] = useState<ViewName | null>(null)
  const [viewTransitionState, setViewTransitionState] = useState(ViewTransitionState.IDLE)

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
          >
            <ViewContext.Provider
              value={{
                viewName,
                previousViewName,
                nextViewName,
                viewTransitionState,
                requestViewChange: handleViewChange,
                viewSettings: currentView.viewSettings,
              }}
            >
              <UserDataProvider>
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
              </UserDataProvider>
            </ViewContext.Provider>
          </SnackbarProvider>
        </CssBaseline>
      </ThemeProvider>
    </CacheProvider>
  )
}
