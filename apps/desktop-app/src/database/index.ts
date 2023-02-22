import * as account from './account'
import prisma from './client'
import * as siteTag from './siteTag'

const Database = {
  prisma,
  siteTag,
  account,
  disconnect: () => prisma.$disconnect(),
  utils: {
    extractCursor: <DataType, Property extends keyof DataType>(
      data: DataType[],
      propertyName: Property,
      count: number,
    ): undefined | { [key in Property]: DataType[Property] } => {
      const last = data.at(-1)
      if (!last || data.length < count) {
        return undefined
      }

      return { [propertyName]: last[propertyName] } as { [key in Property]: DataType[Property] }
    },
  },
}

export default Database
