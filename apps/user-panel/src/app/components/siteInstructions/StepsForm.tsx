import { FormatListBulletedRounded } from '@mui/icons-material'
import { InputAdornment, MenuItem, Stack } from '@mui/material'
import { ActionStepType, type UpsertSiteInstructionsSchema } from '@web-scraper/common'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { StepDataForm } from './StepDataForm'
import { actionStepTypeNames } from '../../utils/site-instructions-helpers'
import { ItemsList } from '../common/treeStructure/ItemsList'
import { FormInput } from '../form/FormInput'

interface StepsFormProps {
  fieldName: `actions.${number}.actionSteps`
}

export const StepsForm = ({ fieldName }: StepsFormProps) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const stepsFields = useFieldArray<UpsertSiteInstructionsSchema, typeof fieldName>({
    name: fieldName,
  })

  return (
    <ItemsList
      title="Steps"
      items={stepsFields.fields}
      level={1}
      onAdd={() =>
        stepsFields.append({
          type: ActionStepType.WAIT,
          data: {
            duration: 1000,
          },
        })
      }
      onDelete={(_, index) => stepsFields.remove(index)}
    >
      {(field, index) => (
        <Stack key={field.id} flexGrow={1} gap={2}>
          <FormInput
            name={`${fieldName}.${index}.type`}
            form={form}
            label="Type"
            select
            defaultValue={field.type}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FormatListBulletedRounded />
                </InputAdornment>
              ),
            }}
          >
            {Object.values(ActionStepType).map((stepType) => (
              <MenuItem key={stepType} value={stepType}>
                {actionStepTypeNames[stepType]}
              </MenuItem>
            ))}
          </FormInput>
          <StepDataForm
            stepFieldName={`${fieldName}.${index}`}
            fieldName={`${fieldName}.${index}.data`}
          />
        </Stack>
      )}
    </ItemsList>
  )
}
