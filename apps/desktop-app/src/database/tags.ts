import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getTags() {
  try {
    return await prisma.tag.findMany({
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
