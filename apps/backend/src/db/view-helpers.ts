import { SqliteConditionType, uuid, type WhereSchema } from "@web-scraper/common"
import { sql } from "drizzle-orm"
import type { DbModule } from "./db.module"
import { sanitizeTableName } from "./schema/helpers"

export async function createTemporaryView(db: DbModule, sourceTableName: string, whereSQL: string) {
  const viewName = sanitizeTableName(`temporary_view_${uuid()}`)

  await db
    .run(
      sql.raw(
        `CREATE TEMPORARY VIEW IF NOT EXISTS ${viewName} AS SELECT * FROM ${sourceTableName} WHERE ${whereSQL}`,
      ),
    )
    .execute()
  return viewName
}

export function removeTemporaryView(db: DbModule, name: string) {
  return db.run(sql`DROP VIEW IF EXISTS ${sql.identifier(name)}`).execute()
}

export function whereSchemaToSql(where: WhereSchema): string {
  if ("condition" in where) {
    const column = where.column

    switch (where.condition) {
      case SqliteConditionType.Equals:
        return `${column} = ${formatValue(where.value)}`
      case SqliteConditionType.NotEquals:
        return `${column} != ${formatValue(where.value)}`
      case SqliteConditionType.GreaterThan:
        return `${column} > ${formatValue(where.value)}`
      case SqliteConditionType.GreaterThanOrEqual:
        return `${column} >= ${formatValue(where.value)}`
      case SqliteConditionType.LessThan:
        return `${column} < ${formatValue(where.value)}`
      case SqliteConditionType.LessThanOrEqual:
        return `${column} <= ${formatValue(where.value)}`
      case SqliteConditionType.Like:
        return `${column} LIKE ${formatValue(where.value)}`
      case SqliteConditionType.NotLike:
        return `${column} NOT LIKE ${formatValue(where.value)}`
      case SqliteConditionType.ILike:
        return `LOWER(${column}) LIKE LOWER(${formatValue(where.value)})`
      case SqliteConditionType.NotILike:
        return `LOWER(${column}) NOT LIKE LOWER(${formatValue(where.value)})`
      case SqliteConditionType.In:
        if (Array.isArray(where.value)) {
          const values = where.value.map(formatValue).join(", ")
          return `${column} IN (${values})`
        }
        throw new Error("IN condition requires array value")
      case SqliteConditionType.NotIn:
        if (Array.isArray(where.value)) {
          const values = where.value.map(formatValue).join(", ")
          return `${column} NOT IN (${values})`
        }
        throw new Error("NOT IN condition requires array value")
      case SqliteConditionType.IsNull:
        return `${column} IS NULL`
      case SqliteConditionType.IsNotNull:
        return `${column} IS NOT NULL`
      case SqliteConditionType.Between:
        if (
          typeof where.value === "object" &&
          where.value !== null &&
          "from" in where.value &&
          "to" in where.value
        ) {
          return `${column} BETWEEN ${formatValue(where.value.from)} AND ${formatValue(where.value.to)}`
        }
        throw new Error("BETWEEN condition requires range value with from and to properties")
      case SqliteConditionType.NotBetween:
        if (
          typeof where.value === "object" &&
          where.value !== null &&
          "from" in where.value &&
          "to" in where.value
        ) {
          return `${column} NOT BETWEEN ${formatValue(where.value.from)} AND ${formatValue(where.value.to)}`
        }
        throw new Error("NOT BETWEEN condition requires range value with from and to properties")
      default:
        throw new Error(`Unsupported condition: ${(where as { condition: string }).condition}`)
    }
  }

  if ("and" in where) {
    if (where.and.length === 0) {
      return "1=1"
    }
    const conditions = where.and.map(whereSchemaToSql).join(" AND ")
    const result = where.and.length === 1 ? conditions : `(${conditions})`
    return where.negate ? `NOT ${result}` : result
  }

  if ("or" in where) {
    if (where.or.length === 0) {
      return "1=0"
    }
    const conditions = where.or.map(whereSchemaToSql).join(" OR ")
    const result = where.or.length === 1 ? conditions : `(${conditions})`
    return where.negate ? `NOT ${result}` : result
  }

  throw new Error("Invalid where schema")
}

function formatValue(value: string | number | boolean | Date): string {
  if (typeof value === "string") {
    return `'${value.replace(/'/g, "''")}'`
  }
  if (typeof value === "number") {
    return value.toString()
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0"
  }
  if (value instanceof Date) {
    return `'${value.toISOString()}'`
  }
  throw new Error(`Unsupported value type: ${typeof value}`)
}
