import type { PrismaClient } from '@prisma/client'
import { encrypt } from '../../src/utils'

export async function seedAccount(prisma: PrismaClient) {
  const password = 'mock-password'

  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000),
      loginOrEmail: encrypt('Mock-login-1', password, 'buffer'),
      password: encrypt('mock-password-1', password, 'buffer'),
      additionalCredentialsData: encrypt('{"mockData": "mockValue"}', password, 'buffer'),
      lastUsed: new Date(1677089943375),
      active: true,
      siteId: 1,
    },
  })
  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000 + 86400000),
      loginOrEmail: encrypt('Mock-login-2', password, 'buffer'),
      password: encrypt('mock-password-2', password, 'buffer'),
      lastUsed: new Date(1677089943375 - 86400000),
      active: true,
      siteId: 2,
    },
  })
  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000 + 86400000 * 2),
      loginOrEmail: encrypt('Mock-login-3', password, 'buffer'),
      password: encrypt('mock-password-3', password, 'buffer'),
      lastUsed: new Date(1677089943375 - 86400000 * 2),
      active: true,
      siteId: 3,
    },
  })
  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000 + 86400000 * 3),
      loginOrEmail: encrypt('Mock-login-4', password, 'buffer'),
      password: encrypt('mock-password-4', password, 'buffer'),
      lastUsed: new Date(1677089943375 - 86400000 * 3),
      active: true,
      siteId: 4,
    },
  })
  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000 + 86400000 * 4),
      loginOrEmail: encrypt('Mock-login-5', password, 'buffer'),
      password: encrypt('mock-password-5', password, 'buffer'),
      lastUsed: new Date(1677089943375 - 86400000 * 4),
      active: false,
      siteId: 2,
    },
  })
  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000 + 86400000 * 5),
      loginOrEmail: encrypt('Mock-login-6', password, 'buffer'),
      password: encrypt('mock-password-6', password, 'buffer'),
      lastUsed: new Date(1677089943375 - 86400000 * 5),
      active: true,
      siteId: 2,
    },
  })
  await prisma.account.create({
    data: {
      createdAt: new Date(1677089943375 - 2592000000 + 86400000 * 6),
      loginOrEmail: encrypt('Mock-login-7', password, 'buffer'),
      password: encrypt('mock-password-7', password, 'buffer'),
      lastUsed: new Date(1677089943375 - 86400000 * 6),
      active: true,
      siteId: 3,
    },
  })
}
