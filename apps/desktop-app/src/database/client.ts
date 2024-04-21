import fs from 'fs'
import path from 'path'
import url from 'url'

import { PrismaClient } from '@prisma/client'
import { app } from 'electron'

import { EXECUTABLE_DIRECTORY_PATH, EXTERNAL_DIRECTORY_PATH } from '../utils'

console.info('EXECUTABLE_DIRECTORY_PATH', EXECUTABLE_DIRECTORY_PATH)

const databaseFilePath = (() => {
  if (app.isPackaged) {
    return path.join(EXTERNAL_DIRECTORY_PATH, 'data.db')
  } else {
    const localDatabaseFilePath = path.resolve(EXECUTABLE_DIRECTORY_PATH, 'data.db')

    if (!fs.existsSync(localDatabaseFilePath)) {
      // eslint-disable-next-line no-console
      console.log('Generating database file...')
      fs.copyFileSync(path.join(EXTERNAL_DIRECTORY_PATH, 'data.db'), localDatabaseFilePath)
    }

    return localDatabaseFilePath
  }
})()

const databaseUrl = url
  .pathToFileURL(databaseFilePath)
  .href.replace(/^file:(\/)+([a-z]:)/i, 'file:$2')

console.info('Database URL:', databaseUrl)

const prisma = new PrismaClient({
  // log: ['query'],
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})
export default prisma
