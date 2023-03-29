/*
  Warnings:

  - A unique constraint covering the columns `[siteId,loginOrEmail]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Made the column `url` on table `Site` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Site" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "language" TEXT
);
INSERT INTO "new_Site" ("createdAt", "id", "language", "url") SELECT "createdAt", "id", "language", "url" FROM "Site";
DROP TABLE "Site";
ALTER TABLE "new_Site" RENAME TO "Site";
CREATE UNIQUE INDEX "Site_url_key" ON "Site"("url");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Account_siteId_loginOrEmail_key" ON "Account"("siteId", "loginOrEmail");
