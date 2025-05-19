import "dotenv/config"

import { getConfig } from "../../config/config"
import { getDbModule } from "../db.module"
import { usersTable } from "../schema"

async function seed() {
  const db = getDbModule(getConfig())

  await db.insert(usersTable).values({
    name: "John Doe",
    age: 25,
    email: "john.doe@example.com",
  })
}

seed()
  .then(() => {
    console.info("Seeding done")
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
