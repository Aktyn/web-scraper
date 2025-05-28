import { seed } from "./seed"

console.info("Seeding database...")
seed()
  .then(() => {
    console.info("\t... seeding done")
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
