/*
  Warnings:

  - Made the column `name` on table `Procedure` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Procedure" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startUrl" TEXT NOT NULL,
    "waitFor" TEXT,
    "siteInstructionsId" INTEGER NOT NULL,
    "flowStepId" INTEGER,
    CONSTRAINT "Procedure_siteInstructionsId_fkey" FOREIGN KEY ("siteInstructionsId") REFERENCES "SiteInstructions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Procedure_flowStepId_fkey" FOREIGN KEY ("flowStepId") REFERENCES "FlowStep" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Procedure" ("flowStepId", "id", "name", "siteInstructionsId", "startUrl", "type", "waitFor") SELECT "flowStepId", "id", "name", "siteInstructionsId", "startUrl", "type", "waitFor" FROM "Procedure";
DROP TABLE "Procedure";
ALTER TABLE "new_Procedure" RENAME TO "Procedure";
CREATE UNIQUE INDEX "Procedure_name_key" ON "Procedure"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
