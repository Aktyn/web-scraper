import * as yup from 'yup'

export const siteFormSchema = yup
  .object({
    url: yup.string().url().default('').required(),
    language: yup.string().nullable().default(null).notRequired(),
  })
  .required()
