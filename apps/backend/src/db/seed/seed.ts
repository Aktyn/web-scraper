import "dotenv/config"

import { getConfig } from "../../config/config"
import { getDbModule } from "../db.module"
import { preferencesTable } from "../schema"

export async function seed(db = getDbModule(getConfig())) {
  await db.insert(preferencesTable).values({
    key: "foo",
    value: "bar",
  })
}
