import type { Account, PrismaClient, SiteTag } from '@prisma/client'
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
  accounts: [
    {
      id: 1,
      loginOrEmail: 'Mock-username',
      password: 'Mock-password',
      additionalCredentialsData: null,
      lastUsed: new Date('2023-02-19T23:40:10.302Z'),
      active: true,
      siteId: 1,
    },
  ] as Account[],
}
