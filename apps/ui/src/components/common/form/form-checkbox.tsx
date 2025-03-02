import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Checkbox } from '~/components/ui/checkbox'

type FormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, 'render'> & {
  label: string
}

export function FormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ label, ...formFieldProps }: FormCheckboxProps<TFieldValues, TName>) {
  return (
    <FormField
      {...formFieldProps}
      render={({ field }) => (
        <FormItem className="flex flex-col justify-start">
          <div className="w-full">&nbsp;</div>
          <div className="flex flex-row items-center gap-x-2">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel>{label}</FormLabel>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
