import { memo, type PropsWithChildren } from 'react'
import { Box, darken, Stack } from '@mui/material'
import { Footer } from './Footer'
import { Header } from './Header'
import { Menu } from './Menu'

export const contentAreaBorderRadius = '1rem'

type LayoutProps = PropsWithChildren<object>

export const Layout = memo<LayoutProps>(({ children }) => {
  return (
    <Box
      overflow="hidden"
      sx={{
        backgroundColor: (theme) => darken(theme.palette.background.default, 0.2),
        transition: (theme) => theme.transitions.create('background-color'),

        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateAreas: '"menu header" "menu content" "footer footer"',
        gridTemplateColumns: 'auto 1fr',
        gridTemplateRows: 'auto 1fr auto',
      }}
    >
      <Menu />
      <Header />
      <Stack
        flexGrow={1}
        overflow="auto"
        gridArea="content"
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
          transition: (theme) => theme.transitions.create('background-color'),
          borderTopLeftRadius: contentAreaBorderRadius,
          borderBottomLeftRadius: contentAreaBorderRadius,
        }}
      >
        {children}
      </Stack>
      <Footer />
    </Box>
  )
  // return (
  //   <Stack
  //     width="100vw"
  //     height="100vh"
  //     overflow="hidden"
  //     sx={{
  //       backgroundColor: (theme) => darken(theme.palette.background.default, 0.2),
  //       transition: (theme) => theme.transitions.create('background-color'),
  //     }}>
  //     <Stack direction="row" flexGrow={1}>
  //       <Menu />
  //       <Stack flexGrow={1}>
  //         <Header />
  //         <Stack
  //           flexGrow={1}
  //           overflow="auto"
  //           sx={{
  //             backgroundColor: (theme) => theme.palette.background.default,
  //             transition: (theme) => theme.transitions.create('background-color'),
  //             borderTopLeftRadius: contentAreaBorderRadius,
  //             borderBottomLeftRadius: contentAreaBorderRadius,
  //           }}>
  //           {children}
  //         </Stack>
  //       </Stack>
  //     </Stack>
  //     <Footer />
  //   </Stack>
  // )
})
