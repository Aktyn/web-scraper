import "dotenv/config"
import { getApiModule } from "./api/api.module"
import { getConfig } from "./config/config"
import { getDbModule } from "./db/db.module"

async function main() {
  const config = getConfig()

  const db = getDbModule(config)

  const api = await getApiModule(db)

  api.listen({ port: 3000 }, (err, address) => {
    if (err) {
      api.log.error(err)
      process.exit(1)
    }
    console.info(`Server is now listening on ${address}`)
  })
}

main()
  .then(() => {
    console.info("Setup complete")
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
