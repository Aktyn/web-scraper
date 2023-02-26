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
  ] satisfies SiteTag[],
  accounts: [
    {
      id: 1,
      createdAt: new Date('2023-02-19T23:40:10.302Z'),
      loginOrEmail: 'Mock-username-1',
      password: 'Mock-password-1',
      additionalCredentialsData: null,
      lastUsed: new Date('2023-02-19T23:40:10.302Z'),
      active: true,
      siteId: 1,
    },
    {
      id: 2,
      createdAt: new Date('2023-02-22T23:40:10.302Z'),
      loginOrEmail: 'Mock-username-2',
      password: 'Mock-password-2',
      additionalCredentialsData: '{"value": "mock-data"}',
      lastUsed: new Date('2023-02-22T23:40:10.302Z'),
      active: true,
      siteId: 1,
    },
  ] satisfies Account[],
}
