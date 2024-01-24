-- CreateTable
CREATE TABLE "RoutineExecutionResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "routineId" INTEGER NOT NULL,
    "results" TEXT NOT NULL,
    CONSTRAINT "RoutineExecutionResult_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
