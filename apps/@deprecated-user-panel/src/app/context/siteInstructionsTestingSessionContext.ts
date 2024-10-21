import { createContext } from 'react'
import type { TestingSessionSchema } from '../modules/ScraperTestingSessionsModule'

export const SiteInstructionsTestingSessionContext = createContext<{
  testingSession: TestingSessionSchema
  pickElement: () => Promise<string | null>
  cancelPickingElement: () => void
} | null>(null)
