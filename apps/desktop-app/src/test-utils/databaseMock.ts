import type {
  Account,
  PrismaClient,
  Site,
  SiteTag,
  SiteTagsRelation,
  UserData,
} from '@prisma/client'
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
      name: 'Mock-1',
      description: 'Mocked site 1',
    },
    {
      id: 2,
      name: 'Mock-2',
      description: 'Mocked site 1',
    },
  ] satisfies SiteTag[],
  siteTagsRelations: [
    {
      tagId: 1,
      siteId: 1,
    },
    {
      tagId: 2,
      siteId: 1,
    },
  ] satisfies SiteTagsRelation[],
  sites: [
    {
      id: 1,
      createdAt: new Date('2023-02-19T23:40:10.302Z'),
      url: 'https://mocked-site.com',
      language: 'en',
    },
  ] satisfies Site[],
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
