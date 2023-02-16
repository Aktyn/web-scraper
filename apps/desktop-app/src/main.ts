import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'

const myEnv = dotenv.config()
dotenvExpand.expand(myEnv)

// eslint-disable-next-line import/order
import path from 'path'

// eslint-disable-next-line import/order
import {
  ElectronToRendererMessage,
  RendererToElectronMessage,
  safePromise,
  wait,
} from '@web-scrapper/common'
import { app, ipcMain } from 'electron'
import isDev from 'electron-is-dev'

import Database from './database'
import { ExtendedBrowserWindow } from './extendedBrowserWindow'
import { Scraper } from './scraper'

// eslint-disable-next-line no-console
console.info(
  'Local database path:',
  path.join(path.resolve('./prisma'), process.env.DATABASE_URL?.replace(/file:/i, '') ?? '.'),
)

function createWindow() {
  const mainWindow = new ExtendedBrowserWindow({
    title: 'Web Scraper',
    // icon: path.join(__dirname, 'assets/icon.png'), //TODO: add icon
    width: 1280,
    height: 720,
    minWidth: 640,
    minHeight: 360,
    useContentSize: true,
    center: true,
    autoHideMenuBar: true,
    backgroundColor: '#00838F',
    roundedCorners: true,
    darkTheme: true,
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

  Database.siteTags.getSiteTags().then((siteTags) => {
    console.log('Tags:', siteTags)
  })

  // Emit dummy event every second
  let tempCounter2 = 0
  setInterval(() => {
    mainWindow.sendMessage(ElectronToRendererMessage.dummyEventFromMain, ++tempCounter2)
  }, 1000)

  // Test scraper
  ;(async () => {
    const scraper = new Scraper()
    await scraper.init()

    await wait(30_000)
    await scraper.destroy()
    // await ScraperBrowser.destroy()
  })()
}

app.whenReady().then(() => {
  createWindow()

  let tempCounter = 0
  ipcMain.handle(RendererToElectronMessage.dummyEvent, () => {
    // eslint-disable-next-line no-console
    console.log('dummyEvent')
    return ++tempCounter
  })

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
