import type { Account as DatabaseAccount } from '@prisma/client'
import { ErrorCode, upsertAccountSchema } from '@web-scraper/common'
import type {
  ElectronApi,
  RendererToElectronMessage,
  UpsertAccountSchema,
} from '@web-scraper/common'

import { encrypt } from '../utils'

import Database from './index'

export function getAccounts(
  request: Parameters<ElectronApi[RendererToElectronMessage.getAccounts]>[0],
) {
  return Database.prisma.account.findMany({
    take: request.count,
    skip: request.cursor ? 1 : 0,
    cursor: request.cursor,
    where: request.filters?.length
      ? {
          AND: request.filters,
        }
      : undefined,
    select: {
      id: true,
      createdAt: true,
      loginOrEmail: true,
      password: true,
      additionalCredentialsData: true,
      lastUsed: true,
      active: true,
      siteId: true,
    },
    orderBy: {
      id: 'desc',
    },
  })
}

function validateUpsertSchema(data: UpsertAccountSchema) {
  try {
    upsertAccountSchema.validateSync(data)
  } catch (error) {
    throw ErrorCode.INCORRECT_DATA
  }
}

function encryptUpsertAccountSchema(data: UpsertAccountSchema, password: string) {
  return {
    ...data,
    loginOrEmail: encrypt(data.loginOrEmail, password, 'buffer'),
    password: encrypt(data.password, password, 'buffer'),
    additionalCredentialsData: data.additionalCredentialsData
      ? encrypt(data.additionalCredentialsData, password, 'buffer')
      : null,
  }
}

export async function createAccount(data: UpsertAccountSchema, password: string) {
  validateUpsertSchema(data)

  return Database.prisma.account.create({
    data: encryptUpsertAccountSchema(data, password),
  })
}

export async function updateAccount(
  id: DatabaseAccount['id'],
  data: UpsertAccountSchema,
  password: string,
) {
  validateUpsertSchema(data)

  return Database.prisma.account.update({
    where: { id },
    data: encryptUpsertAccountSchema(data, password),
  })
}

export function deleteAccount(id: DatabaseAccount['id']) {
  return Database.prisma.account.delete({
    where: { id },
  })
}
