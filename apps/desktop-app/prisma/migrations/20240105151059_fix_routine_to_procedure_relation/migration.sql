-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RoutineProcedureRelation" (
    "procedureId" INTEGER NOT NULL,
    "routineId" INTEGER NOT NULL,

    PRIMARY KEY ("procedureId", "routineId"),
    CONSTRAINT "RoutineProcedureRelation_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoutineProcedureRelation_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RoutineProcedureRelation" ("procedureId", "routineId") SELECT "procedureId", "routineId" FROM "RoutineProcedureRelation";
DROP TABLE "RoutineProcedureRelation";
ALTER TABLE "new_RoutineProcedureRelation" RENAME TO "RoutineProcedureRelation";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
