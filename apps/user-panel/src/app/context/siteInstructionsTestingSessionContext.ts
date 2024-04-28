import { createContext } from 'react'
import type { TestingSessionSchema } from '../modules/ScraperTestingSessionsModule'

export const SiteInstructionsTestingSessionContext = createContext<{
  testingSession: TestingSessionSchema
  pickElement: (url?: string | null) => Promise<string | null>
  cancelPickingElement: () => void
} | null>(null)
