import { Stack, Typography } from '@mui/material'
import type { UpsertSiteInstructionsSchema } from '@web-scraper/common'
import { useFieldArray } from 'react-hook-form'

export const ProceduresForm = () => {
  const proceduresFields = useFieldArray<UpsertSiteInstructionsSchema, 'procedures'>({
    name: 'procedures',
  })

  return (
    <Stack rowGap={2}>
      <Typography variant="body1" color="text.secondary" fontWeight="bold" textAlign="center">
        Procedures
      </Typography>
      {proceduresFields.fields.map((field) => (
        <Stack key={field.id}>{field.startUrl}</Stack>
      ))}
    </Stack>
  )
}
