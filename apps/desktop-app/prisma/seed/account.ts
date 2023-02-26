import type { PrismaClient } from '@prisma/client'

export async function seedAccount(prisma: PrismaClient) {
  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000),
      loginOrEmail: 'Mock-login-1',
      password: 'mock-password-1',
      additionalCredentialsData: '{"mockData": "mockValue"}',
      lastUsed: new Date(1677089943375),
      active: true,
      siteId: 1,
    },
  })
  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000 + 86400000),
      loginOrEmail: 'Mock-login-2',
      password: 'mock-password-2',
      lastUsed: new Date(1677089943375 - 86400000),
      active: true,
      siteId: 2,
    },
  })
  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000 + 86400000 * 2),
      loginOrEmail: 'Mock-login-3',
      password: 'mock-password-3',
      lastUsed: new Date(1677089943375 - 86400000 * 2),
      active: true,
      siteId: 3,
    },
  })
  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000 + 86400000 * 3),
      loginOrEmail: 'Mock-login-4',
      password: 'mock-password-4',
      lastUsed: new Date(1677089943375 - 86400000 * 3),
      active: true,
      siteId: 4,
    },
  })
  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000 + 86400000 * 4),
      loginOrEmail: 'Mock-login-5',
      password: 'mock-password-5',
      lastUsed: new Date(1677089943375 - 86400000 * 4),
      active: false,
      siteId: 2,
    },
  })
  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000 + 86400000 * 5),
      loginOrEmail: 'Mock-login-6',
      password: 'mock-password-6',
      lastUsed: new Date(1677089943375 - 86400000 * 5),
      active: true,
      siteId: 2,
    },
  })
  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000 + 86400000 * 6),
      loginOrEmail: 'Mock-login-7',
      password: 'mock-password-7',
      lastUsed: new Date(1677089943375 - 86400000 * 6),
      active: true,
      siteId: 3,
    },
  })
}
