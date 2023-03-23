import type { ElectronApi } from '@web-scraper/common'

declare global {
  interface Window {
    electronAPI: ElectronApi
  }
}
