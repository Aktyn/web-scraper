/*
  Warnings:

  - You are about to drop the `Instruction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `instructionId` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `instructionId` on the `Procedure` table. All the data in the column will be lost.
  - Added the required column `siteInstructionsId` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteInstructionsId` to the `Procedure` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Instruction_siteId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Instruction";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SiteInstructions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "siteId" INTEGER NOT NULL,
    CONSTRAINT "SiteInstructions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Action" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "siteInstructionsId" INTEGER NOT NULL,
    CONSTRAINT "Action_siteInstructionsId_fkey" FOREIGN KEY ("siteInstructionsId") REFERENCES "SiteInstructions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Action" ("id", "name", "url") SELECT "id", "name", "url" FROM "Action";
DROP TABLE "Action";
ALTER TABLE "new_Action" RENAME TO "Action";
CREATE TABLE "new_Procedure" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "startUrl" TEXT NOT NULL,
    "waitFor" TEXT,
    "siteInstructionsId" INTEGER NOT NULL,
    "flowStepId" INTEGER NOT NULL,
    CONSTRAINT "Procedure_siteInstructionsId_fkey" FOREIGN KEY ("siteInstructionsId") REFERENCES "SiteInstructions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Procedure_flowStepId_fkey" FOREIGN KEY ("flowStepId") REFERENCES "FlowStep" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Procedure" ("flowStepId", "id", "startUrl", "type", "waitFor") SELECT "flowStepId", "id", "startUrl", "type", "waitFor" FROM "Procedure";
DROP TABLE "Procedure";
ALTER TABLE "new_Procedure" RENAME TO "Procedure";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "SiteInstructions_siteId_key" ON "SiteInstructions"("siteId");
