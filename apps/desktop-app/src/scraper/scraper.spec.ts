import '../test-utils/databaseMock'
import { initServer } from '../test-utils/serverMock'

import '../test-utils/electronMock'
import { Scraper } from './scraper'

// const actionStepBase = {
//   id: 1,
//   orderIndex: 0,
//   actionId: 1,
// } as const satisfies Partial<ActionStep>

// const dummyRequestDataCallback: RequestDataCallback = () => Promise.resolve('mock-value')
// const dummyDataSourceItemIdRequest: RequestDataSourceItemIdCallback = () => Promise.resolve(1)

// const withScraperTestingMode = async (
//   callback: (
//     scraper: ExposedScraper<typeof Scraper.Mode.TESTING>,
//     closeListener: jest.Mock<unknown, never[]>,
//   ) => Promise<unknown>,
//   lockURL = 'http://localhost:1357/mock-testing',
// ) => {
//   const closeListener = jest.fn()

//   const scraper = new ExposedScraper<typeof Scraper.Mode.TESTING>(Scraper.Mode.TESTING, {
//     siteId: 1,
//     lockURL,
//     onClose: closeListener,
//   })
//   await scraper.waitForInit()

//   await callback(scraper, closeListener)

//   await scraper.destroy(true)
// }

describe('Scraper.PREVIEW', () => {
  let server: ReturnType<typeof initServer> | null = null

  beforeAll(() => {
    server = initServer()
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
  }, 60_000)
})

// describe('Scraper.TESTING action steps', () => {
//   let server: ReturnType<typeof initServer> | null = null
//   const onDataRequest = (rawValue: ValueQuery) =>
//     Promise.resolve(rawValue.replace(new RegExp(`^${ValueQueryType.CUSTOM}\\.`, 'u'), ''))

//   beforeAll(() => {
//     server = initServer()
//   })
//   afterAll(() => {
//     server?.close()
//   })

//   it('should perform "wait" step in testing mode', () => {
//     return withScraperTestingMode(async (scraper) => {
//       const result = await scraper.performActionStep(
//         {
//           ...actionStepBase,
//           type: ActionStepType.WAIT,
//           data: {
//             duration: 1000,
//           },
//         },
//         dummyRequestDataCallback,
//         dummyDataSourceItemIdRequest,
//       )
//       expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
//     })
//   })

//   it('should perform "waitForElement" step in testing mode', () => {
//     return withScraperTestingMode(async (scraper) => {
//       const result = await scraper.performActionStep(
//         {
//           ...actionStepBase,
//           type: ActionStepType.WAIT_FOR_ELEMENT,
//           data: {
//             element: 'body > h1',
//           },
//         },
//         dummyRequestDataCallback,
//         dummyDataSourceItemIdRequest,
//       )
//       expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
//     })
//   })

//   it('should return "error.common.elementNotFound" error for "waitForElement" action step with non existing element selector given in testing mode', () => {
//     return withScraperTestingMode(async (scraper) => {
//       const result = await scraper.performActionStep(
//         {
//           ...actionStepBase,
//           type: ActionStepType.WAIT_FOR_ELEMENT,
//           data: {
//             element: 'non existing selector',
//             timeout: 5_000,
//           },
//         },
//         dummyRequestDataCallback,
//         dummyDataSourceItemIdRequest,
//       )
//       expect(result).toEqual({
//         errorType: ActionStepErrorType.ELEMENT_NOT_FOUND,
//       })
//     })
//   }, 10_000)

//   it('should perform "pressButton" step in testing mode', () => {
//     return withScraperTestingMode(async (scraper) => {
//       const result = await scraper.performActionStep(
//         {
//           ...actionStepBase,
//           type: ActionStepType.PRESS_BUTTON,
//           data: {
//             element: 'body > button',
//             waitForNavigation: false,
//           },
//         },
//         dummyRequestDataCallback,
//         dummyDataSourceItemIdRequest,
//       )
//       expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
//     })
//   })

//   it('should perform "pressButton" step in testing mode resulting with error for given non existing button selector', () => {
//     return withScraperTestingMode(async (scraper) => {
//       const result = await scraper.performActionStep(
//         {
//           ...actionStepBase,
//           type: ActionStepType.PRESS_BUTTON,
//           data: {
//             element: 'non existing button selector',
//             waitForNavigation: false,
//             waitForElementTimeout: 2_000,
//           },
//         },
//         dummyRequestDataCallback,
//         dummyDataSourceItemIdRequest,
//       )
//       expect(result).toEqual({ errorType: ActionStepErrorType.ELEMENT_NOT_FOUND })
//     })
//   }, 10_000)

