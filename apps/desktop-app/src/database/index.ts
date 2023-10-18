import prisma from './client'
import * as dataSource from './dataSource'
import * as site from './site'
import * as siteInstructions from './siteInstructions'
import * as siteTag from './siteTag'
import * as userData from './userData'

const Database = {
  prisma,
  dataSource,
  site,
  siteTag,
  siteInstructions,
  userData,

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
