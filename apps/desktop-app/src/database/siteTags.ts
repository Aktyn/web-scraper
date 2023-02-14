import Database from './index'

export async function getSiteTags() {
  try {
    return await Database.prisma.siteTag.findMany({
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
