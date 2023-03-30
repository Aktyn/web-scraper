import * as yup from 'yup'

export interface Account {
  id: number
  createdAt: Date
  loginOrEmail: string
  password: string
  additionalCredentialsData: string | null
  lastUsed: Date | null
  active: boolean | null
  siteId: number
}

export const upsertAccountSchema = yup
  .object({
    loginOrEmail: yup.string().default('').required(),
    password: yup.string().default('').required(),
    additionalCredentialsData: yup
      .string()
      .test('json', '${path} is not a valid json', (value) => {
        if (!value) {
          return true
        }
        try {
          JSON.parse(value)
          return true
        } catch {
          return false
        }
      })
      .nullable()
      .default(null)
      .notRequired(),
    siteId: yup.number().required(),
  })
  .required()

export type UpsertAccountSchema = yup.InferType<typeof upsertAccountSchema>
