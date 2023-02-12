import path from 'path'

import { ElectronToRendererMessage, RendererToElectronMessage } from '@web-scrapper/common'
import { app, ipcMain } from 'electron'
import isDev from 'electron-is-dev'

import { ExtendedBrowserWindow } from './extendedBrowserWindow'

// import './types/electronApiDeclaration'

function createWindow() {
  const mainWindow = new ExtendedBrowserWindow({
    width: 1024,
    height: 720,
    title: 'Web Scraper',
    webPreferences: {
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

  // Emit dummy event every second
  let tempCounter2 = 0
  setInterval(() => {
    mainWindow.sendMessage(ElectronToRendererMessage.dummyEventFromMain, tempCounter2++)
  }, 1000)
}

app.whenReady().then(() => {
  createWindow()

  let tempCounter = 0
  ipcMain.handle(RendererToElectronMessage.dummyEvent, () => {
    // eslint-disable-next-line no-console
    console.log('dummyEvent')
    return tempCounter++
  })

  app.on('activate', () => {
    if (ExtendedBrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
