/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ElectronApi } from '@web-scrapper/common'
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

const electronToRendererMessageNames = ['dummyEventFromMain'] as const
const rendererToElectronMessageNames = [
  'getUserSettings',
  'setUserSetting',
  'getAccounts',
  'getSites',
  'createSite',
  'deleteSite',
  'getSitePreview',
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
