import {
  type SimpleLogger,
  assert,
  type ExecutionIterator,
  ExecutionIteratorType,
  type ScraperDataSource,
  SqliteConditionType,
  type WhereSchema,
  whereSchemaToSql,
} from "@web-scraper/common"
import type {
  DataBridge as DataBridgeInterface,
  DataBridgeValue,
} from "@web-scraper/core"
import { count, sql } from "drizzle-orm"
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

type Cursor<SourcesType extends Record<SourceAlias, DataBridgeSource>> = {
  dataSourceName: keyof SourcesType

  /** Number of rows to skip */
  offset: number | null

  /** Where clause to filter the rows */
  where: WhereSchema | null
}

export class DataBridge<
  SourcesType extends Record<SourceAlias, DataBridgeSource>,
> implements DataBridgeInterface
{
  private currentIteration = 1
  private countCache = new Map<ExecutionIterator, number>()

  constructor(
    private readonly db: DbModule,
    private readonly iterator: ExecutionIterator | null,
    private readonly dataSources: SourcesType,
    private readonly logger: SimpleLogger,
  ) {}

  async destroy() {
    for (const source of Object.values(this.dataSources)) {
      if (source.type === DataBridgeSourceType.TemporaryView) {
        await removeTemporaryView(this.db, source.name)
      }
    }
  }

  async isLastIteration() {
    if (!this.iterator) {
      return true
    }

    switch (this.iterator.type) {
      case ExecutionIteratorType.Range:
        if (typeof this.iterator.range === "number") {
          return true
        } else {
          return (
            this.iterator.range.start +
              (this.currentIteration - 1) * (this.iterator.range.step ?? 1) >=
            this.iterator.range.end
          )
        }
      case ExecutionIteratorType.EntireSet:
      case ExecutionIteratorType.FilteredSet: {
        const countResult = await this.countIteratorDataSource()
        return typeof countResult === "number"
          ? this.currentIteration >= countResult
          : null
      }
    }
  }

  private async countIteratorDataSource() {
    assert(!!this.iterator, "Iterator is required")

    if (this.countCache.has(this.iterator)) {
      return this.countCache.get(this.iterator)
    }

    const dataSourceName = this.iterator.dataSourceName

    assert(
      dataSourceName in this.dataSources,
      `Unknown data source name: ${dataSourceName}`,
    )
    const source = this.dataSources[dataSourceName]

    const countResult = await this.db
      .select({ count: count() })
      .from(sql.identifier(source.name).getSQL())
      .where(
        this.iterator.type === ExecutionIteratorType.FilteredSet
          ? sql.raw(whereSchemaToSql(this.iterator.where))
          : undefined,
      )
      .get()

    if (countResult) {
      this.countCache.set(this.iterator, countResult.count)
    }

    return countResult?.count
  }

  get iteration() {
    return this.currentIteration
  }

  async nextIteration() {
    if (await this.isLastIteration()) {
      return
    }
    this.currentIteration++
  }

  private get cursor(): Cursor<SourcesType> | null {
    if (!this.iterator) {
      return null
    }

    switch (this.iterator.type) {
      case ExecutionIteratorType.Range: {
        const value =
          typeof this.iterator.range === "number"
            ? this.iterator.range
            : this.iterator.range.start +
              (this.currentIteration - 1) * (this.iterator.range.step ?? 1)
        return {
          dataSourceName: this.iterator.dataSourceName,
          offset: null,
          where: {
            column: this.iterator.identifier,
            condition: SqliteConditionType.Equals,
            value,
          },
        }
      }
      case ExecutionIteratorType.EntireSet:
        return {
          dataSourceName: this.iterator.dataSourceName,
          offset: this.currentIteration - 1,
          where: null,
        }
      case ExecutionIteratorType.FilteredSet:
        return {
          dataSourceName: this.iterator.dataSourceName,
          offset: this.currentIteration - 1,
          where: this.iterator.where,
        }
    }
  }

  async get(key: SourceTypeKey<SourcesType>) {
    const { source, column, sourceAlias } = this.parseKey(key)
    const cursor = this.cursor

    let query = this.db
      .select({
        column: sql
          .identifier(column)
          .getSQL()
          .as<DataBridgeValue | bigint | ArrayBuffer>(column),
      })
      .from(sql.identifier(source.name).getSQL())

    if (cursor && cursor.dataSourceName === sourceAlias) {
      if (cursor.where) {
        query = query.where(
          sql.raw(whereSchemaToSql(cursor.where)),
        ) as typeof query
      }

      if (typeof cursor.offset === "number") {
        query = query.offset(cursor.offset) as typeof query
      }
    }

    const result = await query.limit(1).get()

    const value = result?.column ?? null

    if (typeof value === "bigint") {
      // Convert bigint to string to avoid precision issues
      return value.toString()
    } else if (value instanceof ArrayBuffer) {
      return new TextDecoder().decode(value)
    }

    return value
  }

  async set(key: SourceTypeKey<SourcesType>, value: DataBridgeValue) {
    const { column, sourceAlias } = this.parseKey(key)
    await this.setMany(sourceAlias, [{ columnName: column, value }])
  }

  async setMany(
    dataSourceName: string,
    items: Array<{ columnName: string; value: DataBridgeValue }>,
  ) {
    assert(
      dataSourceName in this.dataSources,
      `Unknown data source name: ${dataSourceName}`,
    )
    const source = this.dataSources[dataSourceName]
    const cursor = this.cursor

    if (cursor && cursor.dataSourceName === dataSourceName) {
      const setClauses = sql.join(
        items.map(
          (item) =>
            sql`${sql.identifier(item.columnName)} = ${item.value === null || item.value === undefined ? sql.raw("NULL") : sql`${item.value}`}`,
        ),
        sql`, `,
      )

      const whereClause = cursor.where
        ? sql` WHERE ${sql.raw(whereSchemaToSql(cursor.where))}`
        : sql``
      const offsetClause =
        typeof cursor.offset === "number"
          ? sql` OFFSET ${cursor.offset}`
          : sql``

      const query = sql`UPDATE ${sql.identifier(source.name)} SET ${setClauses} WHERE ${sql.identifier("id")} IN (SELECT ${sql.identifier("id")} FROM ${sql.identifier(source.name)}${whereClause} LIMIT 1${offsetClause})`

      const response = await this.db.run(query).execute()
      if (!response.rowsAffected) {
        this.logger.warn(`No rows were updated for ${source.name}`)
      }
    } else {
      const columns = items.map((item) => sql.identifier(item.columnName))
      const values = items.map((item) =>
        item.value === null || item.value === undefined
          ? sql.raw("NULL")
          : sql`${item.value}`,
      )

      await this.db
        .run(
          sql`INSERT INTO ${sql.identifier(source.name)} (${sql.join(columns, sql`, `)}) VALUES (${sql.join(values, sql`, `)})`,
        )
        .execute()
    }

    this.countCache.clear()
  }

  async delete(sourceAlias: string) {
    assert(
      sourceAlias in this.dataSources,
      `Unknown source alias: ${sourceAlias}`,
    )
    const source = this.dataSources[sourceAlias]
    const cursor = this.cursor

    if (!cursor || cursor.dataSourceName !== sourceAlias) {
      this.logger.error(
        `No cursor found for ${source.name}. It is required to delete data through the data bridge.`,
      )
      return
    }

    const whereClause = cursor.where
      ? sql` WHERE ${sql.raw(whereSchemaToSql(cursor.where))}`
      : sql``
    const offsetClause =
      typeof cursor.offset === "number" ? sql` OFFSET ${cursor.offset}` : sql``

    const query = sql`DELETE FROM ${sql.identifier(source.name)} WHERE ${sql.identifier("id")} IN (SELECT ${sql.identifier("id")} FROM ${sql.identifier(source.name)}${whereClause} LIMIT 1${offsetClause})`

    await this.db.run(query).execute()

    this.countCache.clear()
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
    return { source, column, sourceAlias }
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
