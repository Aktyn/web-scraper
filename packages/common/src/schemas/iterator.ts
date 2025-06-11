import z from "zod"
import { dataSourceNameSchema } from "./scraper"
import { whereSchema } from "./common"

export const executionRangeSchema = z
  .object({
    start: z.number().min(1),
    end: z.number().min(1),
    step: z.number().min(1).optional(),
  })
  .refine((data) => data.start <= data.end, {
    message: "Start must be less than or equal to end",
    path: ["start"],
  })

export type ExecutionRange = z.infer<typeof executionRangeSchema>

export enum ExecutionIteratorType {
  Range = "range",
  EntireSet = "entire-set",
  FilteredSet = "filtered-set",
  // WhileLoop = "while-loop", //TODO: support this (should iterate as long as given condition is met)
}

export const executionIteratorSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(ExecutionIteratorType.Range),
    dataSourceName: dataSourceNameSchema,
    identifier: z
      .string()
      .describe(
        "It is used to determine the target on which the range will be based. For a database table, for example, this would be the name of the primary key column.",
      ),
    range: z.union([executionRangeSchema, z.number()]),
  }),

  z.object({
    type: z.literal(ExecutionIteratorType.EntireSet),
    dataSourceName: dataSourceNameSchema,
  }),

  z.object({
    type: z.literal(ExecutionIteratorType.FilteredSet),
    dataSourceName: dataSourceNameSchema,
    where: whereSchema,
  }),
])

export type ExecutionIterator = z.infer<typeof executionIteratorSchema>
