import type { Server } from 'http'

import {
  ActionStepErrorType,
  ActionStepType,
  type Action,
  type ActionStep,
  type Procedure,
  ProcedureType,
  type FlowStep,
  omit,
  type ProcedureExecutionResult,
  type ScraperMode,
  type ValueQuery,
  ValueQueryType,
} from '@web-scraper/common'
import express from 'express'
import { afterAll, beforeAll, describe, expect, it, vi, type Mock } from 'vitest'

import { type RequestDataCallback } from '.'
import '../test-utils/electronMock'
import { Scraper } from './scraper'

class ExposedScraper<ModeType extends ScraperMode> extends Scraper<ModeType> {
  private getElementValue(selector: `${string} ${'input' | 'select'}`) {
    return this.mainPage
      ?.waitForSelector(selector)
      ?.then((element) => element?.evaluate((input) => input.value))
  }

  public getInputElementValue(selector: `${string} input`) {
    return this.getElementValue(selector)
  }
  public getSelectElementValue(selector: `${string} select`) {
    return this.getElementValue(selector)
  }
}

const actionStepBase = {
  id: 1,
  orderIndex: 0,
  actionId: 1,
} as const satisfies Partial<ActionStep>

const dummyRequestDataCallback: RequestDataCallback = () => Promise.resolve('mock-value')

const withScraperTestingMode = async (
  callback: (
    scraper: ExposedScraper<typeof Scraper.Mode.TESTING>,
    closeListener: Mock<any, any>,
  ) => Promise<any>,
) => {
  const closeListener = vi.fn()

  const scraper = new ExposedScraper<typeof Scraper.Mode.TESTING>(Scraper.Mode.TESTING, {
    siteId: 1,
    lockURL: 'http://localhost:1357/mock-testing',
    onClose: closeListener,
  })
  await scraper.waitForInit()

  await callback(scraper, closeListener)

  await scraper.destroy(true)
}

function initServer(app: express.Express) {
  for (const page of pages) {
    app.get(page.route, (_req, res) => {
      res.status(200).type('text/html').send(page.body)
    })
  }

  const port = 1357
  return app.listen(port)
}

