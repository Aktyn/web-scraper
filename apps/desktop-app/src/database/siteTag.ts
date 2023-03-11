import Database from './index'

export function getSiteTags() {
  return Database.prisma.siteTag.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
  })
}
