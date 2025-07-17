import fastifyPlugin from "fastify-plugin"
import { z, ZodBoolean, ZodNumber } from "zod"

type AnyZodSchema = z.core.$ZodType<
  unknown,
  unknown,
  z.core.$ZodTypeInternals<unknown, unknown>
>

function isZodObject(schema: unknown): schema is z.ZodObject<z.ZodRawShape> {
  return schema instanceof z.ZodObject
}

function unwrapZodType(schema: AnyZodSchema): AnyZodSchema {
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault) {
    return unwrapZodType(schema.unwrap())
  }
  return schema
}

function isZodBoolean(schema: AnyZodSchema): schema is z.ZodBoolean {
  const unwrapped = unwrapZodType(schema)
  return unwrapped instanceof ZodBoolean
}

function isZodNumber(schema: AnyZodSchema): schema is z.ZodNumber {
  const unwrapped = unwrapZodType(schema)
  return unwrapped instanceof ZodNumber
}

export const zodQueryTransformPlugin = fastifyPlugin(
  (fastify, _opts, done) => {
    fastify.addHook("preValidation", (request, _reply, done) => {
      const schema = request.routeOptions.schema?.querystring

      if (isZodObject(schema) && request.query) {
        const query = request.query as Record<string, unknown>
        const shape = schema.shape

        for (const key in query) {
          if (key in shape) {
            const fieldSchema = shape[key]
            const value = query[key]

            if (typeof value !== "string" || !fieldSchema) {
              continue
            }

            if (isZodBoolean(fieldSchema)) {
              if (value.toLowerCase() === "true") {
                query[key] = true
              } else if (value.toLowerCase() === "false") {
                query[key] = false
              }
            } else if (isZodNumber(fieldSchema)) {
              if (value.trim() === "") continue
              const num = Number(value)
              if (!isNaN(num)) {
                query[key] = num
              }
            }
          }
        }
      }

      done()
    })

    done()
  },
  { name: "zod-query-transform" },
)
