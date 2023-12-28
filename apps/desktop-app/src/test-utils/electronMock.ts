import type electron from 'electron'
import { mockDeep } from 'jest-mock-extended'

jest.mock('electron', () => ({
  __esModule: true,
  default: mockDeep<typeof electron>(),
  ipcMain: {
    handle: jest.fn(),
  },
  BrowserWindow: class BrowserWindowMock {
    constructor(_options: electron.BrowserWindowConstructorOptions) {
      //noop
    }
  },
}))

jest.mock('electron-is-dev', () => ({
  __esModule: true,
  default: true,
}))
