import type { DataBridge as DataBridgeInterface } from "@web-scraper/core"
import { sql } from "drizzle-orm"
import type { DbModule } from "./db.module"

type SourceTypeKey<SourcesType> =
  SourcesType extends Record<infer Key, string> ? `${Key & string}.${string}` : never

export class DataBridge<SourcesType extends Record<string, string>> implements DataBridgeInterface {
  constructor(
    private readonly db: DbModule,
    private readonly dataSources: SourcesType,
  ) {}

  async get(key: SourceTypeKey<SourcesType>) {
    // const result = await this.db.get(key)

    const [source, column] = key.split(".") as [string & keyof SourcesType, string]
    const tableName = this.dataSources[source]

    //TODO: all use store tables are supposed to have a numeric id column; use it to get specific row
    const result = await this.db.run(
      sql.raw(`
      SELECT ${column} FROM ${tableName} LIMIT 1`),
    )
    return result.rows.at(0)?.[column]?.toString() ?? null
  }

  async set(_key: SourceTypeKey<SourcesType>, _value: string): Promise<void> {
    //TODO: implement
  }

  async delete(_key: SourceTypeKey<SourcesType>): Promise<void> {
    //TODO: implement
  }
}
