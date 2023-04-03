import { Stack, Typography } from '@mui/material'
import type { UpsertSiteInstructionsSchema } from '@web-scraper/common'
import type { UseFormReturn } from 'react-hook-form'
import { useFieldArray } from 'react-hook-form'

interface ActionsFormProps {
  form: UseFormReturn<UpsertSiteInstructionsSchema>
}

export const ActionsForm = ({ form }: ActionsFormProps) => {
  const actionsFields = useFieldArray({
    control: form.control,
    name: 'actions',
    keyName: 'fieldKey',
  })

  return (
    <Stack rowGap={2}>
      <Typography variant="body1" color="text.secondary" fontWeight="bold" textAlign="center">
        Actions
      </Typography>
      {actionsFields.fields.map((field) => (
        <Stack key={field.fieldKey}>{field.name}</Stack>
      ))}
    </Stack>
  )
}
