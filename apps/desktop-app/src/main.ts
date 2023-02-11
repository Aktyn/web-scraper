import path from 'path'

import { app, BrowserWindow } from 'electron'
import isDev from 'electron-is-dev'

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  win
    .loadURL(
      //TODO: update path to file:// according to project structure after build electron app
      isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`,
    )
    .catch(console.error)
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' })
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
