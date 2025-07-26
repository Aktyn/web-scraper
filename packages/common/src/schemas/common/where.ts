import z from "zod"

export enum SqliteConditionType {
  Equals = "equals",
  NotEquals = "notEquals",
  GreaterThan = "greaterThan",
  GreaterThanOrEqual = "greaterThanOrEqual",
  LessThan = "lessThan",
  LessThanOrEqual = "lessThanOrEqual",
  Like = "like",
  NotLike = "notLike",
  ILike = "iLike",
  NotILike = "notILike",
  In = "in",
  NotIn = "notIn",
  IsNull = "isNull",
  IsNotNull = "isNotNull",
  Between = "between",
  NotBetween = "notBetween",
}

const conditionValueSchema = z.union([
  z.string(),
  z.coerce.number(),
  z.coerce.boolean(),
  z.instanceof(Date),
])

const basicConditionSchema = z.object({
  column: z.string(),
  condition: z.enum([
    SqliteConditionType.Equals,
    SqliteConditionType.NotEquals,
    SqliteConditionType.GreaterThan,
    SqliteConditionType.GreaterThanOrEqual,
    SqliteConditionType.LessThan,
    SqliteConditionType.LessThanOrEqual,
    SqliteConditionType.Like,
    SqliteConditionType.NotLike,
    SqliteConditionType.ILike,
    SqliteConditionType.NotILike,
  ]),
  value: conditionValueSchema,
})

const arrayConditionSchema = z.object({
  column: z.string(),
  condition: z.enum([SqliteConditionType.In, SqliteConditionType.NotIn]),
  value: z.array(conditionValueSchema),
})

const rangeConditionSchema = z.object({
  column: z.string(),
  condition: z.enum([
    SqliteConditionType.Between,
    SqliteConditionType.NotBetween,
  ]),
  value: z.object({
    from: conditionValueSchema,
    to: conditionValueSchema,
  }),
})

const nullConditionSchema = z.object({
  column: z.string(),
  condition: z.enum([
    SqliteConditionType.IsNull,
    SqliteConditionType.IsNotNull,
  ]),
})

const conditionSchema = z.discriminatedUnion("condition", [
  basicConditionSchema,
  arrayConditionSchema,
  rangeConditionSchema,
  nullConditionSchema,
])

type Condition = z.infer<typeof conditionSchema>

type AndConditions = {
  and: WhereSchema[]
  negate?: boolean
}

type OrConditions = {
  or: WhereSchema[]
  negate?: boolean
}

export type WhereSchema = Condition | AndConditions | OrConditions

export const whereSchema: z.ZodType<WhereSchema> = z.union([
  conditionSchema,
  z.object({
    and: z.array(z.lazy(() => whereSchema)).nonempty(),
    negate: z.boolean().optional(),
  }),
  z.object({
    or: z.array(z.lazy(() => whereSchema)).nonempty(),
    negate: z.boolean().optional(),
  }),
])

export function whereSchemaToSql(where: WhereSchema): string {
  if ("condition" in where) {
    const column = sanitizeColumnName(where.column)

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
        throw new Error(
          "BETWEEN condition requires range value with from and to properties",
        )
      case SqliteConditionType.NotBetween:
        if (
          typeof where.value === "object" &&
          where.value !== null &&
          "from" in where.value &&
          "to" in where.value
        ) {
          return `${column} NOT BETWEEN ${formatValue(where.value.from)} AND ${formatValue(where.value.to)}`
        }
        throw new Error(
          "NOT BETWEEN condition requires range value with from and to properties",
        )
      default:
        throw new Error(
          `Unsupported condition: ${(where as { condition: string }).condition}`,
        )
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

export function sanitizeColumnName(name: string) {
  if (name.startsWith('"')) {
    name = name.slice(1)
  }
  if (name.endsWith('"')) {
    name = name.slice(0, -1)
  }
  name = name.replace(/"/g, '\\"')
  return `"${name}"`
}
