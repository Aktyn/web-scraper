-- CreateTable
CREATE TABLE "Instruction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "siteId" INTEGER NOT NULL,
    CONSTRAINT "Instruction_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Action" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "instructionId" INTEGER NOT NULL,
    CONSTRAINT "Action_instructionId_fkey" FOREIGN KEY ("instructionId") REFERENCES "Instruction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionStep" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "data" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "actionId" INTEGER NOT NULL,
    CONSTRAINT "ActionStep_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "startUrl" TEXT NOT NULL,
    "waitFor" TEXT,
    "instructionId" INTEGER NOT NULL,
    "flowStepId" INTEGER NOT NULL,
    CONSTRAINT "Procedure_instructionId_fkey" FOREIGN KEY ("instructionId") REFERENCES "Instruction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Procedure_flowStepId_fkey" FOREIGN KEY ("flowStepId") REFERENCES "FlowStep" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlowStep" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "actionName" TEXT NOT NULL,
    "globalReturnValues" TEXT,
    "onSuccessFlowStepId" INTEGER,
    "onFailureFlowStepId" INTEGER,
    CONSTRAINT "FlowStep_onSuccessFlowStepId_fkey" FOREIGN KEY ("onSuccessFlowStepId") REFERENCES "FlowStep" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FlowStep_onFailureFlowStepId_fkey" FOREIGN KEY ("onFailureFlowStepId") REFERENCES "FlowStep" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Site" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT,
    "language" TEXT
);
INSERT INTO "new_Site" ("id", "language", "url") SELECT "id", "language", "url" FROM "Site";
DROP TABLE "Site";
ALTER TABLE "new_Site" RENAME TO "Site";
CREATE UNIQUE INDEX "Site_url_key" ON "Site"("url");
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loginOrEmail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "additionalCredentialsData" TEXT,
    "lastUsed" DATETIME,
    "active" BOOLEAN DEFAULT true,
    "siteId" INTEGER NOT NULL,
    CONSTRAINT "Account_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("active", "additionalCredentialsData", "id", "lastUsed", "loginOrEmail", "password", "siteId") SELECT "active", "additionalCredentialsData", "id", "lastUsed", "loginOrEmail", "password", "siteId" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "ActionStep_actionId_orderIndex_key" ON "ActionStep"("actionId", "orderIndex");
