import type { ElectronApi, ElectronToRendererMessage } from '@web-scraper/common'
// eslint-disable-next-line import/no-extraneous-dependencies
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
  }

  sendMessage<Message extends ElectronToRendererMessage>(
    message: Message,
    ...args: ElectronApi[Message] extends (
      callback: (event: Event, ...args: infer T) => void,
    ) => void
      ? T
      : never
  ) {
    super.webContents.send(message, ...args)
  }
}
