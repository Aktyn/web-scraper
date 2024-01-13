/* eslint-disable import/order */
import { databaseMock, mockData } from '../../../test-utils/databaseMock'
import type { HandlersInterface } from '../../../test-utils/handlers.helpers'
import '../../../test-utils/electronMock'
import { ErrorCode, type RendererToElectronMessage } from '@web-scraper/common'
import { mockReset, type DeepMockProxy } from 'jest-mock-extended'
import { registerRequestsHandler } from '../requestHandler'
import { ipcMain } from 'electron'

describe('userSettingsHandler', () => {
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

  it('should return parsed user settings', async () => {
    databaseMock.userData.findMany.mockResolvedValue(mockData.userData)

    registerRequestsHandler()

    const getUserSettings = handlers.get(
      'getUserSettings',
    ) as HandlersInterface[RendererToElectronMessage.getUserSettings]

    expect(getUserSettings).toBeDefined()
    await expect(getUserSettings(null as never)).resolves.toEqual({
      tablesCompactMode: true,
      desktopNotifications: true,
      backgroundSaturation: 0.5,
    })
  })

  it('should upsert given user settings', async () => {
    databaseMock.userData.upsert.mockResolvedValue({
      key: 'tableCompactMode',
      value: "'false'",
    })

    registerRequestsHandler()

    const setUserSetting = handlers.get(
      'setUserSetting',
    ) as HandlersInterface[RendererToElectronMessage.setUserSetting]

    expect(setUserSetting).toBeDefined()

    await expect(setUserSetting(null as never, 'tablesCompactMode', false)).resolves.toEqual({
      errorCode: ErrorCode.NO_ERROR,
    })

    expect(databaseMock.userData.upsert).toBeCalledWith({
      where: { key: 'tablesCompactMode' },
      update: { value: 'false' },
      create: { key: 'tablesCompactMode', value: 'false' },
    })
  })
})
