import { type PropsWithChildren } from 'react'
import { ThemeProvider } from '~/components/theme-provider'
import { Toaster } from '~/components/ui/sonner'
import { TooltipProvider } from '~/components/ui/tooltip'
import { NotificationsModule } from '~/modules/notifications-module'

export function GlobalProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <TooltipProvider delayDuration={16} skipDelayDuration={16} disableHoverableContent>
        <NotificationsModule.Provider>{children}</NotificationsModule.Provider>
        <Toaster
          pauseWhenPageIsHidden
          duration={10_000}
          visibleToasts={16}
          expand
          toastOptions={{
            className: 'border backdrop-blur-sm',
            classNames: {
              default: 'border-secondary text-secondary-foreground bg-secondary/20',
              success:
                '!border-success !text-success-foreground !bg-success/80 dark:!bg-success/20',
              error:
                '!border-destructive !text-destructive-foreground !bg-destructive/80 dark:!bg-destructive/20',
              warning:
                '!border-warning !text-warning-foreground !bg-warning/80 dark:!bg-warning/20',
              info: '!border-info !text-info-foreground !bg-info/80 dark:!bg-info/20',
            },
          }}
        />
      </TooltipProvider>
    </ThemeProvider>
  )
}
