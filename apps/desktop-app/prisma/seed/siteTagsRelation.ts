import type { PrismaClient } from '@prisma/client'

export async function seedSiteTagsRelation(prisma: PrismaClient) {
  await prisma.siteTagsRelation.create({ data: { tagId: 1, siteId: 2 } })
  await prisma.siteTagsRelation.create({ data: { tagId: 2, siteId: 2 } })
  await prisma.siteTagsRelation.create({ data: { tagId: 3, siteId: 3 } })
  await prisma.siteTagsRelation.create({ data: { tagId: 4, siteId: 4 } })
  await prisma.siteTagsRelation.create({ data: { tagId: 5, siteId: 4 } })
}
