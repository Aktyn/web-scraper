import { type ElectronApi, RendererToElectronMessage, ErrorCode } from '@web-scrapper/common'
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
    expect(ipcMainMock.handle).toBeCalledTimes(Object.values(RendererToElectronMessage).length)
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

  it('should return sites with tags', async () => {
    databaseMock.site.findMany.mockResolvedValue(
      mockData.sites.map((site) => ({
        ...site,
        Tags: mockData.siteTagsRelations.reduce((acc, siteTagsRelation) => {
          if (siteTagsRelation.siteId === site.id) {
            const tag = mockData.siteTags.find((tag) => tag.id === siteTagsRelation.tagId)
            if (tag) {
              acc.push({
                Tag: tag,
              })
            }
          }
          return acc
        }, [] as { Tag: (typeof mockData.siteTags)[number] }[]),
      })),
    )

    registerRequestsHandler()

    const getSites = handlers.get(
      'getSites',
    ) as HandlersInterface[RendererToElectronMessage.getSites]

    expect(getSites).toBeDefined()
    await expect(getSites(null as never, { count: 20 })).resolves.toEqual({
      cursor: undefined,
      data: [
        {
          id: 1,
          createdAt: new Date('2023-02-19T23:40:10.302Z'),
          url: 'https://mocked-site.com',
          language: 'en',
          tags: [
            {
              id: 1,
              name: 'Mock-1',
              description: 'Mocked site 1',
            },
            {
              id: 2,
              name: 'Mock-2',
              description: 'Mocked site 1',
            },
          ],
        },
      ],
    })
  })

  it('should return site with given id', async () => {
    databaseMock.site.findUnique.mockResolvedValue({
      ...mockData.sites[0],
      //@ts-expect-error - incomplete mock types
      Tags: [],
    })

    registerRequestsHandler()

    const getSite = handlers.get('getSite') as HandlersInterface[RendererToElectronMessage.getSite]

    expect(getSite).toBeDefined()
    await expect(getSite(null as never, 1)).resolves.toEqual({
      id: 1,
      createdAt: new Date('2023-02-19T23:40:10.302Z'),
      url: 'https://mocked-site.com',
      language: 'en',
      tags: [],
    })
  })

  it('should return created site', async () => {
    databaseMock.site.create.mockResolvedValue({
      ...mockData.sites[0],
      //@ts-expect-error - incomplete mock types
      Tags: [],
    })

    registerRequestsHandler()

    const createSite = handlers.get(
      'createSite',
    ) as HandlersInterface[RendererToElectronMessage.createSite]

    expect(createSite).toBeDefined()
    await expect(
      createSite(null as never, { url: 'https://mocked-site.com', language: 'en', siteTags: [] }),
    ).resolves.toEqual({
      id: 1,
      createdAt: new Date('2023-02-19T23:40:10.302Z'),
      url: 'https://mocked-site.com',
      language: 'en',
      tags: [],
    })
  })

  it('should delete site with given id', async () => {
    databaseMock.site.delete.mockResolvedValue(mockData.sites[0])

    registerRequestsHandler()

    const deleteSite = handlers.get(
      'deleteSite',
    ) as HandlersInterface[RendererToElectronMessage.deleteSite]

    expect(deleteSite).toBeDefined()
    await expect(deleteSite(null as never, 1)).resolves.toEqual({
      errorCode: ErrorCode.NO_ERROR,
    })
  })

  it('should update site and return it', async () => {
    databaseMock.site.update.mockResolvedValue({
      ...mockData.sites[0],
      //@ts-expect-error - incomplete mock types
      Tags: [],
    })

    registerRequestsHandler()

    const updateSite = handlers.get(
      'updateSite',
    ) as HandlersInterface[RendererToElectronMessage.updateSite]

    expect(updateSite).toBeDefined()
    await expect(
      updateSite(null as never, 1, {
        url: 'https://mocked-site.com',
        language: 'en',
        siteTags: [],
      }),
    ).resolves.toEqual({
      id: 1,
      createdAt: new Date('2023-02-19T23:40:10.302Z'),
      url: 'https://mocked-site.com',
      language: 'en',
      tags: [],
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
