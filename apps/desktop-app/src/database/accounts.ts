import Database from './index'

export async function getAccounts() {
  try {
    return await Database.prisma.account.findMany({
      select: {
        id: true,
        loginOrEmail: true,
        password: true,
        additionalCredentialsData: true,
        lastUsed: true,
        active: true,
        siteId: true,
      },
    })
  } catch (error) {
    console.error(error)
    return []
  }
}
