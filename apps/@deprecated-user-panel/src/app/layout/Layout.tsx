import { memo, type PropsWithChildren } from 'react'
import { Box, GlobalStyles, Stack, backdropClasses, darken } from '@mui/material'
import { BackgroundEffect } from './BackgroundEffect'
import { Footer } from './Footer'
import { Header } from './Header'
import { Menu } from './Menu'
import {
  commonLayoutTransitions,
  contentAreaBorderRadius,
  maximizedWindowBorderRadiusPx,
  nonMaximizedWindowBorderRadius,
} from './helpers'
import { ViewTransitionState } from '../context/viewContext'
import { useView } from '../hooks/useView'

const fadeEffectSize = '2rem'

type LayoutProps = PropsWithChildren<object>

export const Layout = memo<LayoutProps>(({ children }) => {
  const view = useView()

  return (
    <Box
      sx={{
        backgroundColor: (theme) => darken(theme.palette.background.default, 0.15),
        border: view.maximized
          ? undefined
          : (theme) =>
              `${maximizedWindowBorderRadiusPx}px solid ${darken(
                theme.palette.background.default,
                0.25,
              )}`,
        transition: commonLayoutTransitions.backgroundAndBorderColor,

        width: '100vw',
        height: '100vh',
        overflow: view.maximized ? 'hidden' : 'visible',
        display: 'grid',
        gridTemplateAreas: '"menu header" "menu content" "footer footer"',
        gridTemplateColumns: 'auto 1fr',
        gridTemplateRows: 'auto 1fr auto',
        borderRadius: view.maximized ? '0rem' : nonMaximizedWindowBorderRadius,
      }}
    >
      <GlobalStyles
        styles={{
          [`.${backdropClasses.root}`]: {
            borderRadius: view.maximized ? '0rem' : nonMaximizedWindowBorderRadius,
          },
        }}
      />
      <Menu />
      <Header />
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
