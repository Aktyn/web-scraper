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
    upsertScraperJobSchema.validateSync(data)
  } catch {
    throw ErrorCode.INCORRECT_DATA
  }
}

export function createScraperJob(data: UpsertScraperJobSchema) {
  validateUpsertSchema(data)

  return Database.prisma.scraperJob.create({
    data: {
      name: data.name,
      startUrl: data.startUrl,
      execution: JSON.stringify(data.execution),
    },
  })
}

export function deleteScraperJob(id: ScraperJob['id']) {
  return Database.prisma.scraperJob.delete({ where: { id } })
}
