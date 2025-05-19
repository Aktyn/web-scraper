import "dotenv/config"
import { getApiModule } from "./api/api.module"
import { getConfig } from "./config/config"
import { getDbModule } from "./db/db.module"

async function main() {
  const config = getConfig()

  const db = getDbModule(config)

  await getApiModule(db)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
