import { databaseMock, mockData } from '../../../test-utils/databaseMock'
import type { HandlersInterface } from '../../../test-utils/handlers.helpers'
import '../../../test-utils/electronMock'
import {
  ExecutionItemType,
  FlowActionType,
  ScraperStepType,
  type RendererToElectronMessage,
} from '@web-scraper/common'
import { mockReset, type DeepMockProxy } from 'jest-mock-extended'
import { registerRequestsHandler } from '../requestHandler'
import { ipcMain } from 'electron'

describe('scraperJobHandler', () => {
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

  it('should return scraper jobs', async () => {
    databaseMock.scraperJob.findMany.mockResolvedValue(mockData.scraperJobs)

    registerRequestsHandler()

    const getScraperJobs = handlers.get(
      'getScraperJobs',
    ) as HandlersInterface[RendererToElectronMessage.getScraperJobs]

    expect(getScraperJobs).toBeDefined()
    await expect(getScraperJobs(null as never, { count: 20 })).resolves.toEqual({
      cursor: undefined,
      data: [
        {
          id: 1,
          createdAt: new Date('2024-02-19T23:40:10.302Z'),
          name: 'Mocked scraper job 1',
          startUrl: 'https://mocked-site.com',
          execution: [
            {
              type: ExecutionItemType.CONDITION,
              condition: {
                condition: {},
                flowAction: {
                  type: FlowActionType.JUMP,
                  targetExecutionItemIndex: 1,
                },
              },
            },
            {
              type: ExecutionItemType.STEP,
              step: {
                type: ScraperStepType.REDIRECT,
                data: {
                  url: 'https://mocked-site.com',
                },
              },
            },
          ],
        },
        {
          id: 2,
          createdAt: new Date('2024-02-20T23:40:10.302Z'),
          name: 'Mocked scraper job 2',
          startUrl: 'http://localhost:1357/mock-testing',
          execution: [],
        },
      ],
    })
  })

  it('should return created scraper job', async () => {
    databaseMock.scraperJob.create.mockResolvedValue(mockData.scraperJobs[0])

    registerRequestsHandler()

    const createScraperJob = handlers.get(
      'createScraperJob',
    ) as HandlersInterface[RendererToElectronMessage.createScraperJob]

    expect(createScraperJob).toBeDefined()
    await expect(
      createScraperJob(null as never, {
        name: 'Mocked scraper job 1',
        startUrl: 'https://mocked-site.com',
        execution: [
          {
            type: ExecutionItemType.CONDITION,
            condition: {
              condition: {},
              flowAction: {
                type: FlowActionType.JUMP,
                targetExecutionItemIndex: 1,
              },
            },
            step: {} as never,
          },
          {
            type: ExecutionItemType.STEP,
            condition: {} as never,
            step: {
              type: ScraperStepType.REDIRECT,
              data: {
                url: 'https://mocked-site.com',
              },
            },
          },
        ],
      }),
    ).resolves.toEqual({
      id: 1,
      createdAt: new Date('2024-02-19T23:40:10.302Z'),
      name: 'Mocked scraper job 1',
      startUrl: 'https://mocked-site.com',
      execution: [
        {
          type: ExecutionItemType.CONDITION,
          condition: {
            condition: {},
            flowAction: {
              type: FlowActionType.JUMP,
              targetExecutionItemIndex: 1,
            },
          },
        },
        {
          type: ExecutionItemType.STEP,
          step: {
            type: ScraperStepType.REDIRECT,
            data: {
              url: 'https://mocked-site.com',
            },
          },
        },
      ],
    })
  })
})
