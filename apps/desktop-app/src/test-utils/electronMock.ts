/* eslint-disable import/order */
import { vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import type electron from 'electron'

vi.mock('electron', () => ({
  __esModule: true,
  default: mockDeep<typeof electron>(),
  ipcMain: {
    handle: vi.fn(),
  },
  BrowserWindow: class BrowserWindowMock {
    constructor(_options: electron.BrowserWindowConstructorOptions) {
      //noop
    }
  },
}))

vi.mock('electron-is-dev', () => ({
  __esModule: true,
  default: true,
}))
