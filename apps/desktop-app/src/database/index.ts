import prisma from './client'
import * as siteTags from './siteTags'

const Database = {
  prisma,
  siteTags,
  disconnect: () => prisma.$disconnect(),
}

export default Database
