import path from 'path'

import { app, BrowserWindow, ipcMain } from 'electron'
import isDev from 'electron-is-dev'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 720,
    title: 'Web Scraper',
    webPreferences: {
      // nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow
    .loadURL(
      //TODO: update path to file:// according to project structure after build electron app
      isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`,
    )
    .catch(console.error)

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'bottom' })
  }

  let tempCounter = 0
  ipcMain.handle('dummyEvent', () => {
    // eslint-disable-next-line no-console
    console.log('dummyEvent')
    return tempCounter++
  })

  // Emit dummy event every second
  let tempCounter2 = 0
  setInterval(() => {
    mainWindow.webContents.send('dummyEventFromMain', tempCounter2++)
  }, 1000)
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
