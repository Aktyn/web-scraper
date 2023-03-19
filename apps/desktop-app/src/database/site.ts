import type { Site } from '@prisma/client'
import { ErrorCode, type UpsertSiteSchema, upsertSiteSchema } from '@web-scrapper/common'

import Database from './index'

export function getSites(request: { count: number; cursor?: { id: number } }) {
  return Database.prisma.site.findMany({
    take: request.count,
    skip: request.cursor ? 1 : 0,
    cursor: request.cursor,
    include: {
      Tags: {
        include: {
          Tag: true,
        },
      },
    },
    orderBy: {
      id: 'desc',
    },
  })
}

function validateUpsertSchema(data: UpsertSiteSchema) {
  try {
    upsertSiteSchema.validateSync(data)
  } catch (error) {
    throw ErrorCode.INCORRECT_DATA
  }
}

async function throwIfUrlExists(url: string, omitId?: Site['id']) {
  if (omitId) {
    if (
      await Database.prisma.site.findFirst({
        where: {
          AND: [
            { id: { not: omitId } },
            {
              url: url.toLowerCase(),
            },
          ],
        },
      })
    ) {
      throw ErrorCode.ENTRY_ALREADY_EXISTS
    }
  } else if (
    await Database.prisma.site.findUnique({
      where: {
        url: url.toLowerCase(),
      },
    })
  ) {
    throw ErrorCode.ENTRY_ALREADY_EXISTS
  }
}

export async function createSite(data: UpsertSiteSchema) {
  validateUpsertSchema(data)
  await throwIfUrlExists(data.url)

  return Database.prisma.site.create({
    data: {
      url: data.url.toLowerCase(),
      language: data.language,
    },
    include: {
      Tags: {
        include: {
          Tag: true,
        },
      },
    },
  })
}

export async function updateSite(id: number, data: UpsertSiteSchema) {
  validateUpsertSchema(data)
  await throwIfUrlExists(data.url, id)

  return Database.prisma.site.update({
    where: { id },
    data: {
      url: data.url.toLowerCase(),
      language: data.language,
    },
    include: {
      Tags: {
        include: {
          Tag: true,
        },
      },
    },
  })
}

export function deleteSite(id: number) {
  return Database.prisma.site.delete({
    where: { id },
  })
}
