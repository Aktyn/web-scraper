import Database from './index'

export function getSiteTags() {
  return Database.prisma.siteTag.findMany({
    select: {
      name: true,
      description: true,
    },
  })
}
