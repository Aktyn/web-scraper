import { int } from '@web-scraper/common'

export const Config = {
  rootElementId: 'root',
  APP_TITLE: import.meta.env.VITE_APP_TITLE,
  PAGINATION_PAGE_SIZE: int(import.meta.env.VITE_PAGINATION_PAGE_SIZE ?? 25),
} as const
