// import { databaseMock, mockData } from '../../../test-utils/databaseMock'
// import type { HandlersInterface } from '../../../test-utils/handlers.helpers'
// import '../../../test-utils/electronMock'
// import { pick, type RendererToElectronMessage } from '@web-scraper/common'
// import { mockReset, type DeepMockProxy } from 'jest-mock-extended'
// import { registerRequestsHandler } from '../requestHandler'
// import { ipcMain } from 'electron'

// describe('routineHandler', () => {
//   const ipcMainMock = ipcMain as DeepMockProxy<typeof ipcMain>
//   const handlers = new Map<string, HandlersInterface[RendererToElectronMessage]>()

//   beforeEach(() => {
//     mockReset(databaseMock)

//     mockReset(ipcMainMock.handle)
//     handlers.clear()
//     ipcMainMock.handle.mockImplementation((channel, handler) => {
//       handlers.set(channel, handler)
//     })
//   })

//   it('should return routines', async () => {
//     databaseMock.routine.findMany.mockResolvedValue([
//       pick(mockData.routines[0], 'id', 'name') as (typeof mockData.routines)[number],
//     ])

//     registerRequestsHandler()

//     const getRoutines = handlers.get(
//       'getRoutines',
//     ) as HandlersInterface[RendererToElectronMessage.getRoutines]

//     expect(getRoutines).toBeDefined()
//     await expect(getRoutines(null as never)).resolves.toEqual([
//       {
//         id: 1,
//         name: 'Mocked routine',
//       },
//     ])
//   })

//   it('should return routine with given id', async () => {
//     databaseMock.routine.findUnique.mockResolvedValue(mockData.routinesWithProcedures[0])
//     databaseMock.flowStep.findUnique.mockResolvedValue({
//       ...mockData.flowSteps[0],
//     })

//     registerRequestsHandler()

//     const getRoutine = handlers.get(
//       'getRoutine',
//     ) as HandlersInterface[RendererToElectronMessage.getRoutine]

//     expect(getRoutine).toBeDefined()
//     await expect(getRoutine(null as never, 1)).resolves.toEqual({
//       id: 1,
//       name: 'Mocked routine',
//       description: 'Mocked routine description',
//       stopOnError: false,
//       executionPlan: { type: 'standalone', repeat: 3 },
//       procedures: [
//         {
//           flow: {
//             actionName: 'action.name',
//             globalReturnValues: [],
//             id: 1,
//             onFailure: null,
//             onSuccess: {
//               actionName: 'global.finishProcedure',
//               globalReturnValues: [],
//               id: 2,
//               onFailure: null,
//               onSuccess: null,
//             },
//           },
//           id: 1,
//           name: 'Login',
//           siteInstructionsId: 1,
//           startUrl: '{{URL.ORIGIN}}/login',
//           type: 'accountCheck',
//           waitFor: 'body > h1',
//         },
//       ],
//     })
//   })

//   //TODO: RendererToElectronMessage.executeRoutine
// })
