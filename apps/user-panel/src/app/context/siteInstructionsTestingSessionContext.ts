import { createContext } from 'react'
import type { TestingSessionSchema } from '../api/useTestingSessions'

export const SiteInstructionsTestingSessionContext = createContext<TestingSessionSchema | null>(
  null,
)
