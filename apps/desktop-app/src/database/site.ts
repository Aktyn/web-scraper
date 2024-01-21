import type { Site as DatabaseSite } from '@prisma/client'
import {
  ErrorCode,
  upsertSiteSchema,
  type PaginatedRequest,
  type Site,
  type SiteInstructions,
  type UpsertSiteSchema,
} from '@web-scraper/common'

import Database from './index'

export function getSites(request: PaginatedRequest<Site, 'id'>) {
  return Database.prisma.site.findMany({
    take: request.count,
    skip: request.cursor ? 1 : 0,
    cursor: request.cursor,
    where:
      Array.isArray(request.filters) && request.filters?.length
        ? {
            AND: request.filters as never,
          }
        : undefined,
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

export async function getSite(id: DatabaseSite['id']) {
  const site = await Database.prisma.site.findUnique({
    where: {
      id,
    },
    include: {
      Tags: {
        include: {
          Tag: true,
        },
      },
    },
  })

  if (!site) {
    throw ErrorCode.NOT_FOUND
  }

  return site
}

export async function getSiteByInstructionsId(siteInstructionsId: SiteInstructions['id']) {
  return Database.prisma.site.findFirstOrThrow({
    where: {
      SiteInstructions: {
        id: siteInstructionsId,
      },
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

function validateUpsertSchema(data: UpsertSiteSchema) {
  try {
    upsertSiteSchema.validateSync(data)
  } catch (error) {
    throw ErrorCode.INCORRECT_DATA
  }
}

async function throwIfUrlExists(url: string, omitId?: DatabaseSite['id']) {
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
      Tags: {
        create: data.siteTags.map((siteTag) => ({
          tagId: siteTag.id,
        })),
      },
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

  await Database.prisma.siteTagsRelation.deleteMany({
    where: {
      siteId: id,
    },
  })

  return Database.prisma.site.update({
    where: { id },
    data: {
      url: data.url.toLowerCase(),
      language: data.language,
      Tags: {
        create: data.siteTags.map((siteTag) => ({
          tagId: siteTag.id,
        })),
      },
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
