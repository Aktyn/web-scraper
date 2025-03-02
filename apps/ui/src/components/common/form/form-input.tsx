import type { ComponentProps } from 'react'
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'

type FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, 'render'> & {
  label: string
  placeholder?: string
  inputProps?: ComponentProps<'input'>
}

export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ label, placeholder, inputProps, ...formFieldProps }: FormInputProps<TFieldValues, TName>) {
  return (
    <FormField
      {...formFieldProps}
      render={({ field }) => (
        <FormItem className="flex flex-col justify-start">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} value={field.value ?? ''} {...inputProps} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
