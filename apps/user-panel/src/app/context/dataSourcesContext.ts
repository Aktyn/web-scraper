import { createContext } from 'react'
import type { DataSourceStructure } from '@web-scraper/common'

export const DataSourcesContext = createContext([] as DataSourceStructure[])
