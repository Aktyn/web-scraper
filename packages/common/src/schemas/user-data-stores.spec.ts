import { describe, it, expect } from "vitest"
import {
  SqliteColumnType,
  userDataStoreSchema,
  createUserDataStoreSchema,
  upsertUserDataStoreRecordSchemaFactory,
} from "./user-data-stores"

describe("userDataStore schemas", () => {
  describe("userDataStoreSchema", () => {
    it("should validate a correct user data store object", () => {
      const store = {
        tableName: "users",
        name: "Users",
        description: "A table of users",
        recordsCount: 0,
        columns: [
          { name: "id", type: SqliteColumnType.INTEGER },
          { name: "name", type: SqliteColumnType.TEXT, notNull: true },
        ],
      }
      const result = userDataStoreSchema.safeParse(store)
      expect(result.success).toBe(true)
    })
  })

  describe("createUserDataStoreSchema", () => {
    it("should validate a correct create user data store object", () => {
      const store = {
        name: "Users",
        description: "A table of users",
        columns: [
          { name: "id", type: SqliteColumnType.INTEGER },
          { name: "name", type: SqliteColumnType.TEXT, notNull: true },
        ],
      }
      const result = createUserDataStoreSchema.safeParse(store)
      expect(result.success).toBe(true)
    })

    it("should fail if columns are empty", () => {
      const store = {
        name: "Users",
        description: "A table of users",
        columns: [],
      }
      const result = createUserDataStoreSchema.safeParse(store)
      expect(result.success).toBe(false)
    })
  })

  describe("upsertUserDataStoreRecordSchemaFactory", () => {
    const columns = [
      { name: "id", type: SqliteColumnType.INTEGER },
      { name: "name", type: SqliteColumnType.TEXT, notNull: true },
      { name: "age", type: SqliteColumnType.INTEGER },
      { name: "salary", type: SqliteColumnType.REAL },
      { name: "is_active", type: SqliteColumnType.BOOLEAN },
      { name: "data", type: SqliteColumnType.BLOB },
      { name: "created_at", type: SqliteColumnType.TIMESTAMP },
    ]
    const schema = upsertUserDataStoreRecordSchemaFactory(columns)

    it("should create a schema that validates a correct record", () => {
      const record = {
        name: "John Doe",
        age: 30,
        salary: 50000.5,
        is_active: true,
        data: "data:application/octet-stream;base64,AAAA",
        created_at: Date.now(),
      }
      const result = schema.safeParse(record)
      expect(result.success).toBe(true)
    })

    it("should coerce string values for numeric types", () => {
      const record = {
        name: "John Doe",
        age: "30",
        salary: "50000.5",
        is_active: "true",
        data: "data:application/octet-stream;base64,AAAA",
        created_at: "2023-01-01T00:00:00.000Z",
      }
      const result = schema.safeParse(record)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.age).toBe(30)
        expect(result.data.salary).toBe(50000.5)
        expect(result.data.is_active).toBe(true)
      }
    })

    it("should handle empty string for numeric types", () => {
      const record = {
        name: "John Doe",
        age: "",
        salary: "",
        is_active: true,
        data: "",
        created_at: "",
      }
      const result = schema.safeParse(record)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.age).toBe(null)
        expect(result.data.salary).toBe(null)
        expect(result.data.created_at).toBe(null)
      }
    })

    it("should handle empty string for not-null numeric types", () => {
      const columnsWithNotNull = [
        { name: "id", type: SqliteColumnType.INTEGER },
        { name: "name", type: SqliteColumnType.TEXT, notNull: true },
        { name: "age", type: SqliteColumnType.INTEGER, notNull: true },
        { name: "salary", type: SqliteColumnType.REAL, notNull: true },
        { name: "is_active", type: SqliteColumnType.BOOLEAN, notNull: true },
        { name: "data", type: SqliteColumnType.BLOB, notNull: true },
        { name: "created_at", type: SqliteColumnType.TIMESTAMP, notNull: true },
      ]
      const schemaWithNotNull =
        upsertUserDataStoreRecordSchemaFactory(columnsWithNotNull)
      const record = {
        name: "John Doe",
        age: "",
        salary: "",
        is_active: true,
        data: "",
        created_at: "",
      }
      const result = schemaWithNotNull.safeParse(record)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.age).toBe(0)
        expect(result.data.salary).toBe(0)
        expect(result.data.created_at).toBe(0)
      }
    })

    it("should handle nullable values", () => {
      const columnsWithNullable = [
        ...columns,
        { name: "description", type: SqliteColumnType.TEXT, notNull: false },
      ]
      const schemaWithNullable =
        upsertUserDataStoreRecordSchemaFactory(columnsWithNullable)
      const record = {
        name: "John Doe",
        age: 30,
        salary: 50000.5,
        is_active: true,
        data: "data:application/octet-stream;base64,AAAA",
        created_at: Date.now(),
        description: null,
      }
      const result = schemaWithNullable.safeParse(record)
      expect(result.success).toBe(true)
    })
  })
})