//   it('should perform "checkError" and "checkSuccess" steps in testing mode', () => {
//     return withScraperTestingMode(async (scraper) => {
//       const errorResult = await scraper.performActionStep(
//         {
//           ...actionStepBase,
//           type: ActionStepType.CHECK_ERROR,
//           data: {
//             element: 'body > div#error-message',
//             mapError: [
//               {
//                 errorType: ActionStepErrorType.UNKNOWN,
//                 content: 'mock error [a-z]+',
//               },
//             ],
//             waitForElementTimeout: 2_000,
//           },
//         },
//         dummyRequestDataCallback,
//         dummyDataSourceItemIdRequest,
//       )
//       expect(errorResult).toEqual({
//         errorType: ActionStepErrorType.UNKNOWN,
//         content: 'mock error [a-z]+',
//       })

//       const successResult = await scraper.performActionStep(
//         {
//           ...actionStepBase,
//           type: ActionStepType.CHECK_SUCCESS,
//           data: {
//             element: 'body > div#success-message',
//             mapSuccess: [
//               {
//                 content: 'mock success [a-z]+',
//               },
//             ],
//             waitForElementTimeout: 2_000,
//           },
//         },
//         dummyRequestDataCallback,
//         dummyDataSourceItemIdRequest,
//       )
//       expect(successResult).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
//     })
//   }, 30_000)

//   it('should return no error if there is no error element found for "checkError" step in testing mode', () => {
//     return withScraperTestingMode(async (scraper) => {
//       const result = await scraper.performActionStep(
//         {
//           ...actionStepBase,
//           type: ActionStepType.CHECK_ERROR,
//           data: {
//             element: 'non existing error selector',
//             mapError: [{ errorType: ActionStepErrorType.UNKNOWN, content: 'noop' }],
//             waitForElementTimeout: 2_000,
//           },
//         },
//         dummyRequestDataCallback,
//         dummyDataSourceItemIdRequest,
//       )
//       expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
//     })
//   }, 10_000)

//   it('should return error if there is no success element found for "checkSuccess" step in testing mode', () => {
//     return withScraperTestingMode(async (scraper) => {
//       const result = await scraper.performActionStep(
//         {
//           ...actionStepBase,
//           type: ActionStepType.CHECK_SUCCESS,
//           data: {
//             element: 'non existing success selector',
//             mapSuccess: [{ content: 'noop' }],
//             waitForElementTimeout: 2_000,
//           },
//         },
//         dummyRequestDataCallback,
//         dummyDataSourceItemIdRequest,
//       )
//       expect(result).toEqual({ errorType: ActionStepErrorType.ELEMENT_NOT_FOUND })
//     })
//   }, 10_000)

//   it('should perform "fillInput" step in testing mode', () => {
//     return withScraperTestingMode(async (scraper) => {
//       expect(await scraper.getInputElementValue('body > input')).toBe('')

//       const result = await scraper.performActionStep(
//         {
//           ...actionStepBase,
//           type: ActionStepType.FILL_INPUT,
//           data: {
//             element: 'body > input',
//             valueQuery: 'Custom.mock value',
//             waitForElementTimeout: 2_000,
//           },
//         },
//         onDataRequest,
//         dummyDataSourceItemIdRequest,
//       )

//       expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })

//       expect(await scraper.getInputElementValue('body > input')).toBe('mock value')
//     })
//   }, 10_000)

//   it('should perform "fillInput" step in testing mode resulting with error for given non existing button selector', () => {
//     return withScraperTestingMode(async (scraper) => {
//       const result = await scraper.performActionStep(
//         {
//           ...actionStepBase,
//           type: ActionStepType.FILL_INPUT,
//           data: {
//             element: 'non existing input selector',
//             valueQuery: 'Custom.mock value',
//             waitForElementTimeout: 2_000,
//           },
//         },
//         dummyRequestDataCallback,
//         dummyDataSourceItemIdRequest,
//       )
//       expect(result).toEqual({ errorType: ActionStepErrorType.ELEMENT_NOT_FOUND })
//     })
//   }, 10_000)

//   it('should perform "selectOption" step in testing mode', () => {
//     return withScraperTestingMode(async (scraper) => {
//       expect(await scraper.getSelectElementValue('body > select')).toBe('select option')

