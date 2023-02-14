import type { PrismaClient, SiteTag } from '@prisma/client'
import { vi } from 'vitest'
import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended'

import prisma from '../database/client'

vi.mock('../database/client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

export const databaseMock = prisma as unknown as DeepMockProxy<PrismaClient>

export const mockData = {
  siteTags: [
    {
      id: 1,
      name: 'Mock',
      description: 'Mocked site',
    },
  ] as SiteTag[],
}