describe('Scraper.PREVIEW', () => {
  const app = express()
  let server: Server | null = null

  beforeAll(() => {
    server = initServer(app)
  })
  afterAll(() => {
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
})

describe('Scraper.TESTING action steps', () => {
  const app = express()
  let server: Server | null = null
  const onDataRequest = (rawValue: ValueQuery) =>
    Promise.resolve(rawValue.replace(new RegExp(`^${ValueQueryType.CUSTOM}\\.`, 'u'), ''))

  beforeAll(() => {
    server = initServer(app)
  })
  afterAll(() => {
    server?.close()
  })

  it('should perform "wait" step in testing mode', () => {
    return withScraperTestingMode(async (scraper) => {
      const result = await scraper.performActionStep(
        {
          ...actionStepBase,
          type: ActionStepType.WAIT,
          data: {
            duration: 1000,
          },
        },
        dummyRequestDataCallback,
      )
      expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
    })
  })

  it('should perform "waitForElement" step in testing mode', () => {
    return withScraperTestingMode(async (scraper) => {
      const result = await scraper.performActionStep(
        {
          ...actionStepBase,
          type: ActionStepType.WAIT_FOR_ELEMENT,
          data: {
            element: 'body > h1',
          },
        },
        dummyRequestDataCallback,
      )
      expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
    })
  })

  it(
    'should return "error.common.elementNotFound" error for "waitForElement" action step with non existing element selector given in testing mode',
    () => {
      return withScraperTestingMode(async (scraper) => {
        const result = await scraper.performActionStep(
          {
            ...actionStepBase,
            type: ActionStepType.WAIT_FOR_ELEMENT,
            data: {
              element: 'non existing selector',
              timeout: 5_000,
            },
          },
          dummyRequestDataCallback,
        )
        expect(result).toEqual({
          errorType: ActionStepErrorType.ELEMENT_NOT_FOUND,
        })
      })
    },
    { timeout: 10_000 },
  )

  it('should perform "pressButton" step in testing mode', () => {
    return withScraperTestingMode(async (scraper) => {
      const result = await scraper.performActionStep(
        {
          ...actionStepBase,
          type: ActionStepType.PRESS_BUTTON,
          data: {
            element: 'body > button',
            waitForNavigation: false,
          },
        },
        dummyRequestDataCallback,
      )
      expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
    })
  })

  it(
    'should perform "pressButton" step in testing mode resulting with error for given non existing button selector',
    () => {
      return withScraperTestingMode(async (scraper) => {
        const result = await scraper.performActionStep(
          {
            ...actionStepBase,
            type: ActionStepType.PRESS_BUTTON,
            data: {
              element: 'non existing button selector',
              waitForNavigation: false,
              waitForElementTimeout: 2_000,
            },
          },
          dummyRequestDataCallback,
        )
        expect(result).toEqual({ errorType: ActionStepErrorType.ELEMENT_NOT_FOUND })
      })
    },
    { timeout: 10_000 },
  )

  it(
    'should perform "checkError" and "checkSuccess" steps in testing mode',
    () => {
      return withScraperTestingMode(async (scraper) => {
        const errorResult = await scraper.performActionStep(
          {
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
          },
          dummyRequestDataCallback,
        )
        expect(errorResult).toEqual({
          errorType: ActionStepErrorType.UNKNOWN,
          content: 'mock error [a-z]+',
        })

        const successResult = await scraper.performActionStep(
          {
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
          },
          dummyRequestDataCallback,
        )
        expect(successResult).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
      })
    },
    { timeout: 30_000 },
  )

  it(
    'should return no error if there is no error element found for "checkError" step in testing mode',
    () => {
      return withScraperTestingMode(async (scraper) => {
        const result = await scraper.performActionStep(
          {
            ...actionStepBase,
            type: ActionStepType.CHECK_ERROR,
            data: {
              element: 'non existing error selector',
              mapError: [{ errorType: ActionStepErrorType.UNKNOWN, content: 'noop' }],
              waitForElementTimeout: 2_000,
            },
          },
          dummyRequestDataCallback,
        )
        expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
      })
    },
    { timeout: 10_000 },
  )

  it(
    'should return error if there is no success element found for "checkSuccess" step in testing mode',
    () => {
      return withScraperTestingMode(async (scraper) => {
        const result = await scraper.performActionStep(
          {
            ...actionStepBase,
            type: ActionStepType.CHECK_SUCCESS,
            data: {
              element: 'non existing success selector',
              mapSuccess: [{ content: 'noop' }],
              waitForElementTimeout: 2_000,
            },
          },
          dummyRequestDataCallback,
        )
        expect(result).toEqual({ errorType: ActionStepErrorType.ELEMENT_NOT_FOUND })
      })
    },
    { timeout: 10_000 },
  )

  it(
    'should perform "fillInput" step in testing mode',
    () => {
      return withScraperTestingMode(async (scraper) => {
        expect(await scraper.getInputElementValue('body > input')).toBe('')

        const result = await scraper.performActionStep(
          {
            ...actionStepBase,
            type: ActionStepType.FILL_INPUT,
            data: {
              element: 'body > input',
              value: 'Custom.mock value',
              waitForElementTimeout: 2_000,
            },
          },
          onDataRequest,
        )

        expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })

        expect(await scraper.getInputElementValue('body > input')).toBe('mock value')
      })
    },
    { timeout: 10_000 },
  )

  it(
    'should perform "fillInput" step in testing mode resulting with error for given non existing button selector',
    () => {
      return withScraperTestingMode(async (scraper) => {
        const result = await scraper.performActionStep(
          {
            ...actionStepBase,
            type: ActionStepType.FILL_INPUT,
            data: {
              element: 'non existing input selector',
              value: 'Custom.mock value',
              waitForElementTimeout: 2_000,
            },
          },
          dummyRequestDataCallback,
        )
        expect(result).toEqual({ errorType: ActionStepErrorType.ELEMENT_NOT_FOUND })
      })
    },
    { timeout: 10_000 },
  )

  it(
    'should perform "selectOption" step in testing mode',
    () => {
      return withScraperTestingMode(async (scraper) => {
        expect(await scraper.getSelectElementValue('body > select')).toBe('select option')

        const result = await scraper.performActionStep(
          {
            ...actionStepBase,
            type: ActionStepType.SELECT_OPTION,
            data: {
              element: 'body > select',
              value: 'Custom.mock option',
              waitForElementTimeout: 2_000,
            },
          },
          onDataRequest,
        )

        expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
        expect(await scraper.getSelectElementValue('body > select')).toBe('mock option')
      })
    },
    { timeout: 10_000 },
  )

  it(
    'should perform "selectOption" step in testing mode resulting with proper error for non existing option',
    () => {
      return withScraperTestingMode(async (scraper) => {
        const result = await scraper.performActionStep(
          {
            ...actionStepBase,
            type: ActionStepType.SELECT_OPTION,
            data: {
              element: 'body > select',
              value: 'Custom.non existing option',
              waitForElementTimeout: 2_000,
            },
          },
          onDataRequest,
        )

        expect(result).toEqual({ errorType: ActionStepErrorType.OPTION_NOT_SELECTED })
        expect(await scraper.getSelectElementValue('body > select')).toBe('select option')
      })
    },
    { timeout: 10_000 },
  )
})

