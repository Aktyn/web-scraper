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

const conditionValueSchema = z.union([z.string(), z.number(), z.boolean(), z.instanceof(Date)])

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
  condition: z.enum([SqliteConditionType.Between, SqliteConditionType.NotBetween]),
  value: z.object({
    from: conditionValueSchema,
    to: conditionValueSchema,
  }),
})

const nullConditionSchema = z.object({
  column: z.string(),
  condition: z.enum([SqliteConditionType.IsNull, SqliteConditionType.IsNotNull]),
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
    and: z.array(z.lazy(() => whereSchema)),
    negate: z.boolean().optional(),
  }),
  z.object({
    or: z.array(z.lazy(() => whereSchema)),
    negate: z.boolean().optional(),
  }),
])
