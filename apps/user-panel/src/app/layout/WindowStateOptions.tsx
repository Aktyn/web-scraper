import { IconButton, Stack } from '@mui/material'
import { WindowStateChange } from '@web-scraper/common'
import { CloseWindowIcon } from '../components/icons/CloseWindowIcon'
import { MaximizeWindowIcon } from '../components/icons/MaximizeWindowIcon'
import { MinimizeWindowIcon } from '../components/icons/MinimizeWindowIcon'
import { RestoreWindowIcon } from '../components/icons/RestoreWindowIcon'
import { useView } from '../hooks/useView'

export const WindowStateOptions = () => {
  const view = useView()

  return (
    <Stack direction="row" alignItems="center" gap={2}>
      <IconButton
        size="small"
        onClick={() => window.electronAPI.changeWindowState(WindowStateChange.MINIMIZE)}
      >
        <MinimizeWindowIcon fontSize="inherit" />
      </IconButton>
      <IconButton
        size="small"
        onClick={() =>
          window.electronAPI.changeWindowState(
            view.maximized ? WindowStateChange.UNMAXIMIZE : WindowStateChange.MAXIMIZE,
          )
        }
      >
        {view.maximized ? (
          <RestoreWindowIcon fontSize="inherit" />
        ) : (
          <MaximizeWindowIcon fontSize="inherit" />
        )}
      </IconButton>
      <IconButton
        size="small"
        onClick={() => window.electronAPI.changeWindowState(WindowStateChange.CLOSE)}
      >
        <CloseWindowIcon fontSize="inherit" />
      </IconButton>
    </Stack>
  )
}
