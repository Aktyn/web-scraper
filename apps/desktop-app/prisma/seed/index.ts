import { PrismaClient } from '@prisma/client'
import { createAndSeedDataSources } from './dataSources'
import { seedSite } from './site'
import { seedSiteInstructions } from './siteInstructions'
import { seedSiteTag } from './siteTag'
import { seedSiteTagsRelation } from './siteTagsRelation'
import { seedRoutine } from './routine'

const prisma = new PrismaClient()

async function main() {
  await seedSiteTag(prisma)
  await seedSite(prisma)
  await seedSiteTagsRelation(prisma)
  await seedSiteInstructions(prisma)
  await seedRoutine(prisma)
  await createAndSeedDataSources(prisma)
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