describe('Scraper.TESTING action', () => {
  const app = express()
  let server: Server | null = null

  beforeAll(() => {
    server = initServer(app)
  })
  afterAll(() => {
    server?.close()
  })

  it('should perform action in testing mode', () => {
    return withScraperTestingMode(async (scraper) => {
      const waitStep: ActionStep = {
        ...actionStepBase,
        type: ActionStepType.WAIT,
        data: {
          duration: 1000,
        },
      }
      const waitForElementStep: ActionStep = {
        ...actionStepBase,
        type: ActionStepType.WAIT_FOR_ELEMENT,
        data: {
          element: 'body > h1',
        },
      }
      const pressButtonStep: ActionStep = {
        ...actionStepBase,
        type: ActionStepType.PRESS_BUTTON,
        data: {
          element: 'body > button',
          waitForNavigation: false,
        },
      }
      const checkErrorStep: ActionStep = {
        ...actionStepBase,
        type: ActionStepType.CHECK_ERROR,
        data: {
          element: 'body > div#error-message',
          mapError: [
            {
              errorType: ActionStepErrorType.UNKNOWN,
              content: 'non existing error message',
            },
          ],
          waitForElementTimeout: 2_000,
        },
      }
      const checkSuccessStep: ActionStep = {
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
      }

      const steps = [
        waitStep,
        waitForElementStep,
        pressButtonStep,
        checkErrorStep,
        checkSuccessStep,
      ]

      const action: Action = {
        id: 0,
        url: 'http://localhost:1357/mock-testing',
        siteInstructionsId: 0,
        name: 'mock action',
        actionSteps: steps,
      }

      const actionExecutionResult = await scraper.performAction(action, dummyRequestDataCallback)
      expect(actionExecutionResult).toEqual({
        action,
        actionStepsResults: steps.map((step) => ({
          step,
          result: { errorType: ActionStepErrorType.NO_ERROR },
        })),
      })
    })
  })
})

describe('Scraper.TESTING procedure', () => {
  const app = express()
  let server: Server | null = null

  beforeAll(() => {
    server = initServer(app)
  })
  afterAll(() => {
    server?.close()
  })

  it('should perform procedure in testing mode', () => {
    return withScraperTestingMode(async (scraper) => {
      const waitStep: ActionStep = {
        ...actionStepBase,
        type: ActionStepType.WAIT,
        data: {
          duration: 1000,
        },
      }
      const waitForElementStep: ActionStep = {
        ...actionStepBase,
        type: ActionStepType.WAIT_FOR_ELEMENT,
        data: {
          element: 'body > h1',
        },
      }
      const pressButtonStep: ActionStep = {
        ...actionStepBase,
        type: ActionStepType.PRESS_BUTTON,
        data: {
          element: 'body > button',
          waitForNavigation: false,
        },
      }
      const checkErrorStep: ActionStep = {
        ...actionStepBase,
        type: ActionStepType.CHECK_ERROR,
        data: {
          element: 'body > div#error-message',
          mapError: [
            {
              errorType: ActionStepErrorType.UNKNOWN,
              content: 'non existing error message',
            },
          ],
          waitForElementTimeout: 2_000,
        },
      }
      const checkSuccessStep: ActionStep = {
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
      }

      const steps = [
        waitStep,
        waitForElementStep,
        pressButtonStep,
        checkErrorStep,
        checkSuccessStep,
      ]

      const action: Action = {
        id: 0,
        url: null,
        siteInstructionsId: 0,
        name: 'mock action',
        actionSteps: steps,
      }

      const mainFlow: FlowStep = {
        id: 0,
        actionName: 'action.mock action',
        globalReturnValues: [],
        onSuccess: {
          id: 1,
          actionName: 'global.finishProcedure',
          globalReturnValues: ['#success-message'],
          onSuccess: null,
          onFailure: null,
        },
        onFailure: {
          id: 2,
          actionName: 'global.finishProcedureWithError',
          globalReturnValues: [],
          onSuccess: null,
          onFailure: null,
        },
      }

      const procedure: Procedure = {
        id: 0,
        type: ProcedureType.ACCOUNT_CHECK,
        startUrl: 'http://localhost:1357/mock-testing',
        waitFor: 'body > h1',
        siteInstructionsId: 0,
        flow: mainFlow,
      }

      const procedureExecutionResult = await scraper.performProcedure(
        procedure,
        [action],
        dummyRequestDataCallback,
      )
      expect(procedureExecutionResult).toEqual({
        procedure,
        flowExecutionResult: {
          flow: mainFlow,
          flowStepsResults: [
            {
              flowStep: omit(mainFlow, 'onSuccess', 'onFailure'),
              actionResult: {
                action,
                actionStepsResults: steps.map((step) => ({
                  step,
                  result: { errorType: ActionStepErrorType.NO_ERROR },
                })),
              },
              returnedValues: [],
              succeeded: true,
            },
            {
              flowStep: omit(mainFlow.onSuccess!, 'onSuccess', 'onFailure'),
              actionResult: null,
              returnedValues: ['mock success message'],
              succeeded: true,
            },
          ],
        },
      } satisfies ProcedureExecutionResult)
    })
  })
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
          <select>
            <option value='select option'>Select option</option>
            <option value="mock option">Mock option</option>
            <option value="mock option 2">Mock option 2</option>
          </select>
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
