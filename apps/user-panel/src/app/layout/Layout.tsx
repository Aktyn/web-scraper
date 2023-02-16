import { memo, type PropsWithChildren } from 'react'
import { Stack } from '@mui/material'
import { Footer } from './Footer'
import { Header } from './Header'
import { Menu } from './Menu'

type LayoutProps = PropsWithChildren<object>

export const Layout = memo<LayoutProps>(({ children }) => {
  return (
    <Stack
      width="100vw"
      height="100vh"
      overflow="hidden"
      sx={{
        backgroundColor: (theme) => theme.palette.background.default,
        transition: (theme) => theme.transitions.create('background-color'),
      }}>
      <Header />
      <Stack direction="row" flexGrow={1}>
        <Menu />
        <Stack flexGrow={1}>{children}</Stack>
      </Stack>
      <Footer />
    </Stack>
  )
})
