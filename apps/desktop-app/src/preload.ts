/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ElectronApi } from '@web-scraper/common'
// eslint-disable-next-line import/no-extraneous-dependencies
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

const electronToRendererMessageNames = [
  'windowStateChanged',
  'siteInstructionsTestingSessionOpen',
  'siteInstructionsTestingSessionClosed',
  'routineExecutionStarted',
  'routineExecutionResult',
  'routineExecutionFinished',
  'scraperExecutionStarted',
  'scraperExecutionResult',
  'scraperExecutionFinished',
  'requestManualDataForActionStep',
  'requestDataSourceItemIdForActionStep',
] as const
const rendererToElectronMessageNames = [
  'changeWindowState',

  'getUserSettings',
  'setUserSetting',

  'getDataSources',
  'createDataSource',
  'updateDataSource',
  'deleteDataSource',
  'createDataSourceItem',
  'updateDataSourceItem',
  'deleteDataSourceItem',
  'getDataSourceItems',
  'clearDataSourceItems',
  'exportDataSourceItems',
  'importDataSourceItems',

  'getSiteTags',
  'createSiteTag',
  'updateSiteTag',
  'deleteSiteTag',
  'deleteLooseSiteTags',

  'getSites',
  'getSite',
  'createSite',
  'updateSite',
  'deleteSite',
  'getSitePreview',

  'getSiteInstructions',
  'setSiteInstructions',
  'getProceduresGroupedBySite',

  'getRoutines',
  'getRoutine',
  'createRoutine',
  'updateRoutine',
  'deleteRoutine',
  'executeRoutine',
  'getRoutineExecutionHistory',

  'getSiteInstructionsTestingSessions',
  'startSiteInstructionsTestingSession',
  'endSiteInstructionsTestingSession',
  'testActionStep',
  'testAction',
  'testFlow',
  'testProcedure',
  'returnManualDataForActionStep',
  'returnDataSourceItemIdForActionStep',
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
