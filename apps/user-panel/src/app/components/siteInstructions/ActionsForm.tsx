import { LabelRounded, LinkRounded } from '@mui/icons-material'
import { InputAdornment, Stack } from '@mui/material'
import type { UpsertSiteInstructionsSchema } from '@web-scraper/common'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { StepsForm } from './StepsForm'
import { ItemsList } from '../common/treeStructure/ItemsList'
import { FormInput } from '../form/FormInput'

export const ActionsForm = () => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const actionsFields = useFieldArray<UpsertSiteInstructionsSchema, 'actions'>({
    name: 'actions',
  })

  return (
    <ItemsList
      title="Actions"
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
      {(field, index) => (
        <Stack key={field.id} flexGrow={1} gap={2}>
          <FormInput
            name={`actions.${index}.name`}
            form={form}
            label="Name"
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
        </Stack>
      )}
    </ItemsList>
  )
}
