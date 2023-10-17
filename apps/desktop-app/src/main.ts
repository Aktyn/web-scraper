import path from 'path'
import url from 'url'

import * as dotenv from 'dotenv'
// eslint-disable-next-line import/order
import * as dotenvExpand from 'dotenv-expand'

const myEnv = dotenv.config()
dotenvExpand.expand(myEnv)

// eslint-disable-next-line import/order
import { safePromise } from '@web-scraper/common'
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, shell } from 'electron'
import isDev from 'electron-is-dev'

import { registerRequestsHandler } from './api/internal/requestHandler'
import Database from './database'
import { ExtendedBrowserWindow } from './extendedBrowserWindow'
import { Scraper } from './scraper'
import { EXTERNAL_DIRECTORY_PATH } from './utils'

function createWindow() {
  const mainWindow = new ExtendedBrowserWindow({
    title: 'Web Scraper',
    icon: path.join(EXTERNAL_DIRECTORY_PATH, 'icon.png'),
    width: 1280,
    height: 720,
    minWidth: 640,
    minHeight: 360,
    frame: false,
    useContentSize: true,
    center: true,
    autoHideMenuBar: true,
    backgroundColor: '#0d323500',
    transparent: true,
    roundedCorners: true,
    darkTheme: true,
    maximizable: true,
    minimizable: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow.once('ready-to-show', () => {
    if (!isDev) {
      mainWindow.maximize()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((data) => {
    shell.openExternal(data.url).catch(console.error)
    return { action: 'deny' }
  })

  mainWindow
    .loadURL(
      isDev
        ? 'http://localhost:3000'
        : url.pathToFileURL(path.join(__dirname, '../user-panel-build/index.html')).href,
    )
    .catch(console.error)

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'bottom' })
  }
}

void app.whenReady().then(() => {
  createWindow()
  registerRequestsHandler()

  app.on('activate', () => {
    if (ExtendedBrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', async () => {
  for (const instance of Scraper.getAllInstances()) {
    await safePromise(instance.destroy(true))
  }

  await safePromise(Database.disconnect())
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
