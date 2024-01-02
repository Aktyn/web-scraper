import type { ChangeEvent } from 'react'
import { TextField, type TextFieldProps } from '@mui/material'
import { getDeepProperty } from '@web-scraper/common'
import type {
  FieldPath,
  GlobalError,
  Path,
  UseFormRegisterReturn,
  UseFormReturn,
} from 'react-hook-form'
import { Config } from '../../config'
import { useDebounce } from '../../hooks/useDebounce'

interface FormInputProps<FormSchema extends object>
  extends Omit<TextFieldProps, keyof UseFormRegisterReturn> {
  name: FieldPath<FormSchema>
  form: UseFormReturn<FormSchema>
  required?: boolean
  disabled?: boolean
  debounceChange?: boolean | number
}

export const FormInput = <FormSchema extends object>({
  name,
  form,
  required,
  disabled,
  debounceChange,
  error: externalError,
  ...textFieldProps
}: FormInputProps<FormSchema>) => {
  const error = getDeepProperty(form.formState.errors, name as never) as GlobalError | undefined

  const props = form.register(name, { valueAsNumber: textFieldProps.type === 'number' })

  const debounceDelay =
    debounceChange === true ? Config.FORM_INPUT_DEBOUNCE_TIME : debounceChange || 0

  const debounceOnChange = useDebounce(
    (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      registeredProps: UseFormRegisterReturn<Path<FormSchema>>,
    ) => registeredProps.onChange(event),
    debounceDelay,
    [],
  )

  return (
    <TextField
      disabled={disabled}
      {...textFieldProps}
      {...props}
      onChange={(event) => debounceOnChange(event, props)}
      required={required}
      error={externalError || !!error}
      helperText={error?.message}
      variant="standard"
      name={name}
    />
  )
}
