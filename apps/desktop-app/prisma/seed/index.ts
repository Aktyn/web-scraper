import { PrismaClient } from '@prisma/client'
import { seedAccount } from './account'
import { seedSite } from './site'
import { seedSiteTag } from './siteTag'
import { seedSiteTagsRelation } from './siteTagsRelation'

const prisma = new PrismaClient()

async function main() {
  await seedSiteTag(prisma)
  await seedSite(prisma)
  await seedSiteTagsRelation(prisma)
  await seedAccount(prisma)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
