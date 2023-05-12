import { LabelRounded, LinkRounded } from '@mui/icons-material'
import { FormControl, FormHelperText, InputAdornment, Stack } from '@mui/material'
import type { UpsertSiteInstructionsSchema } from '@web-scraper/common'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { StepsForm } from './StepsForm'
import { TermInfo } from '../common/TermInfo'
import { ItemTitle } from '../common/treeStructure/ItemTitle'
import { ItemsList } from '../common/treeStructure/ItemsList'
import { FormInput } from '../form/FormInput'

export const ActionsForm = () => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const actionsFields = useFieldArray<UpsertSiteInstructionsSchema, 'actions'>({
    name: 'actions',
  })

  const error = form.getFieldState('actions').error

  return (
    <FormControl error={!!error}>
      <ItemsList
        title={
          <Stack direction="row" alignItems="center" spacing={1} mr={2} color="text.secondary">
            <ItemTitle>Actions</ItemTitle>
            <TermInfo term="Action" sx={{ pointerEvents: 'all' }} />
          </Stack>
        }
        items={actionsFields.fields}
        onAdd={() =>
          actionsFields.append({
            name: '',
            url: null,
            actionSteps: [],
          })
        }
        onDelete={(_, index) => actionsFields.remove(index)}
      >
        {(field, index) => [
          field.id,
          <Stack key={field.id} flexGrow={1} gap={2}>
            <FormInput
              name={`actions.${index}.name`}
              form={form}
              label="Name"
              error={!!error}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LabelRounded />
                  </InputAdornment>
                ),
              }}
            />
            <FormInput
              name={`actions.${index}.url`}
              form={form}
              label="URL"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkRounded />
                  </InputAdornment>
                ),
              }}
            />
            <StepsForm fieldName={`actions.${index}.actionSteps`} />
          </Stack>,
        ]}
      </ItemsList>
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  )
}
