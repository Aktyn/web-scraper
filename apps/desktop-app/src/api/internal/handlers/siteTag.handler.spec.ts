/* eslint-disable import/order */
import { databaseMock, mockData } from '../../../test-utils/databaseMock'
import type { HandlersInterface } from '../../../test-utils/handlers.helpers'
import '../../../test-utils/electronMock'
import { ErrorCode, type RendererToElectronMessage } from '@web-scraper/common'
import { mockReset, type DeepMockProxy } from 'jest-mock-extended'
import { registerRequestsHandler } from '../requestHandler'
import { ipcMain } from 'electron'

describe('siteTagHandler', () => {
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
})
