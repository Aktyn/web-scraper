/* eslint-disable import/order */
import { databaseMock, mockData } from '../../../test-utils/databaseMock'
import type { HandlersInterface } from '../../../test-utils/handlers.helpers'
import '../../../test-utils/electronMock'
import { mockReset, type DeepMockProxy } from 'jest-mock-extended'
import type { RendererToElectronMessage } from '@web-scraper/common'
import { registerRequestsHandler } from '../requestHandler'
import { ipcMain } from 'electron'
import { Scraper } from '../../../scraper'

describe('scraperSession', () => {
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
      lockURL: 'http://localhost:1357/mock-testing',
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
