import type { DataBridge as DataBridgeInterface } from "@web-scraper/core"
import { sql } from "drizzle-orm"
import type { DbModule } from "./db.module"

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

  async get(key: SourceTypeKey<SourcesType>) {
    const [sourceAlias, column] = key.split(".") as [SourceAlias, string]
    const source = this.dataSources[sourceAlias]

    //TODO: all user-store-tables are supposed to have a numeric id column; use it to get specific row when scraper runs iteratively
    const result = await this.db
      .run(sql.raw(`SELECT ${column} FROM ${source.name} LIMIT 1`))
      .execute()
    return result.rows.at(0)?.[column]?.toString() ?? null
  }

  async set(_key: SourceTypeKey<SourcesType>, _value: string): Promise<void> {
    //TODO: implement, consider renaming the method to "upsert"
  }

  async delete(_key: SourceTypeKey<SourcesType>): Promise<void> {
    //TODO: implement
  }
}
