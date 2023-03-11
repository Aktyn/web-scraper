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
