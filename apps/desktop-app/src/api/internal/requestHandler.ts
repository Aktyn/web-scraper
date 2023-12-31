import { RendererToElectronMessage, WindowStateChange } from '@web-scraper/common'
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcMain } from 'electron'

import { ExtendedBrowserWindow } from '../../extendedBrowserWindow'

import { dataSourceHandler } from './handlers/dataSource.handler'
import { routineHandler } from './handlers/routine.handler'
import { scraperSessionHandler } from './handlers/scraperSession.handler'
import { siteHandler } from './handlers/site.handler'
import { siteInstructionsHandler } from './handlers/siteInstructions.handler'
import { siteTagHandler } from './handlers/siteTag.handler'
import { userSettingsHandler } from './handlers/userSettings.handler'
import { handleApiRequest, type RequestHandlersSchema, successResponse } from './helpers'

export function registerRequestsHandler() {
  const handler = {
    [RendererToElectronMessage.changeWindowState]: handleApiRequest(
      RendererToElectronMessage.changeWindowState,
      (stateChange) => {
        switch (stateChange) {
          case WindowStateChange.MINIMIZE:
            ExtendedBrowserWindow.getInstances().forEach((window) => window.minimize())
            break
          case WindowStateChange.MAXIMIZE:
            ExtendedBrowserWindow.getInstances().forEach((window) => window.maximize())
            break
          case WindowStateChange.UNMAXIMIZE:
            ExtendedBrowserWindow.getInstances().forEach((window) => window.unmaximize())
            break
          case WindowStateChange.CLOSE:
            ExtendedBrowserWindow.getInstances().forEach((window) => window.close())
            break
        }
        return Promise.resolve(successResponse)
      },
    ),
    ...userSettingsHandler,
    ...dataSourceHandler,
    ...siteTagHandler,
    ...siteHandler,
    ...siteInstructionsHandler,
    ...routineHandler,
    ...scraperSessionHandler,
  } satisfies RequestHandlersSchema

  for (const channel in handler) {
    ipcMain.handle(channel, handler[channel as never])
  }
}
