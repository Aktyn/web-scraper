import {
  WindowStateChange,
  ElectronToRendererMessage,
  type IpcRendererEventPolyfill,
  type ElectronApi,
} from '@web-scraper/common'

import { BrowserWindow } from 'electron'

/* istanbul ignore next */
export class ExtendedBrowserWindow extends BrowserWindow {
  private static readonly instances: Map<BrowserWindow['id'], ExtendedBrowserWindow> = new Map()

  public static getInstances() {
    return Array.from(ExtendedBrowserWindow.instances.values())
  }

  constructor(options: Electron.BrowserWindowConstructorOptions) {
    super(options)

    ExtendedBrowserWindow.instances.set(this.id, this)
    this.on('closed', () => {
      ExtendedBrowserWindow.instances.delete(this.id)
    })
    this.on('maximize', () => {
      this.sendMessage(ElectronToRendererMessage.windowStateChanged, WindowStateChange.MAXIMIZE)
    })
    this.on('unmaximize', () => {
      this.sendMessage(ElectronToRendererMessage.windowStateChanged, WindowStateChange.UNMAXIMIZE)
    })
    this.on('minimize', () => {
      this.sendMessage(ElectronToRendererMessage.windowStateChanged, WindowStateChange.MINIMIZE)
    })
    this.on('restore', () => {
      this.sendMessage(ElectronToRendererMessage.windowStateChanged, WindowStateChange.RESTORE)
    })
  }

  sendMessage<Message extends ElectronToRendererMessage>(
    message: Message,
    ...args: ElectronApi[Message] extends (
      callback: (event: IpcRendererEventPolyfill, ...args: infer T) => void,
    ) => void
      ? T
      : never
  ) {
    this.webContents.send(message, ...args)
  }
}
