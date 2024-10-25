import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Switch } from '~/components/ui/switch'

type FormSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, 'render'> & {
  label: string
}

export function FormSwitch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ label, ...formFieldProps }: FormSwitchProps<TFieldValues, TName>) {
  return (
    <FormField
      {...formFieldProps}
      render={({ field }) => (
        <FormItem className="flex flex-col justify-start">
          <FormLabel>{label}</FormLabel>
          <div className="min-h-10 flex items-center">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </div>
          <FormMessage reserveSpace />
        </FormItem>
      )}
    />
  )
}
