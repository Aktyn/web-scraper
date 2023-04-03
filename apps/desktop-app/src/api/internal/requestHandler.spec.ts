import { type ElectronApi, RendererToElectronMessage, ErrorCode } from '@web-scraper/common'
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

  it('should return created account', async () => {
    databaseMock.account.create.mockResolvedValue({
      ...mockData.accounts[0],
    })

    registerRequestsHandler()

    const createAccount = handlers.get(
      'createAccount',
    ) as HandlersInterface[RendererToElectronMessage.createAccount]

    expect(createAccount).toBeDefined()
    await expect(
      createAccount(
        null as never,
        {
          loginOrEmail: 'Mock-username-1',
          password: 'Mock-password-1',
          additionalCredentialsData: null,
          siteId: 1,
        },
        'mock-password',
      ),
    ).resolves.toEqual({
      id: 1,
      createdAt: new Date('2023-02-19T23:40:10.302Z'),
      loginOrEmail: 'Mock-username-1',
      password: 'Mock-password-1',
      additionalCredentialsData: null,
      lastUsed: new Date('2023-02-19T23:40:10.302Z'),
      active: true,
      siteId: 1,
    })
  })

  it('should delete account with given id', async () => {
    databaseMock.account.delete.mockResolvedValue(mockData.accounts[0])

    registerRequestsHandler()

    const deleteAccount = handlers.get(
      'deleteAccount',
    ) as HandlersInterface[RendererToElectronMessage.deleteAccount]

    expect(deleteAccount).toBeDefined()
    await expect(deleteAccount(null as never, 1)).resolves.toEqual({
      errorCode: ErrorCode.NO_ERROR,
    })
  })

  it('should update account and return it', async () => {
    databaseMock.account.update.mockResolvedValue({
      ...mockData.accounts[0],
    })

    registerRequestsHandler()

    const updateAccount = handlers.get(
      'updateAccount',
    ) as HandlersInterface[RendererToElectronMessage.updateAccount]

    expect(updateAccount).toBeDefined()
    await expect(
      updateAccount(
        null as never,
        1,
        {
          loginOrEmail: 'Mock-username-1',
          password: 'Mock-password-1',
          additionalCredentialsData: null,
          siteId: 1,
        },
        'mock-password',
      ),
    ).resolves.toEqual({
      id: 1,
      createdAt: new Date('2023-02-19T23:40:10.302Z'),
      loginOrEmail: 'Mock-username-1',
      password: 'Mock-password-1',
      additionalCredentialsData: null,
      lastUsed: new Date('2023-02-19T23:40:10.302Z'),
      active: true,
      siteId: 1,
    })
  })

  it('should return site tags', async () => {
    databaseMock.siteTag.findMany.mockResolvedValue(mockData.siteTags)

    registerRequestsHandler()

    const getSiteTags = handlers.get(
      'getSiteTags',
    ) as HandlersInterface[RendererToElectronMessage.getSiteTags]

    expect(getSiteTags).toBeDefined()
    await expect(getSiteTags(null as never, { count: 20 })).resolves.toEqual({
      cursor: undefined,
      data: [
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
    })
  })

  it('should delete site tag with given id', async () => {
    databaseMock.siteTag.delete.mockResolvedValue(mockData.siteTags[0])

    registerRequestsHandler()

    const deleteSiteTag = handlers.get(
      'deleteSiteTag',
    ) as HandlersInterface[RendererToElectronMessage.deleteSiteTag]

    expect(deleteSiteTag).toBeDefined()
    await expect(deleteSiteTag(null as never, 1)).resolves.toEqual({
      errorCode: ErrorCode.NO_ERROR,
    })
  })

  it('should update site tag and return it', async () => {
    databaseMock.siteTag.update.mockResolvedValue(mockData.siteTags[0])

    registerRequestsHandler()

    const updateSiteTag = handlers.get(
      'updateSiteTag',
    ) as HandlersInterface[RendererToElectronMessage.updateSiteTag]

    expect(updateSiteTag).toBeDefined()
    await expect(
      updateSiteTag(null as never, 1, {
        name: 'Mock-1',
        description: 'Mocked site 1',
      }),
    ).resolves.toEqual({
      id: 1,
      name: 'Mock-1',
      description: 'Mocked site 1',
    })
  })

  it('should return created site tag', async () => {
    databaseMock.siteTag.create.mockResolvedValue(mockData.siteTags[0])

    registerRequestsHandler()

    const createSiteTag = handlers.get(
      'createSiteTag',
    ) as HandlersInterface[RendererToElectronMessage.createSiteTag]

    expect(createSiteTag).toBeDefined()
    await expect(
      createSiteTag(null as never, { name: 'Mock-1', description: 'Mocked site 1' }),
    ).resolves.toEqual({
      id: 1,
      name: 'Mock-1',
      description: 'Mocked site 1',
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

  it('should return site instructions with given id', async () => {
    databaseMock.siteInstructions.findUnique.mockResolvedValue({
      ...mockData.siteInstructions[0],
    })
    databaseMock.flowStep.findUnique.mockResolvedValue({
      ...mockData.flowSteps[0],
    })

    registerRequestsHandler()

    const getSiteInstructions = handlers.get(
      'getSiteInstructions',
    ) as HandlersInterface[RendererToElectronMessage.getSiteInstructions]

    expect(getSiteInstructions).toBeDefined()
    await expect(getSiteInstructions(null as never, 1)).resolves.toEqual({
      id: 1,
      createdAt: new Date('2023-02-19T23:40:10.302Z'),
      siteId: 1,
      actions: [
        {
          actionSteps: [
            {
              actionId: 1,
              data: {
                element: 'body > input[type=text]',
              },
              id: 1,
              orderIndex: 1,
              type: 'fillInput',
            },
            {
              actionId: 1,
              data: {
                element: 'body > button',
                waitForNavigation: false,
              },
              id: 2,
              orderIndex: 2,
              type: 'pressButton',
            },
            {
              actionId: 1,
              data: {
                element: 'body > div',
                mapSuccess: [
                  {
                    content: 'success',
                    error: 'error.common.noError',
                  },
                ],
              },
              id: 3,
              orderIndex: 3,
              type: 'checkSuccess',
            },
          ],
          id: 1,
          name: 'login',
          siteInstructionsId: 1,
          url: null,
        },
      ],
      procedures: [
        {
          flow: {
            actionName: 'action.name',
            globalReturnValues: null,
            id: 1,
            onFailure: null,
            onSuccess: {
              actionName: 'global.finishProcedure',
              globalReturnValues: null,
              id: 2,
              onFailure: null,
              onSuccess: null,
            },
          },
          id: 1,
          siteInstructionsId: 1,
          startUrl: '{{URL.ORIGIN}}/login',
          type: 'login',
          waitFor: 'body > h1',
        },
      ],
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
