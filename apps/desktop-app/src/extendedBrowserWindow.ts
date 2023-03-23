import type { ElectronApi, ElectronToRendererMessage } from '@web-scraper/common'
import { BrowserWindow } from 'electron'

export class ExtendedBrowserWindow extends BrowserWindow {
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
