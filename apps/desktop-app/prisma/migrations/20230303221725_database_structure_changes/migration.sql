/*
  Warnings:

  - You are about to alter the column `additionalCredentialsData` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `String` to `Binary`.
  - You are about to alter the column `loginOrEmail` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `String` to `Binary`.
  - You are about to alter the column `password` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `String` to `Binary`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loginOrEmail" BLOB NOT NULL,
    "password" BLOB NOT NULL,
    "additionalCredentialsData" BLOB,
    "lastUsed" DATETIME,
    "active" BOOLEAN DEFAULT true,
    "siteId" INTEGER NOT NULL,
    CONSTRAINT "Account_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("active", "additionalCredentialsData", "createdAt", "id", "lastUsed", "loginOrEmail", "password", "siteId") SELECT "active", "additionalCredentialsData", "createdAt", "id", "lastUsed", "loginOrEmail", "password", "siteId" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
