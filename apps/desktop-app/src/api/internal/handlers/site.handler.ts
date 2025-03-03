import { type RequestHandlersSchema } from '../helpers'

export const siteHandler = {
  // [RendererToElectronMessage.getSites]: handleApiRequest(
  //   RendererToElectronMessage.getSites,
  //   (request) =>
  //     Database.site.getSites(request).then((sites) => ({
  //       data: sites.map(parseDatabaseSite),
  //       cursor: Database.utils.extractCursor(sites, 'id', request.count),
  //     })),
  // ),
  // [RendererToElectronMessage.getSite]: handleApiRequest(RendererToElectronMessage.getSite, (id) =>
  //   Database.site.getSite(id).then(parseDatabaseSite),
  // ),
  // [RendererToElectronMessage.createSite]: handleApiRequest(
  //   RendererToElectronMessage.createSite,
  //   (data) => Database.site.createSite(data).then(parseDatabaseSite),
  // ),
  // [RendererToElectronMessage.deleteSite]: handleApiRequest(
  //   RendererToElectronMessage.deleteSite,
  //   (id) => Database.site.deleteSite(id).then(() => successResponse),
  // ),
  // [RendererToElectronMessage.updateSite]: handleApiRequest(
  //   RendererToElectronMessage.updateSite,
  //   (id, data) => Database.site.updateSite(id, data).then(parseDatabaseSite),
  // ),
  // [RendererToElectronMessage.getSitePreview]: handleApiRequest(
  //   RendererToElectronMessage.getSitePreview,
  //   async (url) => {
  //     const scraperPreviewInstance =
  //       Array.from(Scraper.getInstances(Scraper.Mode.PREVIEW).values()).at(0) ??
  //       new Scraper(Scraper.Mode.PREVIEW, {
  //         viewportWidth: 1280,
  //         viewportHeight: 720,
  //       })
  //     await scraperPreviewInstance.waitForInit()
  //     return {
  //       imageBase64: await scraperPreviewInstance.takeScreenshot(url),
  //     }
  //   },
  // ),
} satisfies Partial<RequestHandlersSchema>
