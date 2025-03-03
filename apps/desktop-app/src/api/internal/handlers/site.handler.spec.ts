// import { databaseMock, mockData } from '../../../test-utils/databaseMock'
// import type { HandlersInterface } from '../../../test-utils/handlers.helpers'
// import '../../../test-utils/electronMock'
// import { ErrorCode, type RendererToElectronMessage } from '@web-scraper/common'
// import { mockReset, type DeepMockProxy } from 'jest-mock-extended'
// import { registerRequestsHandler } from '../requestHandler'
// import { ipcMain } from 'electron'

// describe('siteHandler', () => {
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

//   it('should return sites with tags', async () => {
//     databaseMock.site.findMany.mockResolvedValue(
//       mockData.sites.map((site) => ({
//         ...site,
//         Tags: mockData.siteTagsRelations.reduce(
//           (acc, siteTagsRelation) => {
//             if (siteTagsRelation.siteId === site.id) {
//               const tag = mockData.siteTags.find((tag) => tag.id === siteTagsRelation.tagId)
//               if (tag) {
//                 acc.push({
//                   Tag: tag,
//                 })
//               }
//             }
//             return acc
//           },
//           [] as { Tag: (typeof mockData.siteTags)[number] }[],
//         ),
//       })),
//     )

//     registerRequestsHandler()

//     const getSites = handlers.get(
//       'getSites',
//     ) as HandlersInterface[RendererToElectronMessage.getSites]

//     expect(getSites).toBeDefined()
//     await expect(getSites(null as never, { count: 20 })).resolves.toEqual({
//       cursor: undefined,
//       data: [
//         {
//           id: 1,
//           createdAt: new Date('2023-02-19T23:40:10.302Z'),
//           url: 'https://mocked-site.com',
//           language: 'en',
//           tags: [
//             {
//               id: 1,
//               name: 'Mock-1',
//               description: 'Mocked site 1',
//             },
//             {
//               id: 2,
//               name: 'Mock-2',
//               description: 'Mocked site 1',
//             },
//           ],
//         },
//         {
//           id: 2,
//           createdAt: new Date('2023-02-20T23:40:10.302Z'),
//           url: 'http://localhost:1357/mock-testing',
//           language: 'en',
//           tags: [],
//         },
//       ],
//     })
//   })

//   it('should return site with given id', async () => {
//     databaseMock.site.findUnique.mockResolvedValue({
//       ...mockData.sites[0],
//       Tags: [] as never,
//     })

//     registerRequestsHandler()

//     const getSite = handlers.get('getSite') as HandlersInterface[RendererToElectronMessage.getSite]

//     expect(getSite).toBeDefined()
//     await expect(getSite(null as never, 1)).resolves.toEqual({
//       id: 1,
//       createdAt: new Date('2023-02-19T23:40:10.302Z'),
//       url: 'https://mocked-site.com',
//       language: 'en',
//       tags: [],
//     })
//   })

//   it('should return created site', async () => {
//     databaseMock.site.create.mockResolvedValue({
//       ...mockData.sites[0],
//       Tags: [] as never,
//     })

//     registerRequestsHandler()

//     const createSite = handlers.get(
//       'createSite',
//     ) as HandlersInterface[RendererToElectronMessage.createSite]

//     expect(createSite).toBeDefined()
//     await expect(
//       createSite(null as never, { url: 'https://mocked-site.com', language: 'en', siteTags: [] }),
//     ).resolves.toEqual({
//       id: 1,
//       createdAt: new Date('2023-02-19T23:40:10.302Z'),
//       url: 'https://mocked-site.com',
//       language: 'en',
//       tags: [],
//     })
//   })

//   it('should delete site with given id', async () => {
//     databaseMock.site.delete.mockResolvedValue(mockData.sites[0])

//     registerRequestsHandler()

//     const deleteSite = handlers.get(
//       'deleteSite',
//     ) as HandlersInterface[RendererToElectronMessage.deleteSite]

//     expect(deleteSite).toBeDefined()
//     await expect(deleteSite(null as never, 1)).resolves.toEqual({
//       errorCode: ErrorCode.NO_ERROR,
//     })
//   })

//   it('should update site and return it', async () => {
//     databaseMock.site.update.mockResolvedValue({
//       ...mockData.sites[0],
//       Tags: [] as never,
//     })

//     registerRequestsHandler()

//     const updateSite = handlers.get(
//       'updateSite',
//     ) as HandlersInterface[RendererToElectronMessage.updateSite]

//     expect(updateSite).toBeDefined()
//     await expect(
//       updateSite(null as never, 1, {
//         url: 'https://mocked-site.com',
//         language: 'en',
//         siteTags: [],
//       }),
//     ).resolves.toEqual({
//       id: 1,
//       createdAt: new Date('2023-02-19T23:40:10.302Z'),
//       url: 'https://mocked-site.com',
//       language: 'en',
//       tags: [],
//     })
//   })
// })
