import type { ElectronApi, RendererToElectronMessage } from '@web-scrapper/common'
import { beforeEach, describe, expect, it } from 'vitest'
import type { DeepMockProxy } from 'vitest-mock-extended'
import { mockReset } from 'vitest-mock-extended'

import { databaseMock, mockData } from '../../test-utils/databaseMock'
import '../../test-utils/electronMock'

import { registerRequestsHandler } from './requestHandler'

// eslint-disable-next-line import/order
import { ipcMain, type IpcMainInvokeEvent } from 'electron'

type HandlersInterface = {
  [key in RendererToElectronMessage]: (
    event: IpcMainInvokeEvent,
    ...args: Parameters<ElectronApi[key]>
  ) => ReturnType<ElectronApi[key]>
}

describe('registerRequestsHandler', () => {
  const ipcMainMock = ipcMain as DeepMockProxy<typeof ipcMain>
  const handlers = new Map<string, HandlersInterface[RendererToElectronMessage]>()

  beforeEach(() => {
    mockReset(databaseMock)

    mockReset(ipcMainMock.handle)
    handlers.clear()
    ipcMainMock.handle.mockImplementation((channel, handler) => {
      handlers.set(channel, handler)
    })
  })

  it('should invoke ipcMain.handle for each defined handler', () => {
    registerRequestsHandler()
    expect(ipcMainMock.handle).toBeCalledTimes(1)
  })

  it('should return decrypted accounts', async () => {
    databaseMock.account.findMany.mockResolvedValue(mockData.accounts)

    registerRequestsHandler()

    const getAccounts = handlers.get(
      'getAccounts',
    ) as HandlersInterface[RendererToElectronMessage.getAccounts]

    expect(getAccounts).toBeDefined()
    await expect(getAccounts(null as never, { count: 20 }, 'mock-password')).resolves.toEqual({
      cursor: undefined,
      data: decryptedAccounts,
    })
  })

  it('should return accounts with empty strings for encrypted fields when no password is provided', async () => {
    databaseMock.account.findMany.mockResolvedValue(mockData.accounts)

    registerRequestsHandler()

    const getAccounts = handlers.get(
      'getAccounts',
    ) as HandlersInterface[RendererToElectronMessage.getAccounts]

    expect(getAccounts).toBeDefined()
    await expect(getAccounts(null as never, { count: 20 }, null)).resolves.toEqual({
      cursor: undefined,
      data: decryptedAccounts.map((account) => ({
        ...account,
        loginOrEmail: '',
        password: '',
        additionalCredentialsData: account.additionalCredentialsData ? '' : null,
      })),
    })
  })
})

const decryptedAccounts = [
  {
    id: 1,
    createdAt: new Date('2023-02-19T23:40:10.302Z'),
    loginOrEmail: 'Mock-username-1',
    password: 'Mock-password-1',
    additionalCredentialsData: null,
    lastUsed: new Date('2023-02-19T23:40:10.302Z'),
    active: true,
    siteId: 1,
  },
  {
    id: 2,
    createdAt: new Date('2023-02-22T23:40:10.302Z'),
    loginOrEmail: 'Mock-username-2',
    password: 'Mock-password-2',
    additionalCredentialsData: '{"value": "mock-data"}',
    lastUsed: new Date('2023-02-22T23:40:10.302Z'),
    active: true,
    siteId: 1,
  },
]
