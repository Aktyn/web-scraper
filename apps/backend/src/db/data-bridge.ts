import type { DataBridge as DataBridgeInterface } from "@web-scraper/core"
import { type DbModule } from "./db.module"

export class DataBridge implements DataBridgeInterface {
  constructor(private readonly db: DbModule) {}

  async get(_key: string): Promise<string | null> {
    // const result = await this.db.get(key)
    return "temp-value" //TODO: implement
  }

  async set(_key: string, _value: string): Promise<void> {
    //TODO: implement
  }

  async delete(_key: string): Promise<void> {
    //TODO: implement
  }
}
