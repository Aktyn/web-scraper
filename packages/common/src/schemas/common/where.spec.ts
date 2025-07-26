import { describe, expect, it } from "vitest"
import {
  SqliteConditionType,
  type WhereSchema,
  whereSchemaToSql,
} from "./where"

describe(whereSchemaToSql.name, () => {
  describe("basic conditions", () => {
    it("should handle equals condition", () => {
      const where: WhereSchema = {
        column: "name",
        condition: SqliteConditionType.Equals,
        value: "John",
      }
      expect(whereSchemaToSql(where)).toBe("\"name\" = 'John'")
    })

    it("should handle notEquals condition", () => {
      const where: WhereSchema = {
        column: "status",
        condition: SqliteConditionType.NotEquals,
        value: "inactive",
      }
      expect(whereSchemaToSql(where)).toBe("\"status\" != 'inactive'")
    })

    it("should handle greaterThan condition with number", () => {
      const where: WhereSchema = {
        column: "age",
        condition: SqliteConditionType.GreaterThan,
        value: 25,
      }
      expect(whereSchemaToSql(where)).toBe('"age" > 25')
    })

    it("should handle greaterThanOrEqual condition", () => {
      const where: WhereSchema = {
        column: "score",
        condition: SqliteConditionType.GreaterThanOrEqual,
        value: 90,
      }
      expect(whereSchemaToSql(where)).toBe('"score" >= 90')
    })

    it("should handle lessThan condition", () => {
      const where: WhereSchema = {
        column: "count",
        condition: SqliteConditionType.LessThan,
        value: 100,
      }
      expect(whereSchemaToSql(where)).toBe('"count" < 100')
    })

    it("should handle lessThanOrEqual condition", () => {
      const where: WhereSchema = {
        column: "price",
        condition: SqliteConditionType.LessThanOrEqual,
        value: 50.99,
      }
      expect(whereSchemaToSql(where)).toBe('"price" <= 50.99')
    })

    it("should handle like condition", () => {
      const where: WhereSchema = {
        column: "description",
        condition: SqliteConditionType.Like,
        value: "%test%",
      }
      expect(whereSchemaToSql(where)).toBe("\"description\" LIKE '%test%'")
    })

    it("should handle notLike condition", () => {
      const where: WhereSchema = {
        column: "title",
        condition: SqliteConditionType.NotLike,
        value: "%spam%",
      }
      expect(whereSchemaToSql(where)).toBe("\"title\" NOT LIKE '%spam%'")
    })

    it("should handle iLike condition (case insensitive)", () => {
      const where: WhereSchema = {
        column: "name",
        condition: SqliteConditionType.ILike,
        value: "%JOHN%",
      }
      expect(whereSchemaToSql(where)).toBe(
        "LOWER(\"name\") LIKE LOWER('%JOHN%')",
      )
    })

    it("should handle notILike condition", () => {
      const where: WhereSchema = {
        column: "email",
        condition: SqliteConditionType.NotILike,
        value: "%SPAM%",
      }
      expect(whereSchemaToSql(where)).toBe(
        "LOWER(\"email\") NOT LIKE LOWER('%SPAM%')",
      )
    })

    it("should handle boolean values", () => {
      const where: WhereSchema = {
        column: "active",
        condition: SqliteConditionType.Equals,
        value: true,
      }
      expect(whereSchemaToSql(where)).toBe('"active" = 1')

      const where2: WhereSchema = {
        column: "deleted",
        condition: SqliteConditionType.Equals,
        value: false,
      }
      expect(whereSchemaToSql(where2)).toBe('"deleted" = 0')
    })

    it("should handle Date values", () => {
      const date = new Date("2023-01-01T00:00:00.000Z")
      const where: WhereSchema = {
        column: "created_at",
        condition: SqliteConditionType.GreaterThan,
        value: date,
      }
      expect(whereSchemaToSql(where)).toBe(
        "\"created_at\" > '2023-01-01T00:00:00.000Z'",
      )
    })

    it("should escape single quotes in string values", () => {
      const where: WhereSchema = {
        column: "description",
        condition: SqliteConditionType.Equals,
        value: "It's a test",
      }
      expect(whereSchemaToSql(where)).toBe("\"description\" = 'It''s a test'")
    })
  })

  describe("array conditions", () => {
    it("should handle in condition", () => {
      const where: WhereSchema = {
        column: "status",
        condition: SqliteConditionType.In,
        value: ["active", "pending"],
      }
      expect(whereSchemaToSql(where)).toBe(
        "\"status\" IN ('active', 'pending')",
      )
    })

    it("should handle notIn condition", () => {
      const where: WhereSchema = {
        column: "id",
        condition: SqliteConditionType.NotIn,
        value: [1, 2, 3],
      }
      expect(whereSchemaToSql(where)).toBe('"id" NOT IN (1, 2, 3)')
    })

    it("should handle mixed types in array", () => {
      const where: WhereSchema = {
        column: "value",
        condition: SqliteConditionType.In,
        value: [1, "test", true],
      }
      expect(whereSchemaToSql(where)).toBe("\"value\" IN (1, 'test', 1)")
    })

    it("should throw error for in condition without array", () => {
      const where = {
        column: "status",
        condition: SqliteConditionType.In,
        value: "not-array",
      } as unknown as WhereSchema
      expect(() => whereSchemaToSql(where)).toThrow(
        "IN condition requires array value",
      )
    })

    it("should throw error for notIn condition without array", () => {
      const where = {
        column: "status",
        condition: SqliteConditionType.NotIn,
        value: "not-array",
      } as unknown as WhereSchema
      expect(() => whereSchemaToSql(where)).toThrow(
        "NOT IN condition requires array value",
      )
    })
  })

  describe("null conditions", () => {
    it("should handle isNull condition", () => {
      const where: WhereSchema = {
        column: "deleted_at",
        condition: SqliteConditionType.IsNull,
      }
      expect(whereSchemaToSql(where)).toBe('"deleted_at" IS NULL')
    })

    it("should handle isNotNull condition", () => {
      const where: WhereSchema = {
        column: "email",
        condition: SqliteConditionType.IsNotNull,
      }
      expect(whereSchemaToSql(where)).toBe('"email" IS NOT NULL')
    })
  })

  describe("range conditions", () => {
    it("should handle between condition", () => {
      const where: WhereSchema = {
        column: "age",
        condition: SqliteConditionType.Between,
        value: { from: 18, to: 65 },
      }
      expect(whereSchemaToSql(where)).toBe('"age" BETWEEN 18 AND 65')
    })

    it("should handle notBetween condition", () => {
      const where: WhereSchema = {
        column: "score",
        condition: SqliteConditionType.NotBetween,
        value: { from: 0, to: 50 },
      }
      expect(whereSchemaToSql(where)).toBe('"score" NOT BETWEEN 0 AND 50')
    })

    it("should handle between with dates", () => {
      const from = new Date("2023-01-01T00:00:00.000Z")
      const to = new Date("2023-12-31T23:59:59.999Z")
      const where: WhereSchema = {
        column: "created_at",
        condition: SqliteConditionType.Between,
        value: { from, to },
      }
      expect(whereSchemaToSql(where)).toBe(
        "\"created_at\" BETWEEN '2023-01-01T00:00:00.000Z' AND '2023-12-31T23:59:59.999Z'",
      )
    })

    it("should throw error for between without proper range object", () => {
      const where = {
        column: "age",
        condition: SqliteConditionType.Between,
        value: "not-range",
      } as unknown as WhereSchema
      expect(() => whereSchemaToSql(where)).toThrow(
        "BETWEEN condition requires range value with from and to properties",
      )
    })

    it("should throw error for notBetween without proper range object", () => {
      const where = {
        column: "age",
        condition: SqliteConditionType.NotBetween,
        value: "not-range",
      } as unknown as WhereSchema
      expect(() => whereSchemaToSql(where)).toThrow(
        "NOT BETWEEN condition requires range value with from and to properties",
      )
    })
  })

  describe("logical conditions", () => {
    it("should handle AND condition with multiple clauses", () => {
      const where: WhereSchema = {
        and: [
          {
            column: "age",
            condition: SqliteConditionType.GreaterThan,
            value: 25,
          },
          {
            column: "status",
            condition: SqliteConditionType.Equals,
            value: "active",
          },
        ],
      }
      expect(whereSchemaToSql(where)).toBe(
        '("age" > 25 AND "status" = \'active\')',
      )
    })

    it("should handle OR condition with multiple clauses", () => {
      const where: WhereSchema = {
        or: [
          {
            column: "role",
            condition: SqliteConditionType.Equals,
            value: "admin",
          },
          {
            column: "role",
            condition: SqliteConditionType.Equals,
            value: "editor",
          },
        ],
      }
      expect(whereSchemaToSql(where)).toBe(
        "(\"role\" = 'admin' OR \"role\" = 'editor')",
      )
    })

    it("should handle negated AND condition", () => {
      const where: WhereSchema = {
        and: [
          {
            column: "age",
            condition: SqliteConditionType.GreaterThan,
            value: 25,
          },
        ],
        negate: true,
      }
      expect(whereSchemaToSql(where)).toBe('NOT "age" > 25')
    })

    it("should handle negated OR condition", () => {
      const where: WhereSchema = {
        or: [
          {
            column: "role",
            condition: SqliteConditionType.Equals,
            value: "admin",
          },
        ],
        negate: true,
      }
      expect(whereSchemaToSql(where)).toBe("NOT \"role\" = 'admin'")
    })

    it("should handle nested logical conditions", () => {
      const where: WhereSchema = {
        and: [
          {
            column: "active",
            condition: SqliteConditionType.Equals,
            value: true,
          },
          {
            or: [
              {
                and: [
                  {
                    column: "type",
                    condition: SqliteConditionType.Equals,
                    value: "premium",
                  },
                  {
                    column: "balance",
                    condition: SqliteConditionType.GreaterThan,
                    value: 1000,
                  },
                ],
              },
              {
                and: [
                  {
                    column: "type",
                    condition: SqliteConditionType.Equals,
                    value: "basic",
                  },
                  {
                    column: "verified",
                    condition: SqliteConditionType.Equals,
                    value: true,
                  },
                ],
              },
            ],
          },
        ],
      }
      expect(whereSchemaToSql(where)).toBe(
        '("active" = 1 AND (("type" = \'premium\' AND "balance" > 1000) OR ("type" = \'basic\' AND "verified" = 1)))',
      )
    })

    it("should handle empty AND condition", () => {
      const where: WhereSchema = {
        and: [],
      }
      expect(whereSchemaToSql(where)).toBe("1=1")
    })

    it("should handle empty OR condition", () => {
      const where: WhereSchema = {
        or: [],
      }
      expect(whereSchemaToSql(where)).toBe("1=0")
    })

    it("should handle single AND clause without parens", () => {
      const where: WhereSchema = {
        and: [
          {
            column: "age",
            condition: SqliteConditionType.GreaterThan,
            value: 30,
          },
        ],
      }
      expect(whereSchemaToSql(where)).toBe('"age" > 30')
    })

    it("should handle single OR clause without parens", () => {
      const where: WhereSchema = {
        or: [
          {
            column: "status",
            condition: SqliteConditionType.Equals,
            value: "inactive",
          },
        ],
      }
      expect(whereSchemaToSql(where)).toBe("\"status\" = 'inactive'")
    })

    it("should throw error for invalid where schema", () => {
      const where = {} as unknown as WhereSchema
      expect(() => whereSchemaToSql(where)).toThrow("Invalid where schema")
    })

    it("should throw error for unsupported condition", () => {
      const where = {
        column: "name",
        condition: "invalid",
        value: "test",
      } as unknown as WhereSchema
      expect(() => whereSchemaToSql(where)).toThrow(
        "Unsupported condition: invalid",
      )
    })
  })
})
