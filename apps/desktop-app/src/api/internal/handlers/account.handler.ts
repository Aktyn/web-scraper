import { RendererToElectronMessage } from '@web-scraper/common'

import Database from '../../../database'
import { handleApiRequest, type RequestHandlersSchema, successResponse } from '../helpers'
import { parseDatabaseAccount } from '../parsers/accountParser'

export const accountHandler = {
  [RendererToElectronMessage.getAccounts]: handleApiRequest(
    RendererToElectronMessage.getAccounts,
    (request, password) =>
      Database.account.getAccounts(request).then((accounts) => ({
        data: accounts.map((account) => parseDatabaseAccount(account, password)),
        cursor: Database.utils.extractCursor(accounts, 'id', request.count),
      })),
  ),
  [RendererToElectronMessage.createAccount]: handleApiRequest(
    RendererToElectronMessage.createAccount,
    (data, password) =>
      Database.account
        .createAccount(data, password)
        .then((account) => parseDatabaseAccount(account, password)),
  ),
  [RendererToElectronMessage.deleteAccount]: handleApiRequest(
    RendererToElectronMessage.deleteAccount,
    (id) => Database.account.deleteAccount(id).then(() => successResponse),
  ),
  [RendererToElectronMessage.updateAccount]: handleApiRequest(
    RendererToElectronMessage.updateAccount,
    (id, data, password) =>
      Database.account
        .updateAccount(id, data, password)
        .then((account) => parseDatabaseAccount(account, password)),
  ),
} satisfies Partial<RequestHandlersSchema>
