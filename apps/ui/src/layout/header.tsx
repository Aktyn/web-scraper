import { mdiMenu } from '@mdi/js'
import Icon from '@mdi/react'
import iconDark from '~/assets/icon-dark.svg'
import icon from '~/assets/icon.svg'
import { ModeToggle } from '~/components/mode-toggle'
import { useTheme } from '~/components/theme-provider'
import { Button } from '~/components/ui/button'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { WindowStateOptions } from '~/components/window-state-options'
import { NavigationMenu } from './navigation-menu'

import './header.css'
import { Separator } from '~/components/ui/separator'

export function Header() {
  const { isDark } = useTheme()

  return (
    <div className="shadow-md dark:shadow-lg">
      <div className="header flex w-full flex-row flex-nowrap justify-between items-center p-3 gap-x-4 dark:bg-black/30 bg-black/10 border-b dark:border-border/40">
        <div className="flex-grow hidden md:flex flex-row items-center gap-x-4 border-r border-border/50 pr-4">
          <img src={isDark ? icon : iconDark} className="logo w-10 h-10" alt="Web Scraper logo" />
          <ScrollArea className="w-full">
            <NavigationMenu className="flex-grow" />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {/* TODO */}
          {/* <IconToggle
            tooltipTitle="Toggle desktop notifications"
            options={desktopNotificationsToggleOptions}
            value={!!settings.desktopNotifications}
            onChange={(value) => updateSetting('desktopNotifications', value)}
          /> */}
          <ModeToggle className="ml-auto" />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="inline-flex md:hidden" size="icon" variant="outline">
              <Icon path={mdiMenu} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-auto min-w-64">
            <SheetHeader className="gap-y-4">
              <SheetTitle>
                <ModeToggle />
              </SheetTitle>
              <Separator className="mt-6 mb-4" />
              <SheetDescription className="text-foreground"></SheetDescription>
            </SheetHeader>
            <NavigationMenu className="flex-grow !grid-cols-1 [&_button]:justify-start" />
          </SheetContent>
        </Sheet>
        <WindowStateOptions />
      </div>
    </div>
  )
}
