import { RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { handleApiRequest, type RequestHandlersSchema, successResponse } from '../helpers'
import { parseUserSettings } from '../parsers/userSettingsParser'

export const userSettingsHandler = {
  [RendererToElectronMessage.getUserSettings]: handleApiRequest(
    RendererToElectronMessage.getUserSettings,
    () => Database.userData.getUserSettings().then(parseUserSettings),
  ),
  [RendererToElectronMessage.setUserSetting]: handleApiRequest(
    RendererToElectronMessage.setUserSetting,
    (key, value) => Database.userData.setUserSetting(key, value).then(() => successResponse),
  ),
} satisfies Partial<RequestHandlersSchema>
