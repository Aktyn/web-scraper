// import { databaseMock, mockData } from '../../../test-utils/databaseMock'
// import type { HandlersInterface } from '../../../test-utils/handlers.helpers'
// import '../../../test-utils/electronMock'
// import { ErrorCode, type RendererToElectronMessage } from '@web-scraper/common'
// import { mockReset, type DeepMockProxy } from 'jest-mock-extended'
// import { registerRequestsHandler } from '../requestHandler'
// import { ipcMain } from 'electron'

// describe('siteInstructions', () => {
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

//   it('should return site instructions with given id', async () => {
//     databaseMock.siteInstructions.findUnique.mockResolvedValue({
//       ...mockData.siteInstructions[0],
//     })
//     databaseMock.flowStep.findUnique.mockResolvedValue({
//       ...mockData.flowSteps[0],
//     })

//     registerRequestsHandler()

//     const getSiteInstructions = handlers.get(
//       'getSiteInstructions',
//     ) as HandlersInterface[RendererToElectronMessage.getSiteInstructions]

//     expect(getSiteInstructions).toBeDefined()
//     await expect(getSiteInstructions(null as never, 1)).resolves.toEqual({
//       id: 1,
//       createdAt: new Date('2023-02-19T23:40:10.302Z'),
//       siteId: 1,
//       actions: [
//         {
//           actionSteps: [
//             {
//               actionId: 1,
//               data: {
//                 element: 'body > input[type=text]',
//               },
//               id: 1,
//               orderIndex: 1,
//               type: 'fillInput',
//             },
//             {
//               actionId: 1,
//               data: {
//                 element: 'body > button',
//                 waitForNavigation: false,
//               },
//               id: 2,
//               orderIndex: 2,
//               type: 'pressButton',
//             },
//             {
//               actionId: 1,
//               data: {
//                 element: 'body > div',
//                 mapSuccess: [
//                   {
//                     content: 'success',
//                     error: 'error.common.noError',
//                   },
//                 ],
//               },
//               id: 3,
//               orderIndex: 3,
//               type: 'checkSuccess',
//             },
//           ],
//           id: 1,
//           name: 'login',
//           siteInstructionsId: 1,
//           url: null,
//         },
//       ],
//       procedures: [
//         {
//           name: 'Login',
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
//           siteInstructionsId: 1,
//           startUrl: '{{URL.ORIGIN}}/login',
//           type: 'accountCheck',
//           waitFor: 'body > h1',
//         },
//       ],
//     })
//   })

//   it('should set site instructions', async () => {
//     registerRequestsHandler()

//     const setSiteInstructions = handlers.get(
//       'setSiteInstructions',
//     ) as HandlersInterface[RendererToElectronMessage.setSiteInstructions]

//     expect(setSiteInstructions).toBeDefined()
//     await expect(
//       setSiteInstructions(null as never, 1, {
//         procedures: [],
//         actions: [],
//       }),
//     ).resolves.toEqual({
//       errorCode: ErrorCode.NO_ERROR,
//     })
//   })
// })
