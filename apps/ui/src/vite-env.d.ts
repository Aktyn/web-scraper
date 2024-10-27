/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAGINATION_PAGE_SIZE: number
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
