import type { Account, PrismaClient, SiteTag, UserData } from '@prisma/client'
import { vi } from 'vitest'
import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended'

import prisma from '../database/client'
import { encrypt } from '../utils'

vi.mock('../database/client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

export const databaseMock = prisma as unknown as DeepMockProxy<PrismaClient>

const mockPassword = 'mock-password'

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
      loginOrEmail: encrypt('Mock-username-1', mockPassword, 'buffer'),
      password: encrypt('Mock-password-1', mockPassword, 'buffer'),
      additionalCredentialsData: null,
      lastUsed: new Date('2023-02-19T23:40:10.302Z'),
      active: true,
      siteId: 1,
    },
    {
      id: 2,
      createdAt: new Date('2023-02-22T23:40:10.302Z'),
      loginOrEmail: encrypt('Mock-username-2', mockPassword, 'buffer'),
      password: encrypt('Mock-password-2', mockPassword, 'buffer'),
      additionalCredentialsData: encrypt('{"value": "mock-data"}', mockPassword, 'buffer'),
      lastUsed: new Date('2023-02-22T23:40:10.302Z'),
      active: true,
      siteId: 1,
    },
  ] satisfies Account[],
  userData: [
    {
      key: 'tablesCompactMode',
      value: JSON.stringify(true),
    },
  ] satisfies UserData[],
}
