import { createContext } from 'react'
import { type TestingSessionSchema } from '../modules/ScraperTestingSessionsModule'

export const SiteInstructionsTestingSessionContext = createContext<TestingSessionSchema | null>(
  null,
)
