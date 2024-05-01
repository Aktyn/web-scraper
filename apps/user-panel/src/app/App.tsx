import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { CloseRounded } from '@mui/icons-material'
import { CssBaseline, IconButton, Stack, ThemeProvider } from '@mui/material'
import { ElectronToRendererMessage, WindowStateChange } from '@web-scraper/common'
import anime from 'animejs'
import deepmerge from 'deepmerge'
import { SnackbarProvider, closeSnackbar } from 'notistack'
import { FullViewLoader } from './components/common/loader/FullViewLoader'
import { AktynLogoIcon } from './components/icons/AktynLogoIcon'
import { Config } from './config'
import { defaultUserSettings } from './context/userDataContext'
import { ViewContext, ViewTransitionState, type ViewName } from './context/viewContext'
import { useDebounce } from './hooks/useDebounce'
import { useMounted } from './hooks/useMounted'
import { usePersistentState } from './hooks/usePersistentState'
import { Layout } from './layout/Layout'
import { ApiModule } from './modules/ApiModule'
import { NotificationsModule } from './modules/NotificationsModule'
import { ScraperExecutionModule } from './modules/ScraperExecutionModule'
import { ScraperTestingSessionsModule } from './modules/ScraperTestingSessionsModule'
import { Navigation } from './navigation'
import { baseTheme, updateThemes } from './themes'
import { UserDataProvider, type UserDataProviderProps } from './userData/UserDataProvider'

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
  const logoContainerRef = useRef<HTMLDivElement>(null)

  const [viewName, setViewName] = useState<ViewName>('ROUTINES') //TODO: restore DASHBOARD
  const [previousViewName, setPreviousViewName] = useState<ViewName | null>(null)
  const [nextViewName, setNextViewName] = useState<ViewName | null>(null)
  const [viewTransitionState, setViewTransitionState] = useState(ViewTransitionState.IDLE)
  const [maximized, setMaximized] = usePersistentState('window-maximized', 'false', sessionStorage)
  const [loadingUserData, setLoadingUserData] = useState(true)
  const [backgroundSaturation, setBackgroundSaturation] = useState(
    defaultUserSettings.backgroundSaturation,
  )

  const setBackgroundSaturationDebounce = useDebounce(setBackgroundSaturation, 200, [
    setBackgroundSaturation,
  ])

  const currentView = useMemo(
    () => deepmerge({}, Navigation[viewName]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewName, backgroundSaturation],
  )
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

  const handleUserDataChange = useCallback<Required<UserDataProviderProps>['onChange']>(
    (userSettings, reason) => {
      if (typeof userSettings.backgroundSaturation === 'number') {
        updateThemes(userSettings.backgroundSaturation)
        setBackgroundSaturationDebounce(userSettings.backgroundSaturation)
      }
      if (reason === 'loaded') {
        setLoadingUserData(false)
      }
    },
    [setBackgroundSaturationDebounce],
  )

  useEffect(() => {
    anime({
      targets: logoContainerRef.current?.querySelector('svg'),
      scale: [3, 1],
      opacity: [0, 1],
      easing: 'spring(0.7, 100, 10, 0)',
    })
  }, [])

  useEffect(() => {
    const containerElement = logoContainerRef.current
    if (!containerElement) {
      return
    }

    anime.remove(containerElement)
    anime({
      targets: containerElement,
      opacity: loadingUserData ? 1 : 0,
      delay: process.env.NODE_ENV === 'development' ? 0 : 500,
      easing: 'easeInOutQuad',
      duration: 500,
    })
  }, [loadingUserData])

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider key={Number(loadingUserData)} theme={currentView.theme ?? baseTheme}>
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
              <UserDataProvider onChange={handleUserDataChange}>
                <NotificationsModule.Provider>
                  <ScraperTestingSessionsModule.Provider>
                    <ScraperExecutionModule.Provider>
                      {!loadingUserData && (
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
                      )}
                      <Stack
                        ref={logoContainerRef}
                        position="fixed"
                        top={0}
                        left={0}
                        width="100vw"
                        height="100vh"
                        alignItems="center"
                        justifyContent="center"
                        bgcolor="#1b2632"
                        zIndex={99}
                        sx={{ pointerEvents: 'none' }}
                      >
                        <AktynLogoIcon
                          sx={{
                            maxWidth: '14rem',
                            maxHeight: '14rem',
                            width: 'auto',
                            height: 'auto',
                          }}
                        />
                      </Stack>
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
