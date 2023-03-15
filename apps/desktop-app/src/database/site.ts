import { createSiteSchema, type CreateSiteSchema, ErrorCode } from '@web-scrapper/common'

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

export async function createSite(data: CreateSiteSchema) {
  try {
    createSiteSchema.validateSync(data)
  } catch (error) {
    throw ErrorCode.INCORRECT_DATA
  }

  const siteWithGivenUrl = await Database.prisma.site.findUnique({
    where: { url: data.url.toLowerCase() },
  })

  if (siteWithGivenUrl) {
    throw ErrorCode.ENTRY_ALREADY_EXISTS
  }

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

export function deleteSite(id: number) {
  return Database.prisma.site.delete({
    where: { id },
  })
}
