import { WindowStateChange } from '@web-scraper/common'
import { Maximize, Minimize, Minus, X } from 'lucide-react'
import { useView } from '~/context/view-context'
import { Button } from './ui/button'

export const WindowStateOptions = () => {
  const view = useView()

  return (
    <div className="flex flex-row items-center gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => window.electronAPI.changeWindowState(WindowStateChange.MINIMIZE)}
      >
        <Minus />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() =>
          window.electronAPI.changeWindowState(
            view.maximized ? WindowStateChange.UNMAXIMIZE : WindowStateChange.MAXIMIZE,
          )
        }
      >
        {view.maximized ? <Minimize /> : <Maximize />}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => window.electronAPI.changeWindowState(WindowStateChange.CLOSE)}
      >
        <X />
      </Button>
    </div>
  )
}
