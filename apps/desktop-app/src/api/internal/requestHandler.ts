// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcMain } from 'electron'

import { accountHandler } from './handlers/account.handler'
import { siteHandler } from './handlers/site.handler'
import { siteTagHandler } from './handlers/siteTag.handler'
import { userSettingsHandler } from './handlers/userSettings.handler'
import { type RequestHandlersSchema } from './helpers'

export function registerRequestsHandler() {
  const handler = {
    ...userSettingsHandler,
    ...accountHandler,
    ...siteTagHandler,
    ...siteHandler,
  } satisfies RequestHandlersSchema

  for (const channel in handler) {
    ipcMain.handle(channel, handler[channel as never])
  }
}
