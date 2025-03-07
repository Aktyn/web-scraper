import type { SiteTag as DatabaseSiteTag } from '@prisma/client'
import {
  ErrorCode,
  type PaginatedRequest,
  type SiteTag,
  upsertSiteTagSchema,
  type UpsertSiteTagSchema,
} from '@web-scraper/common'

import Database from './index'

export function getSiteTags(request: PaginatedRequest<SiteTag, 'id'>) {
  return Database.prisma.siteTag.findMany({
    take: request.count,
    skip: request.cursor ? 1 : 0,
    cursor: request.cursor ? { id: request.cursor } : undefined,
    where:
      Array.isArray(request.filters) && request.filters?.length
        ? {
            AND: request.filters,
          }
        : undefined,
    orderBy: {
      id: 'desc',
    },
  })
}

function validateUpsertSchema(data: UpsertSiteTagSchema) {
  try {
    return upsertSiteTagSchema.parse(data)
  } catch {
    throw ErrorCode.INCORRECT_DATA
  }
}

async function throwIfNameExists(name: string, omitId?: DatabaseSiteTag['id']) {
  if (omitId) {
    if (
      await Database.prisma.siteTag.findFirst({
        where: {
          AND: [
            { id: { not: omitId } },
            {
              name: name.toLowerCase(),
            },
          ],
        },
      })
    ) {
      throw ErrorCode.ENTRY_ALREADY_EXISTS
    }
  } else if (
    await Database.prisma.siteTag.findUnique({
      where: {
        name: name.toLowerCase(),
      },
    })
  ) {
    throw ErrorCode.ENTRY_ALREADY_EXISTS
  }
}

export async function createSiteTag(data: UpsertSiteTagSchema) {
  const schema = validateUpsertSchema(data)
  await throwIfNameExists(schema.name)

  return Database.prisma.siteTag.create({
    data: {
      name: schema.name,
      description: schema.description,
    },
  })
}

export async function updateSiteTag(id: number, data: UpsertSiteTagSchema) {
  const schema = validateUpsertSchema(data)
  await throwIfNameExists(schema.name, id)

  return Database.prisma.siteTag.update({
    where: { id },
    data: {
      name: schema.name,
      description: schema.description,
    },
  })
}

export function deleteSiteTag(id: number) {
  return Database.prisma.siteTag.delete({
    where: { id },
  })
}

export function deleteLooseSiteTags() {
  return Database.prisma.siteTag.deleteMany({
    where: {
      Sites: {
        none: {},
      },
    },
  })
}
