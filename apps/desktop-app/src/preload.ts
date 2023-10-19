/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ElectronApi } from '@web-scraper/common'
// eslint-disable-next-line import/no-extraneous-dependencies
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

const electronToRendererMessageNames = [
  'windowStateChanged',
  'siteInstructionsTestingSessionOpen',
  'siteInstructionsTestingSessionClosed',
  'scraperExecutionStarted',
  'scraperExecutionResult',
  'scraperExecutionFinished',
  'requestManualDataForActionStep',
] as const
const rendererToElectronMessageNames = [
  'changeWindowState',

  'getUserSettings',
  'setUserSetting',

  'getDataSources',
  'deleteDataSource',
  'updateDataSource',
  'createDataSource',
  'getDataSourceItems',
  'deleteDataSourceItem',
  'updateDataSourceItem',
  'createDataSourceItem',

  'getSiteTags',
  'deleteSiteTag',
  'updateSiteTag',
  'createSiteTag',
  'deleteLooseSiteTags',

  'getSites',
  'getSite',
  'createSite',
  'deleteSite',
  'updateSite',
  'getSitePreview',

  'getSiteInstructions',
  'setSiteInstructions',

  'getSiteInstructionsTestingSessions',
  'startSiteInstructionsTestingSession',
  'endSiteInstructionsTestingSession',
  'testActionStep',
  'testAction',
  'testFlow',
  'testProcedure',
  'returnManualDataForActionStep',
] as const

const api = {
  ...electronToRendererMessageNames.reduce(
    (acc, messageName) => {
      acc[messageName] = (callback) => ipcRenderer.on(messageName, callback)
      return acc
    },
    {} as {
      [key in (typeof electronToRendererMessageNames)[number]]: (
        callback: (event: IpcRendererEvent, ...args: any[]) => void,
      ) => void
    },
  ),
  ...rendererToElectronMessageNames.reduce(
    (acc, messageName) => {
      acc[messageName] = (...args) => ipcRenderer.invoke(messageName, ...args)
      return acc
    },
    {} as {
      [key in (typeof rendererToElectronMessageNames)[number]]: () => Promise<any>
    },
  ),
} satisfies ElectronApi

contextBridge.exposeInMainWorld('electronAPI', api)
