import { mdiWindowClose, mdiWindowMaximize, mdiWindowMinimize, mdiWindowRestore } from '@mdi/js'
import Icon from '@mdi/react'
import { WindowStateChange } from '@web-scraper/common'
import { Button } from './ui/button'
import { useView } from '~/context/view-context'

export const WindowStateOptions = () => {
  const view = useView()

  return (
    <div className="flex flex-row items-center gap-2">
      <Button
        size="icon"
        variant="outline"
        onClick={() => window.electronAPI.changeWindowState(WindowStateChange.MINIMIZE)}
      >
        <Icon path={mdiWindowMinimize} />
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={() =>
          window.electronAPI.changeWindowState(
            view.maximized ? WindowStateChange.UNMAXIMIZE : WindowStateChange.MAXIMIZE,
          )
        }
      >
        {view.maximized ? <Icon path={mdiWindowRestore} /> : <Icon path={mdiWindowMaximize} />}
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={() => window.electronAPI.changeWindowState(WindowStateChange.CLOSE)}
      >
        <Icon path={mdiWindowClose} />
      </Button>
    </div>
  )
}
