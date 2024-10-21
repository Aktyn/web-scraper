import iconDark from '~/assets/icon-dark.svg'
import icon from '~/assets/icon.svg'
import { ModeToggle } from '~/components/mode-toggle'
import { useTheme } from '~/components/theme-provider'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import './header.css'

export function Header() {
  const { isDark } = useTheme()

  return (
    <ScrollArea className="shadow-md dark:shadow-lg">
      <div className="header">
        <img src={isDark ? icon : iconDark} className="logo w-10 h-10" alt="Web Scraper logo" />
        <ModeToggle />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