//       const result = await scraper.performActionStep(
//         {
//           ...actionStepBase,
//           type: ActionStepType.SELECT_OPTION,
//           data: {
//             element: 'body > select',
//             valueQuery: 'Custom.mock option',
//             waitForElementTimeout: 10_000,
//           },
//         },
//         onDataRequest,
//         dummyDataSourceItemIdRequest,
//       )

//       expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
//       expect(await scraper.getSelectElementValue('body > select')).toBe('mock option')
//     })
//   }, 30_000)

//   it('should perform "selectOption" step in testing mode resulting with proper error for non existing option', () => {
//     return withScraperTestingMode(async (scraper) => {
//       const result = await scraper.performActionStep(
//         {
//           ...actionStepBase,
//           type: ActionStepType.SELECT_OPTION,
//           data: {
//             element: 'body > select',
//             valueQuery: 'Custom.non existing option',
//             waitForElementTimeout: 10_000,
//           },
//         },
//         onDataRequest,
//         dummyDataSourceItemIdRequest,
//       )

//       expect(result).toEqual({ errorType: ActionStepErrorType.OPTION_NOT_SELECTED })
//       expect(await scraper.getSelectElementValue('body > select')).toBe('select option')
//     })
//   }, 10_000)
// })

// describe('Scraper.TESTING action', () => {
//   let server: ReturnType<typeof initServer> | null = null

//   beforeAll(() => {
//     server = initServer()
//   })
//   afterAll(() => {
//     server?.close()
//   })

//   it('should perform action in testing mode', () => {
//     return withScraperTestingMode(async (scraper) => {
//       const waitStep: ActionStep = {
//         ...actionStepBase,
//         type: ActionStepType.WAIT,
//         data: {
//           duration: 1000,
//         },
//       }
//       const waitForElementStep: ActionStep = {
//         ...actionStepBase,
//         type: ActionStepType.WAIT_FOR_ELEMENT,
//         data: {
//           element: 'body > h1',
//         },
//       }
//       const pressButtonStep: ActionStep = {
//         ...actionStepBase,
//         type: ActionStepType.PRESS_BUTTON,
//         data: {
//           element: 'body > button',
//           waitForNavigation: false,
//         },
//       }
//       const checkErrorStep: ActionStep = {
//         ...actionStepBase,
//         type: ActionStepType.CHECK_ERROR,
//         data: {
//           element: 'body > div#error-message',
//           mapError: [
//             {
//               errorType: ActionStepErrorType.UNKNOWN,
//               content: 'non existing error message',
//             },
//           ],
//           waitForElementTimeout: 2_000,
//         },
//       }
//       const checkSuccessStep: ActionStep = {
//         ...actionStepBase,
//         type: ActionStepType.CHECK_SUCCESS,
//         data: {
//           element: 'body > div#success-message',
//           mapSuccess: [
//             {
//               content: 'mock success [a-z]+',
//             },
//           ],
//           waitForElementTimeout: 2_000,
//         },
//       }

//       const steps = [
//         waitStep,
//         waitForElementStep,
//         pressButtonStep,
//         checkErrorStep,
//         checkSuccessStep,
//       ]

//       const action: Action = {
//         id: 0,
//         url: 'http://localhost:1357/mock-testing',
//         siteInstructionsId: 0,
//         name: 'mock action',
//         actionSteps: steps,
//       }

//       const actionExecutionResult = await scraper.performAction(
//         action,
//         'http://localhost:1357',
//         dummyRequestDataCallback,
//         dummyDataSourceItemIdRequest,
//       )
//       expect(actionExecutionResult).toEqual({
//         action,
//         actionStepsResults: steps.map((step) => ({
//           step,
//           result: { errorType: ActionStepErrorType.NO_ERROR },
//         })),
//       })
//     })
//   }, 30_000)
// })

// describe('Scraper.TESTING procedure', () => {
//   let server: ReturnType<typeof initServer> | null = null

//   beforeAll(() => {
//     server = initServer()
//   })
//   afterAll(() => {
//     server?.close()
//   })

