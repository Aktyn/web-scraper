-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Action" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "siteInstructionsId" INTEGER NOT NULL,
    CONSTRAINT "Action_siteInstructionsId_fkey" FOREIGN KEY ("siteInstructionsId") REFERENCES "SiteInstructions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Action" ("id", "name", "siteInstructionsId", "url") SELECT "id", "name", "siteInstructionsId", "url" FROM "Action";
DROP TABLE "Action";
ALTER TABLE "new_Action" RENAME TO "Action";
CREATE TABLE "new_Procedure" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "startUrl" TEXT NOT NULL,
    "waitFor" TEXT,
    "siteInstructionsId" INTEGER NOT NULL,
    "flowStepId" INTEGER,
    CONSTRAINT "Procedure_siteInstructionsId_fkey" FOREIGN KEY ("siteInstructionsId") REFERENCES "SiteInstructions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Procedure_flowStepId_fkey" FOREIGN KEY ("flowStepId") REFERENCES "FlowStep" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Procedure" ("flowStepId", "id", "siteInstructionsId", "startUrl", "type", "waitFor") SELECT "flowStepId", "id", "siteInstructionsId", "startUrl", "type", "waitFor" FROM "Procedure";
DROP TABLE "Procedure";
ALTER TABLE "new_Procedure" RENAME TO "Procedure";
CREATE TABLE "new_SiteTagsRelation" (
    "tagId" INTEGER NOT NULL,
    "siteId" INTEGER NOT NULL,

    PRIMARY KEY ("tagId", "siteId"),
    CONSTRAINT "SiteTagsRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "SiteTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SiteTagsRelation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SiteTagsRelation" ("siteId", "tagId") SELECT "siteId", "tagId" FROM "SiteTagsRelation";
DROP TABLE "SiteTagsRelation";
ALTER TABLE "new_SiteTagsRelation" RENAME TO "SiteTagsRelation";
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loginOrEmail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "additionalCredentialsData" TEXT,
    "lastUsed" DATETIME,
    "active" BOOLEAN DEFAULT true,
    "siteId" INTEGER NOT NULL,
    CONSTRAINT "Account_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("active", "additionalCredentialsData", "createdAt", "id", "lastUsed", "loginOrEmail", "password", "siteId") SELECT "active", "additionalCredentialsData", "createdAt", "id", "lastUsed", "loginOrEmail", "password", "siteId" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE TABLE "new_ActionStep" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "data" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "actionId" INTEGER NOT NULL,
    CONSTRAINT "ActionStep_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ActionStep" ("actionId", "data", "id", "orderIndex", "type") SELECT "actionId", "data", "id", "orderIndex", "type" FROM "ActionStep";
DROP TABLE "ActionStep";
ALTER TABLE "new_ActionStep" RENAME TO "ActionStep";
CREATE UNIQUE INDEX "ActionStep_actionId_orderIndex_key" ON "ActionStep"("actionId", "orderIndex");
CREATE TABLE "new_SiteInstructions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "siteId" INTEGER NOT NULL,
    CONSTRAINT "SiteInstructions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SiteInstructions" ("createdAt", "id", "siteId") SELECT "createdAt", "id", "siteId" FROM "SiteInstructions";
DROP TABLE "SiteInstructions";
ALTER TABLE "new_SiteInstructions" RENAME TO "SiteInstructions";
CREATE UNIQUE INDEX "SiteInstructions_siteId_key" ON "SiteInstructions"("siteId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
