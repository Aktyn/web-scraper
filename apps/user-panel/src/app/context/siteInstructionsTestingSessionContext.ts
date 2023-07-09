import { createContext } from 'react'
import { type TestingSessionSchema } from '../api/ScraperTestingSessionsModule'

export const SiteInstructionsTestingSessionContext = createContext<TestingSessionSchema | null>(
  null,
)
