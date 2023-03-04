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
}))
