import Database from './index'

export function getAccounts(request: { count: number; cursor?: { id: number } }) {
  return Database.prisma.account.findMany({
    take: request.count,
    skip: request.cursor ? 1 : 0,
    cursor: request.cursor,
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
