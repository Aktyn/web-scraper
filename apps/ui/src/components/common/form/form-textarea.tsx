import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Textarea } from '~/components/ui/textarea'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '~/lib/utils'

type FormTextAreaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, 'render'> & {
  label: string
  placeholder?: string
  textareaProps?: ComponentPropsWithoutRef<typeof Textarea>
  className?: string
}

export function FormTextArea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  placeholder,
  textareaProps,
  className,
  ...formFieldProps
}: FormTextAreaProps<TFieldValues, TName>) {
  return (
    <FormField
      {...formFieldProps}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col justify-start', className)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              {...field}
              value={field.value ?? ''}
              {...textareaProps}
            />
          </FormControl>
          <FormMessage reserveSpace />
        </FormItem>
      )}
    />
  )
}
