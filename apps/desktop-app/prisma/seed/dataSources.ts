import type { PrismaClient } from '@prisma/client'

export async function createAndSeedDataSources(prisma: PrismaClient) {
  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "DataSource.Example" (
    "id"	INTEGER,
    "exampleColumn"	TEXT,
    PRIMARY KEY("id" AUTOINCREMENT)
  )`
  await prisma.$executeRaw`INSERT OR REPLACE INTO "DataSource.Example" ("exampleColumn") VALUES ('example value 1')`
  await prisma.$executeRaw`INSERT OR REPLACE INTO "DataSource.Example" ("exampleColumn") VALUES ('example value 2')`
  await prisma.$executeRaw`INSERT OR REPLACE INTO "DataSource.Example" ("exampleColumn") VALUES ('example value 3')`
  await prisma.$executeRaw`INSERT OR REPLACE INTO "DataSource.Example" ("exampleColumn") VALUES ('example value 4')`
}
