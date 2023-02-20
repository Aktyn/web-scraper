import * as accounts from './accounts'
import prisma from './client'
import * as siteTags from './siteTags'

const Database = {
  prisma,
  siteTags,
  accounts,
  disconnect: () => prisma.$disconnect(),
}

export default Database
