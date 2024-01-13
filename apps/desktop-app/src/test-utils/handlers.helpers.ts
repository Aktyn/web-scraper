import type { ElectronApi, RendererToElectronMessage } from '@web-scraper/common'
import { type IpcMainInvokeEvent } from 'electron'

export type HandlersInterface = {
  [key in RendererToElectronMessage]: (
    event: IpcMainInvokeEvent,
    ...args: Parameters<ElectronApi[key]>
  ) => ReturnType<ElectronApi[key]>
}
