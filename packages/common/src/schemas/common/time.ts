import { z } from "zod"

export const durationSchema = z
  .number()
  .int()
  .nonnegative()
  .describe("Duration in milliseconds")

export const timestampSchema = z
  .number()
  .int()
  .nonnegative()
  .describe("Timestamp in milliseconds since epoch")