//   it('should perform procedure in testing mode', () => {
//     return withScraperTestingMode(async (scraper) => {
//       const waitStep: ActionStep = {
//         ...actionStepBase,
//         type: ActionStepType.WAIT,
//         data: {
//           duration: 1000,
//         },
//       }
//       const waitForElementStep: ActionStep = {
//         ...actionStepBase,
//         type: ActionStepType.WAIT_FOR_ELEMENT,
//         data: {
//           element: 'body > h1',
//         },
//       }
//       const pressButtonStep: ActionStep = {
//         ...actionStepBase,
//         type: ActionStepType.PRESS_BUTTON,
//         data: {
//           element: 'body > button',
//           waitForNavigation: false,
//         },
//       }
//       const checkErrorStep: ActionStep = {
//         ...actionStepBase,
//         type: ActionStepType.CHECK_ERROR,
//         data: {
//           element: 'body > div#error-message',
//           mapError: [
//             {
//               errorType: ActionStepErrorType.UNKNOWN,
//               content: 'non existing error message',
//             },
//           ],
//           waitForElementTimeout: 2_000,
//         },
//       }
//       const checkSuccessStep: ActionStep = {
//         ...actionStepBase,
//         type: ActionStepType.CHECK_SUCCESS,
//         data: {
//           element: 'body > div#success-message',
//           mapSuccess: [
//             {
//               content: 'mock success [a-z]+',
//             },
//           ],
//           waitForElementTimeout: 2_000,
//         },
//       }

//       const steps = [
//         waitStep,
//         waitForElementStep,
//         pressButtonStep,
//         checkErrorStep,
//         checkSuccessStep,
//       ]

//       const action: Action = {
//         id: 0,
//         url: null,
//         siteInstructionsId: 0,
//         name: 'mock action',
//         actionSteps: steps,
//       }

//       const mainFlow: FlowStep = {
//         id: 0,
//         actionName: 'action.mock action',
//         globalReturnValues: [],
//         onSuccess: {
//           id: 1,
//           actionName: 'global.finishProcedure',
//           globalReturnValues: ['#success-message'],
//           onSuccess: null,
//           onFailure: null,
//         },
//         onFailure: {
//           id: 2,
//           actionName: 'global.finishProcedureWithError',
//           globalReturnValues: [],
//           onSuccess: null,
//           onFailure: null,
//         },
//       }

//       const procedure: Procedure = {
//         id: 0,
//         name: 'mock procedure',
//         type: ProcedureType.ACCOUNT_CHECK,
//         startUrl: 'http://localhost:1357/mock-testing',
//         waitFor: 'body > h1',
//         siteInstructionsId: 0,
//         flow: mainFlow,
//       }

//       const procedureExecutionResult = await scraper.performProcedure(
//         'http://localhost:1357',
//         procedure,
//         [action],
//         dummyRequestDataCallback,
//         dummyDataSourceItemIdRequest,
//       )
//       expect(procedureExecutionResult).toEqual({
//         procedure,
//         flowExecutionResult: {
//           flow: mainFlow,
//           flowStepsResults: [
//             {
//               flowStep: omit(mainFlow, 'onSuccess', 'onFailure'),
//               actionResult: {
//                 action,
//                 actionStepsResults: steps.map((step) => ({
//                   step,
//                   result: { errorType: ActionStepErrorType.NO_ERROR },
//                 })),
//               },
//               returnedValues: [],
//               succeeded: true,
//             },
//             {
//               flowStep: omit(mainFlow.onSuccess!, 'onSuccess', 'onFailure'),
//               actionResult: null,
//               returnedValues: ['mock success message'],
//               succeeded: true,
//             },
//           ],
//         },
//       } satisfies ProcedureExecutionResult)
//     })
//   }, 20_000)
// })

// describe('Scraper.TESTING multiple instances', () => {
//   let server: ReturnType<typeof initServer> | null = null

//   beforeAll(() => {
//     server = initServer()
//   })
//   afterAll(() => {
//     server?.close()
//   })

//   it('should allow to create multiple instances of scraper in testing mode', () => {
//     return Promise.all([
//       withScraperTestingMode(async (scraper) => {
//         const result = await scraper.performActionStep(
//           {
//             ...actionStepBase,
//             type: ActionStepType.WAIT,
//             data: {
//               duration: 1000,
//             },
//           },
//           dummyRequestDataCallback,
//           dummyDataSourceItemIdRequest,
//         )
//         expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
//       }),
//       withScraperTestingMode(async (scraper) => {
//         const result = await scraper.performActionStep(
//           {
//             ...actionStepBase,
//             type: ActionStepType.WAIT,
//             data: {
//               duration: 1000,
//             },
//           },
//           dummyRequestDataCallback,
//           dummyDataSourceItemIdRequest,
//         )
//         expect(result).toEqual({ errorType: ActionStepErrorType.NO_ERROR })
//       }, 'http://localhost:1357/mock-preview'),
//     ])
//   })
// })

function isBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str
  } catch {
    return false
  }
}
