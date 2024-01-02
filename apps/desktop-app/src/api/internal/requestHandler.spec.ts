/* eslint-disable import/order */
import { databaseMock, mockData } from '../../test-utils/databaseMock'
import '../../test-utils/electronMock'
import { ErrorCode, RendererToElectronMessage, type ElectronApi } from '@web-scraper/common'
import { mockReset, type DeepMockProxy } from 'jest-mock-extended'
import { Scraper } from '../../scraper'
import { registerRequestsHandler } from './requestHandler'
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
    const rendererToElectronMessagesCount = Object.values(RendererToElectronMessage).length

    registerRequestsHandler()

    expect(ipcMainMock.handle).toBeCalledTimes(rendererToElectronMessagesCount)
    expect(handlers.size).toBe(rendererToElectronMessagesCount)
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
        Tags: mockData.siteTagsRelations.reduce(
          (acc, siteTagsRelation) => {
            if (siteTagsRelation.siteId === site.id) {
              const tag = mockData.siteTags.find((tag) => tag.id === siteTagsRelation.tagId)
              if (tag) {
                acc.push({
                  Tag: tag,
                })
              }
            }
            return acc
          },
          [] as { Tag: (typeof mockData.siteTags)[number] }[],
        ),
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
        {
          id: 2,
          createdAt: new Date('2023-02-20T23:40:10.302Z'),
          url: 'http://localhost:1358/mock-testing',
          language: 'en',
          tags: [],
        },
      ],
    })
  })

  it('should return site with given id', async () => {
    databaseMock.site.findUnique.mockResolvedValue({
      ...mockData.sites[0],
      Tags: [] as never,
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
      Tags: [] as never,
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
      Tags: [] as never,
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
          name: 'Login',
          flow: {
            actionName: 'action.name',
            globalReturnValues: [],
            id: 1,
            onFailure: null,
            onSuccess: {
              actionName: 'global.finishProcedure',
              globalReturnValues: [],
              id: 2,
              onFailure: null,
              onSuccess: null,
            },
          },
          id: 1,
          siteInstructionsId: 1,
          startUrl: '{{URL.ORIGIN}}/login',
          type: 'accountCheck',
          waitFor: 'body > h1',
        },
      ],
    })
  })

  it('should set site instructions', async () => {
    registerRequestsHandler()

    const setSiteInstructions = handlers.get(
      'setSiteInstructions',
    ) as HandlersInterface[RendererToElectronMessage.setSiteInstructions]

    expect(setSiteInstructions).toBeDefined()
    await expect(
      setSiteInstructions(null as never, 1, {
        procedures: [],
        actions: [],
      }),
    ).resolves.toEqual({
      errorCode: ErrorCode.NO_ERROR,
    })
  })

  it('should get site instructions testing sessions', async () => {
    databaseMock.site.findUnique.mockResolvedValue({
      ...mockData.sites[1],
      Tags: [] as never,
    })

    registerRequestsHandler()

    const getSiteInstructionsTestingSessions = handlers.get(
      'getSiteInstructionsTestingSessions',
    ) as HandlersInterface[RendererToElectronMessage.getSiteInstructionsTestingSessions]

    const siteId = 1
    const scraper = new Scraper(Scraper.Mode.TESTING, {
      siteId,
      lockURL: 'http://localhost:1358/mock-testing',
      onClose: () => void 0,
    })

    expect(getSiteInstructionsTestingSessions).toBeDefined()
    await expect(getSiteInstructionsTestingSessions(null as never)).resolves.toEqual([
      {
        sessionId: scraper.id,
        site: { ...mockData.sites[1], tags: [] },
      },
    ])

    await scraper.destroy()

    await expect(getSiteInstructionsTestingSessions(null as never)).resolves.toEqual([])
  })
})
