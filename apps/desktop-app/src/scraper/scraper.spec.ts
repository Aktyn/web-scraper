import type { Server } from 'http'

import { ActionStepErrorType, ActionStepType, type ActionStep } from '@web-scraper/common'
import express from 'express'
import { afterAll, beforeAll, describe, expect, it, vi, type Mock } from 'vitest'

import '../test-utils/electronMock'
import { Scraper } from './scraper'

describe('Scraper', () => {
  const app = express()
  let server: Server | null = null

  const actionStepBase = {
    id: 1,
    orderIndex: 0,
    actionId: 1,
  } as const satisfies Partial<ActionStep>

  const withScraperTestingMode = async (
    callback: (
      scraper: Scraper<typeof Scraper.Mode.TESTING>,
      closeListener: Mock<any, any>,
    ) => Promise<any>,
  ) => {
    const closeListener = vi.fn()

    const scraper = new Scraper<typeof Scraper.Mode.TESTING>(Scraper.Mode.TESTING, {
      siteId: 1,
      lockURL: 'http://localhost:1357/mock-testing',
      onClose: closeListener,
    })
    await scraper.waitForInit()

    await callback(scraper, closeListener)

    await scraper.destroy(true)
  }

  beforeAll(async () => {
    for (const page of pages) {
      app.get(page.route, (_req, res) => {
        res.status(200).type('text/html').send(page.body)
      })
    }

    const port = 1357
    server = app.listen(port)
  })
  afterAll(async () => {
    server?.close()
  })

  it('should capture page screenshot', async () => {
    const scraper = new Scraper(Scraper.Mode.PREVIEW, {
      viewportWidth: 480,
      viewportHeight: 320,
    })
    await scraper.waitForInit()

    const screenshot = await scraper.takeScreenshot('http://localhost:1357/mock-preview')
    expect(isBase64(screenshot)).toBe(true)

    await scraper.destroy(true)
  })

  it('should perform "wait" step in testing mode', () => {
    return withScraperTestingMode(async (scraper) => {
      const result = await scraper.performActionStep({
        ...actionStepBase,
        type: ActionStepType.WAIT,
        data: {
          duration: 1000,
        },
      })
      expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
    })
  })

  it('should perform "waitForElement" step in testing mode', () => {
    return withScraperTestingMode(async (scraper) => {
      const result = await scraper.performActionStep({
        ...actionStepBase,
        type: ActionStepType.WAIT_FOR_ELEMENT,
        data: {
          element: 'body > h1',
        },
      })
      expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
    })
  })

  it(
    'should return "error.common.elementNotFound" error for "waitForElement" action step with non existing element selector given in testing mode',
    () => {
      return withScraperTestingMode(async (scraper) => {
        const result = await scraper.performActionStep({
          ...actionStepBase,
          type: ActionStepType.WAIT_FOR_ELEMENT,
          data: {
            element: 'non existing selector',
            timeout: 5_000,
          },
        })
        expect(result).toEqual({
          errorType: ActionStepErrorType.ELEMENT_NOT_FOUND,
        })
      })
    },
    { timeout: 10_000 },
  )

  it('should perform "pressButton" step in testing mode', () => {
    return withScraperTestingMode(async (scraper) => {
      const result = await scraper.performActionStep({
        ...actionStepBase,
        type: ActionStepType.PRESS_BUTTON,
        data: {
          element: 'body > button',
          waitForNavigation: false,
        },
      })
      expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
    })
  })

  it(
    'should perform "pressButton" step in testing mode resulting with error for given non existing button selector',
    () => {
      return withScraperTestingMode(async (scraper) => {
        const result = await scraper.performActionStep({
          ...actionStepBase,
          type: ActionStepType.PRESS_BUTTON,
          data: {
            element: 'non existing button selector',
            waitForNavigation: false,
            waitForElementTimeout: 5_000,
          },
        })
        expect(result).toEqual({ errorType: ActionStepErrorType.ELEMENT_NOT_FOUND })
      })
    },
    { timeout: 10_000 },
  )

  it(
    'should perform "checkError" and "checkSuccess" steps in testing mode',
    () => {
      return withScraperTestingMode(async (scraper) => {
        const errorResult = await scraper.performActionStep({
          ...actionStepBase,
          type: ActionStepType.CHECK_ERROR,
          data: {
            element: 'body > div#error-message',
            mapError: [
              {
                errorType: ActionStepErrorType.UNKNOWN,
                content: 'mock error [a-z]+',
              },
            ],
            waitForElementTimeout: 2_000,
          },
        })
        expect(errorResult).toEqual({
          errorType: ActionStepErrorType.UNKNOWN,
          content: 'mock error [a-z]+',
        })

        const successResult = await scraper.performActionStep({
          ...actionStepBase,
          type: ActionStepType.CHECK_SUCCESS,
          data: {
            element: 'body > div#success-message',
            mapSuccess: [
              {
                content: 'mock success [a-z]+',
              },
            ],
            waitForElementTimeout: 2_000,
          },
        })
        expect(successResult).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
      })
    },
    { timeout: 30_000 },
  )

  it(
    'should return no error if there is no error element found for "checkError" step in testing mode',
    () => {
      return withScraperTestingMode(async (scraper) => {
        const result = await scraper.performActionStep({
          ...actionStepBase,
          type: ActionStepType.CHECK_ERROR,
          data: {
            element: 'non existing error selector',
            mapError: [{ errorType: ActionStepErrorType.UNKNOWN, content: 'noop' }],
            waitForElementTimeout: 5_000,
          },
        })
        expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
      })
    },
    { timeout: 10_000 },
  )

  it(
    'should return error if there is no success element found for "checkSuccess" step in testing mode',
    () => {
      return withScraperTestingMode(async (scraper) => {
        const result = await scraper.performActionStep({
          ...actionStepBase,
          type: ActionStepType.CHECK_SUCCESS,
          data: {
            element: 'non existing success selector',
            mapSuccess: [{ content: 'noop' }],
            waitForElementTimeout: 5_000,
          },
        })
        expect(result).toEqual({ errorType: ActionStepErrorType.ELEMENT_NOT_FOUND })
      })
    },
    { timeout: 10_000 },
  )
})

const pages = [
  {
    route: '/mock-preview',
    body: `
      <html>
        <body>
          <p>Mock preview</p>
        </body>
      </html>
    `,
  },
  {
    route: '/mock-testing',
    body: `
      <html>
        <body>
          <h1>Mock testing</h1>
          <input type="text" />
          <button>Mock action</button>
          <div id="error-message">mock error message</div>
          <div id="success-message">mock success message</div>
        </body>
      </html>
    `,
  },
]

function isBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str
  } catch (err) {
    return false
  }
}
