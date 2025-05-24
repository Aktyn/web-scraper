import z from "zod"

export const userDataStoresSchema = z.array(
  z.object({
    name: z.string(),
    description: z.string().nullable(),
  }),
)

export type UserDataStore = z.infer<typeof userDataStoresSchema>
