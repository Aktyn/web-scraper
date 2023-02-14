import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getSiteTags() {
  try {
    return await prisma.siteTag.findMany({
      select: {
        name: true,
        description: true,
      },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}
