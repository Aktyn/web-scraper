import type electron from 'electron'
import { mockDeep } from 'jest-mock-extended'

jest.mock('electron', () => ({
  __esModule: true,
  default: mockDeep<typeof electron>(),
  app: {
    isPackaged: true,
  },
  ipcMain: {
    handle: jest.fn(),
  },
  BrowserWindow: class BrowserWindowMock {
    constructor(_options: electron.BrowserWindowConstructorOptions) {
      //noop
    }
  },
}))
