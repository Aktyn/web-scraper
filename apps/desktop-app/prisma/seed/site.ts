import type { PrismaClient } from '@prisma/client'

export async function seedSite(prisma: PrismaClient) {
  await prisma.site.create({ data: { url: 'https://example.com/', language: 'EN' } })
  await prisma.site.create({ data: { url: 'https://www.onet.pl/', language: 'PL' } })
  await prisma.site.create({ data: { url: 'https://www.interia.pl/', language: 'PL' } })
  await prisma.site.create({ data: { url: 'https://www.pyszne.pl/', language: 'PL' } })
  await prisma.site.create({ data: { url: 'https://allegro.pl/', language: 'PL' } })
  await prisma.site.create({ data: { url: 'https://coinmarketcap.com/', language: 'EN' } })
}
