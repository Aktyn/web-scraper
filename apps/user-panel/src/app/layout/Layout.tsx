import { memo, type PropsWithChildren, useState } from 'react'
import { Box, darken, Stack } from '@mui/material'
import { ElectronToRendererMessage, WindowStateChange } from '@web-scraper/common'
import { BackgroundEffect } from './BackgroundEffect'
import { Footer } from './Footer'
import { Header } from './Header'
import { Menu } from './Menu'
import { commonLayoutTransitions } from './helpers'
import { ViewTransitionState } from '../context/viewContext'
import { useView } from '../hooks/useView'
import { ApiModule } from '../modules/ApiModule'

const nonMaximizedWindowBorderRadius = '1rem'
export const contentAreaBorderRadius = '1rem'
const fadeEffectSize = '2rem'

type LayoutProps = PropsWithChildren<object>

export const Layout = memo<LayoutProps>(({ children }) => {
  const view = useView()

  const [maximized, setMaximized] = useState(false)

  ApiModule.useEvent(ElectronToRendererMessage.windowStateChanged, (_, stateChange) => {
    if (stateChange === WindowStateChange.MAXIMIZE) {
      setMaximized(true)
    }
    if (stateChange === WindowStateChange.UNMAXIMIZE) {
      setMaximized(false)
    }
  })

  return (
    <Box
      overflow="hidden"
      sx={{
        backgroundColor: (theme) => darken(theme.palette.background.default, 0.15),
        transition: commonLayoutTransitions.backgroundColor,

        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateAreas: '"menu header" "menu content" "footer footer"',
        gridTemplateColumns: 'auto 1fr',
        gridTemplateRows: 'auto 1fr auto',
        border: maximized
          ? undefined
          : (theme) => `2px solid ${darken(theme.palette.background.default, 0.25)}`,
        borderRadius: maximized ? '0rem' : nonMaximizedWindowBorderRadius,
      }}
    >
      <Menu />
      <Header maximized={maximized} />
      <Stack
        flexGrow={1}
        overflow="hidden"
        gridArea="content"
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
          transition: commonLayoutTransitions.backgroundColor,
          borderTopLeftRadius: contentAreaBorderRadius,
          borderBottomLeftRadius: contentAreaBorderRadius,

          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            backgroundImage: (theme) =>
              `linear-gradient(0deg, ${
                view.viewSettings?.disableBottomFadeEffect
                  ? 'transparent'
                  : theme.palette.background.default
              } 0, transparent ${fadeEffectSize}, transparent calc(100% - ${fadeEffectSize}), ${
                view.viewSettings?.disableTopFadeEffect
                  ? 'transparent'
                  : theme.palette.background.default
              } 100%)`,
            opacity: view.viewTransitionState !== ViewTransitionState.IDLE ? 0 : 1,
            transition: commonLayoutTransitions.opacity,
          },
        }}
      >
        <BackgroundEffect />
        <Stack flexGrow={1} width="100%" height="100%" zIndex={1}>
          {children}
        </Stack>
      </Stack>
      <Footer />
    </Box>
  )
})
