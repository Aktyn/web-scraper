import type { PrismaClient } from '@prisma/client'

export async function seedScraperJob(prisma: PrismaClient) {
  const mockExecution = JSON.stringify([
    {
      step: {
        data: {
          delayEnter: null,
          element: 'mock.button',
          pressEnter: null,
          valueQuery: 'mock-value',
          waitForElementTimeout: null,
          waitForNavigation: true,
          waitForNavigationTimeout: 1337,
        },
        type: 'pressButton',
      },
      type: 'step',
    },
    {
      condition: {
        condition: {},
        flowAction: {
          targetExecutionItemIndex: 2,
          type: 'jump',
        },
      },
      type: 'condition',
    },
    {
      step: {
        data: {
          delayEnter: null,
          pressEnter: null,
          url: 'https://example.com/redirected',
          valueQuery: null,
          waitForElementTimeout: null,
          waitForNavigation: null,
        },
        type: 'redirect',
      },
      type: 'step',
    },
  ])

  for (let i = 0; i < 64; i++) {
    await prisma.scraperJob.create({
      data: {
        name: `Example ${i + 1}`,
        startUrl: `https://example.com/${i + 1}`,
        execution: mockExecution,
      },
    })
  }
}
