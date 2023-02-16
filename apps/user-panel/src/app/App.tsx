import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { Suspense, useCallback, useMemo, useState } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import deepmerge from 'deepmerge'
import { Config } from './config'
import { type ViewName, ViewTransitionState, ViewContext } from './context/viewContext'
import { useMounted } from './hooks/useMounted'
import { Layout } from './layout/Layout'
import Navigation from './navigation'
import { baseTheme } from './themes'

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
    [],
  )

  const theme = useMemo(() => {
    if (!currentView.theme) {
      return baseTheme
    }

    return deepmerge(baseTheme, currentView.theme)
  }, [currentView.theme])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ViewContext.Provider
        value={{
          viewName,
          previousViewName,
          nextViewName,
          viewTransitionState,
          requestViewChange: handleViewChange,
        }}>
        <Layout>
          {/*TODO: better suspense fallback*/}
          <Suspense fallback={<div>Loading...</div>}>
            <currentView.component />
          </Suspense>
          {nextView && (
            // Preloads next view file
            <div style={{ display: 'none' }}>
              <Suspense fallback={null}>
                <nextView.component />
              </Suspense>
            </div>
          )}
        </Layout>
      </ViewContext.Provider>
    </ThemeProvider>
  )
}
