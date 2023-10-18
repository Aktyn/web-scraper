import {
  DataSourceColumnType,
  type DataSourceItem,
  type DataSourceStructure,
  ErrorCode,
  type PaginatedRequest,
  upsertDataSourceStructureSchema,
  type UpsertDataSourceStructureSchema,
} from '@web-scraper/common'

import Database from './index'

type RawDataSourceTableSchema = { name: string }

async function mapDataSourceTables(table: RawDataSourceTableSchema) {
  if (!table.name) {
    throw new Error('Table name is empty')
  }

  return {
    name: table.name,
    columns: await Database.prisma.$queryRaw<
      DataSourceStructure['columns']
    >`SELECT name, type FROM PRAGMA_TABLE_INFO(${table.name});`,
  }
}

export async function getDataSources() {
  const tables = await Database.prisma.$queryRaw<
    RawDataSourceTableSchema[]
  >`SELECT name FROM sqlite_master WHERE type = "table" AND name LIKE 'DataSource.%';`

  return Promise.all(tables.map(mapDataSourceTables))
}

export function getDataSourceItems(_request: PaginatedRequest<DataSourceItem, 'id'>) {
  return Promise.resolve([]) //TODO
}

function validateUpsertSchema(data: UpsertDataSourceStructureSchema) {
  try {
    upsertDataSourceStructureSchema.validateSync(data)
  } catch (error) {
    throw ErrorCode.INCORRECT_DATA
  }
}

export async function createDataSource(data: UpsertDataSourceStructureSchema) {
  validateUpsertSchema(data)

  const tableName = 'DataSource.' + data.name

  const columnDefinitions = (data.columns ?? []).map(
    (column) => `"${column.name ?? 'noname'}" ${column.type ?? DataSourceColumnType.TEXT}`,
  )

  const sql = `
    CREATE TABLE "${tableName}" (
      "id"	INTEGER,
      ${columnDefinitions.join(',\n')},
      PRIMARY KEY("id" AUTOINCREMENT)
    );
  `

  await Database.prisma.$executeRawUnsafe(sql)

  const tables = await Database.prisma.$queryRaw<
    RawDataSourceTableSchema[]
  >`SELECT name FROM sqlite_master WHERE type = "table" AND name = ${tableName};`

  if (tables.length !== 1) {
    throw ErrorCode.DATABASE_ERROR
  }

  return mapDataSourceTables(tables[0])
}

export async function updateDataSource(
  originalName: DataSourceStructure['name'],
  data: UpsertDataSourceStructureSchema,
) {
  validateUpsertSchema(data)

  await deleteDataSource(originalName)
  return createDataSource(data)
}

export function deleteDataSource(name: DataSourceStructure['name']) {
  const tableName = 'DataSource.' + name
  return Database.prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${tableName}";`)
}
