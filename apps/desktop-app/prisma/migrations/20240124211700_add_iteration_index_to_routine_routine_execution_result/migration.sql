/*
  Warnings:

  - Added the required column `iterationIndex` to the `RoutineExecutionResult` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RoutineExecutionResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "routineId" INTEGER NOT NULL,
    "iterationIndex" INTEGER NOT NULL,
    "results" TEXT NOT NULL,
    CONSTRAINT "RoutineExecutionResult_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RoutineExecutionResult" ("createdAt", "id", "results", "routineId") SELECT "createdAt", "id", "results", "routineId" FROM "RoutineExecutionResult";
DROP TABLE "RoutineExecutionResult";
ALTER TABLE "new_RoutineExecutionResult" RENAME TO "RoutineExecutionResult";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
