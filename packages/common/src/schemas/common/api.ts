import { z } from "zod"

export type ApiResponse<T extends object | null> = {
  data: T
}

export function getApiResponseSchema<T extends z.ZodType>(zodSchema: T) {
  return z.object({
    data: zodSchema,
  })
}

const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  hasMore: z.boolean(),
})

export type ApiPaginatedResponse<T extends object> = {
  data: Array<T>
} & z.infer<typeof paginationSchema>

export function getApiPaginatedResponseSchema<T extends z.ZodType<object>>(
  zodSchema: T,
) {
  return paginationSchema.extend({
    data: z.array(zodSchema),
  })
}

export const apiPaginationQuerySchema = z.object({
  page: z.coerce.number().min(0).default(0),
  pageSize: z.coerce.number().min(1).max(128).optional().default(64),
})

export type ApiPaginationQuery = z.infer<typeof apiPaginationQuerySchema>

export const apiErrorResponseSchema = z.object({
  statusCode: z.number().optional(),
  code: z.string().optional(),
  error: z.string(),
  message: z.string().optional(),
})

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>
