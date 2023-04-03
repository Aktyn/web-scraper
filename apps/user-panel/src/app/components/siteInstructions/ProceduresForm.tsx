import { Stack, Typography } from '@mui/material'
import type { UpsertSiteInstructionsSchema } from '@web-scraper/common'
import type { UseFormReturn } from 'react-hook-form'
import { useFieldArray } from 'react-hook-form'

interface ProceduresFormProps {
  form: UseFormReturn<UpsertSiteInstructionsSchema>
}

export const ProceduresForm = ({ form }: ProceduresFormProps) => {
  const proceduresFields = useFieldArray({
    control: form.control,
    name: 'procedures',
    keyName: 'fieldKey',
  })

  return (
    <Stack rowGap={2}>
      <Typography variant="body1" color="text.secondary" fontWeight="bold" textAlign="center">
        Procedures
      </Typography>
      {proceduresFields.fields.map((field) => (
        <Stack key={field.fieldKey}>{field.startUrl}</Stack>
      ))}
    </Stack>
  )
}
