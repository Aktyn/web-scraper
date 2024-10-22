import { databaseMock } from '../../test-utils/databaseMock'
import type { HandlersInterface } from '../../test-utils/handlers.helpers'
import '../../test-utils/electronMock'
import { RendererToElectronMessage } from '@web-scraper/common'
import { mockReset, type DeepMockProxy } from 'jest-mock-extended'
import { registerRequestsHandler } from './requestHandler'
import { ipcMain } from 'electron'

describe(registerRequestsHandler.name, () => {
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
    const rendererToElectronMessagesCount = Object.values(RendererToElectronMessage).length

    registerRequestsHandler()

    expect(ipcMainMock.handle).toBeCalledTimes(rendererToElectronMessagesCount)
    expect(handlers.size).toBe(rendererToElectronMessagesCount)
  })
})
