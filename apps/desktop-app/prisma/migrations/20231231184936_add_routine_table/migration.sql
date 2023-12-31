/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Procedure` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Procedure" ADD COLUMN "name" TEXT;

-- CreateTable
CREATE TABLE "Routine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stopOnError" BOOLEAN NOT NULL DEFAULT false,
    "executionPlan" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RoutineProcedureRelation" (
    "procedureId" INTEGER NOT NULL,
    "routineId" INTEGER NOT NULL,

    PRIMARY KEY ("procedureId", "routineId"),
    CONSTRAINT "RoutineProcedureRelation_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RoutineProcedureRelation_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Routine_name_key" ON "Routine"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_name_key" ON "Procedure"("name");
