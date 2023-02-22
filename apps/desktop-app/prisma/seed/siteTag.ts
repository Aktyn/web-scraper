import type { PrismaClient } from '@prisma/client'

export async function seedSiteTag(prisma: PrismaClient) {
  await prisma.siteTag.create({ data: { name: 'Email', description: 'Email site' } })
  await prisma.siteTag.create({ data: { name: 'Torrent', description: 'Torrents site' } })
  await prisma.siteTag.create({ data: { name: 'Food', description: 'Food service site' } })
  await prisma.siteTag.create({ data: { name: 'Shop' } })
  await prisma.siteTag.create({
    data: { name: 'Test', description: 'Mocked tag just for seed purposes' },
  })
}
