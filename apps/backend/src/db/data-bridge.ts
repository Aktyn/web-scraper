import {
  assert,
  type ScraperDataSource,
  whereSchemaToSql,
} from "@web-scraper/common"
import type {
  Cursor,
  DataBridge as DataBridgeInterface,
  DataBridgeValue,
} from "@web-scraper/core"
import { sql } from "drizzle-orm"
import type { DbModule } from "./db.module"
import { createTemporaryView, removeTemporaryView } from "./view-helpers"

export enum DataBridgeSourceType {
  Table = "table",
  TemporaryView = "temporaryView",
}

type SourceAlias = string

type DataBridgeSource = {
  type: DataBridgeSourceType
  name: string
}

type SourceTypeKey<SourcesType> =
  SourcesType extends Record<infer Key, DataBridgeSource>
    ? `${Key & string}.${string}`
    : never

export class DataBridge<
  SourcesType extends Record<SourceAlias, DataBridgeSource>,
> implements DataBridgeInterface
{
  constructor(
    private readonly db: DbModule,
    public readonly dataSources: SourcesType,
  ) {}

  async destroy() {
    for (const source of Object.values(this.dataSources)) {
      if (source.type === DataBridgeSourceType.TemporaryView) {
        await removeTemporaryView(this.db, source.name)
      }
    }
  }

  async get(key: SourceTypeKey<SourcesType>, cursor = { id: 1 }) {
    const { source, column } = this.parseKey(key)

    const result = await this.db
      .run(
        sql.raw(
          `SELECT ${column} FROM ${source.name} WHERE id = ${cursor.id} LIMIT 1`,
        ),
      )
      .execute()
    const value = result.rows.at(0)?.[column] ?? null

    if (typeof value === "bigint") {
      // Convert bigint to string to avoid precision issues
      return value.toString()
    } else if (value instanceof ArrayBuffer) {
      return new TextDecoder().decode(value)
    }

    return value
  }

  async set(
    key: SourceTypeKey<SourcesType>,
    value: DataBridgeValue,
    cursor?: { id?: number },
  ) {
    const { source, column } = this.parseKey(key)

    if (cursor?.id) {
      // Upsert row
      await this.db
        .run(
          sql`INSERT INTO ${sql.identifier(source.name)} (id, ${sql.identifier(
            column,
          )}) VALUES (${cursor.id}, ${value}) ON CONFLICT (id) DO UPDATE SET ${sql.identifier(column)} = ${value}`,
        )
        .execute()
    } else {
      // Create new row
      await this.db
        .run(
          sql`INSERT INTO ${sql.identifier(source.name)} (${sql.identifier(column)}) VALUES (${value})`,
        )
        .execute()
    }
  }

  async setMany(
    dataSourceName: string,
    items: Array<{ columnName: string; value: DataBridgeValue }>,
    cursor?: Cursor,
  ) {
    assert(
      dataSourceName in this.dataSources,
      `Unknown data source name: ${dataSourceName}`,
    )
    const source = this.dataSources[dataSourceName]

    const columns = items.map((item) => sql.identifier(item.columnName))
    const values = items.map((item) =>
      item.value === null || item.value === undefined
        ? sql.raw("NULL")
        : sql`${item.value}`,
    )

    if (cursor?.id) {
      // Upsert row
      const allColumns = [sql.identifier("id"), ...columns]
      const allValues = [sql`${cursor.id}`, ...values]

      const valuesQuery = sql.join(allValues, sql`, `)
      await this.db
        .run(
          sql`INSERT INTO ${sql.identifier(source.name)} (${sql.join(allColumns, sql`, `)}) VALUES (${valuesQuery}) ON CONFLICT (id) DO UPDATE SET ${sql.join(
            items.map(
              (item) =>
                sql`${sql.identifier(item.columnName)} = ${sql`${item.value}`}`,
            ),
            sql`, `,
          )}`,
        )
        .execute()
    } else {
      // Create new row
      await this.db
        .run(
          sql`INSERT INTO ${sql.identifier(source.name)} (${sql.join(columns, sql`, `)}) VALUES (${sql.join(values, sql`, `)})`,
        )
        .execute()
    }
  }

  async delete(sourceAlias: string, cursor?: Cursor) {
    assert(
      sourceAlias in this.dataSources,
      `Unknown source alias: ${sourceAlias}`,
    )
    const source = this.dataSources[sourceAlias]

    if (cursor?.id) {
      await this.db
        .run(
          sql`DELETE FROM ${sql.identifier(source.name)} WHERE id = ${cursor.id}`,
        )
        .execute()
    } else {
      await this.db
        .run(sql`DELETE FROM ${sql.identifier(source.name)}`)
        .execute()
    }
  }

  private parseKey(key: SourceTypeKey<SourcesType>) {
    assert(
      key.includes("."),
      `Invalid key format: ${key}. Expected format is 'sourceAlias.column'.`,
    )
    const [sourceAlias, column] = key.split(".") as [SourceAlias, string]

    assert(
      sourceAlias in this.dataSources,
      `Unknown source alias: ${sourceAlias}`,
    )

    const source = this.dataSources[sourceAlias]
    return { source, column }
  }

  static async buildDataBridgeSources(
    db: DbModule,
    dataSources: ScraperDataSource[],
  ) {
    const sources: Record<string, DataBridgeSource> = {}

    for (const dataSource of dataSources) {
      sources[dataSource.sourceAlias] = dataSource.whereSchema
        ? {
            type: DataBridgeSourceType.TemporaryView,
            name: await createTemporaryView(
              db,
              dataSource.dataStoreTableName,
              whereSchemaToSql(dataSource.whereSchema),
            ),
          }
        : {
            type: DataBridgeSourceType.Table,
            name: dataSource.dataStoreTableName,
          }
    }

    return sources
  }
}
