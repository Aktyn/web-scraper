import {
  ErrorCode,
  type PaginatedRequest,
  type ScraperJob,
  upsertScraperJobSchema,
  type UpsertScraperJobSchema,
} from '@web-scraper/common'
import Database from './index'

export function getScraperJobs(request: PaginatedRequest<ScraperJob, 'id'>) {
  return Database.prisma.scraperJob.findMany({
    take: request.count,
    skip: request.cursor ? 1 : 0,
    cursor: request.cursor,
    where:
      Array.isArray(request.filters) && request.filters?.length
        ? {
            AND: request.filters as never,
          }
        : undefined,
    orderBy: {
      id: 'desc',
    },
  })
}

function validateUpsertSchema(data: UpsertScraperJobSchema) {
  try {
    return upsertScraperJobSchema.parse(data)
  } catch {
    throw ErrorCode.INCORRECT_DATA
  }
}

export function createScraperJob(data: UpsertScraperJobSchema) {
  const schema = validateUpsertSchema(data)

  return Database.prisma.scraperJob.create({
    data: {
      name: schema.name,
      startUrl: schema.startUrl,
      execution: JSON.stringify(schema.execution),
    },
  })
}

export function updateScraperJob(id: ScraperJob['id'], data: UpsertScraperJobSchema) {
  const schema = validateUpsertSchema(data)

  return Database.prisma.scraperJob.update({
    where: { id },
    data: {
      name: schema.name,
      startUrl: schema.startUrl,
      execution: JSON.stringify(schema.execution),
    },
  })
}

export function deleteScraperJob(id: ScraperJob['id']) {
  return Database.prisma.scraperJob.delete({ where: { id } })
}
