import path from 'path'

import * as dotenv from 'dotenv'
// eslint-disable-next-line import/order
import * as dotenvExpand from 'dotenv-expand'

const myEnv = dotenv.config()
dotenvExpand.expand(myEnv)

// eslint-disable-next-line import/order
import { ElectronToRendererMessage, safePromise } from '@web-scrapper/common'
import { app, shell } from 'electron'
import isDev from 'electron-is-dev'

import { registerRequestsHandler } from './api/internal/requestHandler'
import Database from './database'
import { ExtendedBrowserWindow } from './extendedBrowserWindow'
import { EXTERNAL_DIRECTORY_PATH } from './utils'

// eslint-disable-next-line no-console
console.info(
  'Local database path:',
  path.join(path.resolve('./prisma'), process.env.DATABASE_URL?.replace(/file:/i, '') ?? '.'),
)

function createWindow() {
  const mainWindow = new ExtendedBrowserWindow({
    title: 'Web Scraper',
    icon: path.join(EXTERNAL_DIRECTORY_PATH, 'icon.png'),
    width: 1280,
    height: 720,
    minWidth: 640,
    minHeight: 360,
    useContentSize: true,
    center: true,
    autoHideMenuBar: true,
    backgroundColor: '#0d3235',
    roundedCorners: true,
    darkTheme: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow.webContents.setWindowOpenHandler((data) => {
    shell.openExternal(data.url).catch(console.error)
    return { action: 'deny' }
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

  // Emit dummy event every second TODO: remove this after creating first real use case
  let tempCounter2 = 0
  setInterval(() => {
    mainWindow.sendMessage(ElectronToRendererMessage.dummyEventFromMain, ++tempCounter2)
  }, 1000)

  // Test scraper
  // ;(async () => {
  //   const scraper = new Scraper()
  //   await scraper.init()
  //
  //   await wait(30_000)
  //   await scraper.destroy()
  //   // await ScraperBrowser.destroy()
  // })()
}

app.whenReady().then(() => {
  createWindow()
  registerRequestsHandler()

  app.on('activate', () => {
    if (ExtendedBrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', async () => {
  await safePromise(Database.disconnect())
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
