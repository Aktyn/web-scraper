import type { ElectronApi } from '@web-scrapper/common'

declare global {
  interface Window {
    electronAPI: ElectronApi
  }
}
