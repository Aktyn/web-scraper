import { TextField, type TextFieldProps } from '@mui/material'
import { getDeepProperty } from '@web-scraper/common'
import type { FieldPath, GlobalError, UseFormRegisterReturn, UseFormReturn } from 'react-hook-form'

interface FormInputProps<FormSchema extends object>
  extends Omit<TextFieldProps, keyof UseFormRegisterReturn> {
  name: FieldPath<FormSchema>
  form: UseFormReturn<FormSchema>
  required?: boolean
}

export const FormInput = <FormSchema extends object>({
  name,
  form,
  required,
  error: externalError,
  ...textFieldProps
}: FormInputProps<FormSchema>) => {
  const error = getDeepProperty(form.formState.errors, name as never) as GlobalError | undefined

  return (
    <TextField
      {...textFieldProps}
      {...form.register(name)}
      required={required}
      error={externalError || !!error}
      helperText={error?.message}
      variant="standard"
      name={name}
    />
  )
}
