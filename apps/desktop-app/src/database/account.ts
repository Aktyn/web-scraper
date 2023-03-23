import type { ElectronApi, RendererToElectronMessage } from '@web-scraper/common'

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
