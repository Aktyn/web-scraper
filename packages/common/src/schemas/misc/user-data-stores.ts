import z from "zod"

export enum SqliteColumnType {
  TEXT = "TEXT",
  NUMERIC = "NUMERIC",
  INTEGER = "INTEGER",
  REAL = "REAL",
  BLOB = "BLOB",
}

export const userDataStoreSchema = z.object({
  tableName: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  recordsCount: z.number(),
  columns: z.array(
    z.object({
      name: z.string(),
      type: z.nativeEnum(SqliteColumnType),
      notNull: z.boolean(),
      defaultValue: z.string().nullable(),
    }),
  ),
})

export type UserDataStore = z.infer<typeof userDataStoreSchema>
