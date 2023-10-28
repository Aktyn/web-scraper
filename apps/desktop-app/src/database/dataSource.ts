import {
  DataSourceColumnType,
  type DataSourceItem,
  type DataSourceStructure,
  ErrorCode,
  type PaginatedRequest,
  safePromise,
  upsertDataSourceItemSchema,
  type UpsertDataSourceItemSchema,
  upsertDataSourceStructureSchema,
  type UpsertDataSourceStructureSchema,
} from '@web-scraper/common'

import { parseDatabaseDataSourceItem } from '../api/internal/parsers/dataSourceParser'

import Database from './index'

type RawDataSourceTableSchema = { name: string }
export type RawDataSourceItemSchema = { id: number; [_: string]: number | string | null }

//NOTE: $queryRaw cannot be used in some cases due to https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#dynamic-table-names-in-postgresql

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

export function getDataSourceItems(
  request: PaginatedRequest<DataSourceItem, 'id'>,
  dataSourceName: string,
) {
  const tableName = 'DataSource.' + dataSourceName

  //TODO: support for request.filters

  if (request.cursor) {
    return Database.prisma.$queryRawUnsafe<RawDataSourceItemSchema[]>(`
      SELECT * FROM "${tableName}"
      WHERE id <= (
        SELECT id FROM "${tableName}"
        WHERE id = ${request.cursor.id}
      )
      ORDER BY id DESC
      LIMIT ${request.count}
      OFFSET 1;
    `)
  }

  return Database.prisma.$queryRawUnsafe<RawDataSourceItemSchema[]>(`
    SELECT * FROM "${tableName}"
    ORDER BY id DESC
    LIMIT ${request.count}
    OFFSET 0
  `)
}

export function getAllDataSourceItems(dataSourceName: string) {
  const tableName = 'DataSource.' + dataSourceName

  return Database.prisma.$queryRawUnsafe<RawDataSourceItemSchema[]>(`
    SELECT * FROM "${tableName}"
  `)
}

function validateDataSourceStructureUpsertSchema(data: UpsertDataSourceStructureSchema) {
  try {
    upsertDataSourceStructureSchema.validateSync(data)
  } catch (error) {
    throw ErrorCode.INCORRECT_DATA
  }
}

export function deleteDataSource(dataSourceName: DataSourceStructure['name']) {
  const tableName = 'DataSource.' + dataSourceName
  return Database.prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${tableName}";`)
}

export async function createDataSource(data: UpsertDataSourceStructureSchema) {
  validateDataSourceStructureUpsertSchema(data)

  const tableName = 'DataSource.' + data.name

  const columnDefinitions = (data.columns ?? []).map(
    (column) => `"${column.name ?? 'noname'}" ${column.type ?? DataSourceColumnType.TEXT}`,
  )

  await Database.prisma.$executeRawUnsafe(`
    CREATE TABLE "${tableName}" (
      "id"	INTEGER,
      ${columnDefinitions.join(',\n')},
      PRIMARY KEY("id" AUTOINCREMENT)
    );
  `)

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
  validateDataSourceStructureUpsertSchema(data)

  await deleteDataSource(originalName)
  return createDataSource(data)
}

function validateDataSourceItemUpsertSchema(data: UpsertDataSourceItemSchema) {
  try {
    upsertDataSourceItemSchema.validateSync(data)
  } catch (error) {
    throw ErrorCode.INCORRECT_DATA
  }
}

export function deleteDataSourceItem(
  dataSourceName: DataSourceStructure['name'],
  itemId: DataSourceItem['id'],
) {
  const tableName = 'DataSource.' + dataSourceName
  return Database.prisma.$executeRawUnsafe(`DELETE FROM "${tableName}" WHERE id = ${itemId};`)
}

export async function clearDataSourceItems(dataSourceName: DataSourceStructure['name']) {
  const tableName = 'DataSource.' + dataSourceName
  await Database.prisma.$executeRawUnsafe(`DELETE FROM "${tableName}";`)
  await safePromise(
    Database.prisma.$executeRawUnsafe(
      `UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = "${tableName}";`,
    ),
  )
}

/** id column is not included */
function parseColumnNames(dataSourceItemData: UpsertDataSourceItemSchema) {
  return dataSourceItemData.data.map(({ columnName }) => `"${columnName}"`).join(', ')
}
/** id column is not included */
function parseColumnValues(dataSourceItemData: UpsertDataSourceItemSchema) {
  return dataSourceItemData.data
    .map(({ value }) => {
      if (value === null || value === undefined || value === '') {
        return 'NULL'
      }
      if (typeof value === 'string') {
        return `'${value}'`
      }
      return value
    })
    .join(', ')
}

export async function createDataSourceItem(
  dataSourceName: DataSourceStructure['name'],
  data: UpsertDataSourceItemSchema,
) {
  validateDataSourceItemUpsertSchema(data)

  const tableName = 'DataSource.' + dataSourceName

  await Database.prisma.$executeRawUnsafe(`
    INSERT INTO "${tableName}" (${parseColumnNames(data)})
    VALUES (${parseColumnValues(data)});
  `)
}

export async function insertRawDataSourceItems(
  dataSourceName: DataSourceStructure['name'],
  rawItems: RawDataSourceItemSchema[],
) {
  let totalAffectedRows = 0

  const tableName = 'DataSource.' + dataSourceName

  for (const item of rawItems) {
    try {
      const affectedRows = await Database.prisma.$executeRawUnsafe(`
    INSERT INTO "${tableName}" VALUES (${item.id}, ${parseColumnValues(
      parseDatabaseDataSourceItem(item),
    )});
  `)
      totalAffectedRows += affectedRows
    } catch {
      /* empty */
    }
  }

  return totalAffectedRows
}

export async function updateDataSourceItem(
  dataSourceName: DataSourceStructure['name'],
  itemId: DataSourceItem['id'],
  data: UpsertDataSourceItemSchema,
) {
  validateDataSourceItemUpsertSchema(data)

  const tableName = 'DataSource.' + dataSourceName

  await Database.prisma.$executeRawUnsafe(`
    UPDATE "${tableName}"
    SET (${parseColumnNames(data)}) = (${parseColumnValues(data)})
    WHERE id = ${itemId};
  `)

  const items = await Database.prisma.$queryRawUnsafe<RawDataSourceItemSchema[]>(`
    SELECT * FROM "${tableName}"
    WHERE id = ${itemId}
    LIMIT 1
  `)

  if (items.length !== 1) {
    throw ErrorCode.DATABASE_ERROR
  }
  return items[0]
}
