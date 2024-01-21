import type { PrismaClient } from '@prisma/client'

export async function createAndSeedDataSources(prisma: PrismaClient) {
  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "DataSource.Example" (
    "id"	      INTEGER,
    "Title"	    TEXT,
    "Timestamp" INTEGER,
    "Custom"    TEXT,
    PRIMARY KEY("id" AUTOINCREMENT)
  )`
  await prisma.$executeRaw`INSERT OR REPLACE INTO "DataSource.Example" ("Title", "Timestamp", "Custom") VALUES ('Unset', NULL, NULL)`

  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "DataSource.Crypto" (
    "id"	              INTEGER,
    "Crypto name"	      TEXT,
    "Price"             REAL,
    "Update timestamp"  INTEGER,
    PRIMARY KEY("id" AUTOINCREMENT)
  )`
  await prisma.$executeRaw`INSERT OR REPLACE INTO "DataSource.Crypto" ("Crypto name", "Price", "Update timestamp") VALUES ('Dogecoin', NULL, NULL)`
  await prisma.$executeRaw`INSERT OR REPLACE INTO "DataSource.Crypto" ("Crypto name", "Price", "Update timestamp") VALUES ('Bitcoin', NULL, NULL)`
  await prisma.$executeRaw`INSERT OR REPLACE INTO "DataSource.Crypto" ("Crypto name", "Price", "Update timestamp") VALUES ('Monero', NULL, NULL)`
  await prisma.$executeRaw`INSERT OR REPLACE INTO "DataSource.Crypto" ("Crypto name", "Price", "Update timestamp") VALUES ('Ethereum', NULL, NULL)`
  await prisma.$executeRaw`INSERT OR REPLACE INTO "DataSource.Crypto" ("Crypto name", "Price", "Update timestamp") VALUES ('Ethereum classic', NULL, NULL)`
  await prisma.$executeRaw`INSERT OR REPLACE INTO "DataSource.Crypto" ("Crypto name", "Price", "Update timestamp") VALUES ('Memecoin', NULL, NULL)`
}
