import { z } from "zod"

export function schemaToJson(
  schema: z.ZodSchema,
): z.core.JSONSchema.JSONSchema {
  const json = z.toJSONSchema(schema)
  delete json["$schema"]

  const traverse = (obj: unknown) => {
    if (obj && typeof obj === "object") {
      if ("additionalProperties" in obj) {
        delete (obj as { additionalProperties?: unknown }).additionalProperties
      }
      Object.values(obj).forEach(traverse)
    }
  }
  traverse(json)

  return json
}
