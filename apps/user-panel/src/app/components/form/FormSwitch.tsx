import type { ReactNode } from 'react'
import { FormControl, FormControlLabel, Switch } from '@mui/material'
import { Controller, type Path, useFormContext } from 'react-hook-form'

interface FormSwitchProps<FormSchema extends Record<string, unknown>> {
  fieldName: Path<FormSchema>
  label: ReactNode
}

export const FormSwitch = <FormSchema extends Record<string, unknown>>({
  fieldName,
  label,
}: FormSwitchProps<FormSchema>) => {
  const form = useFormContext<FormSchema>()

  return (
    <FormControl>
      <Controller
        name={fieldName}
        control={form.control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch checked={!!field.value} onChange={(_, checked) => field.onChange(checked)} />
            }
            label={label}
          />
        )}
      />
    </FormControl>
  )
}
