import { PropsWithChildren } from 'react'
import { ThemeProvider } from '~/components/theme-provider'
import { TooltipProvider } from '~/components/ui/tooltip'
import { NotificationsModule } from '~/modules/notifications-module'

export function GlobalProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider delayDuration={0}>
        <NotificationsModule.Provider>{children}</NotificationsModule.Provider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
