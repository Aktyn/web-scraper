import prisma from './client'
import * as dataSource from './dataSource'
import * as routine from './routine'
import * as site from './site'
import * as siteInstructions from './siteInstructions'
import * as siteTag from './siteTag'
import * as userData from './userData'
import * as scraperJob from './scraperJob'

const Database = {
  prisma,
  dataSource,
  site,
  siteTag,
  siteInstructions,
  routine,
  userData,
  scraperJob,

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
