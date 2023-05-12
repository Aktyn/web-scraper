import { CodeRounded, FormatListBulletedRounded, LinkRounded } from '@mui/icons-material'
import { InputAdornment, MenuItem, Stack } from '@mui/material'
import { ProcedureType, type UpsertSiteInstructionsSchema } from '@web-scraper/common'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { procedureTypeNames } from 'src/app/utils/site-instructions-helpers'
import { FlowStepForm } from './FlowStepForm'
import { TermInfo } from '../common/TermInfo'
import { ItemTitle } from '../common/treeStructure/ItemTitle'
import { ItemsList } from '../common/treeStructure/ItemsList'
import { FormInput } from '../form/FormInput'

export const ProceduresForm = () => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const proceduresFields = useFieldArray<UpsertSiteInstructionsSchema, 'procedures'>({
    name: 'procedures',
  })

  return (
    <ItemsList
      title={
        <Stack direction="row" alignItems="center" spacing={1} mr={2} color="text.secondary">
          <ItemTitle>Procedures</ItemTitle>
          <TermInfo term="Procedure" sx={{ pointerEvents: 'all' }} />
        </Stack>
      }
      items={proceduresFields.fields}
      onAdd={() =>
        proceduresFields.append({
          type: ProcedureType.LOGIN,
          startUrl: '',
          waitFor: null,
          flow: null,
        })
      }
      onDelete={(_, index) => proceduresFields.remove(index)}
    >
      {(field, index) => [
        field.id,
        <Stack key={field.id} flexGrow={1} gap={2}>
          <FormInput
            name={`procedures.${index}.type`}
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
            {Object.values(ProcedureType).map((procedureType) => (
              <MenuItem key={procedureType} value={procedureType}>
                {procedureTypeNames[procedureType]}
              </MenuItem>
            ))}
          </FormInput>
          <FormInput
            name={`procedures.${index}.startUrl`}
            form={form}
            label="Start URL"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkRounded />
                </InputAdornment>
              ),
            }}
          />
          <FormInput
            name={`procedures.${index}.waitFor`}
            form={form}
            label="Wait for"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CodeRounded />
                </InputAdornment>
              ),
            }}
          />
          <FlowStepForm fieldName={`procedures.${index}.flow`} />
        </Stack>,
      ]}
    </ItemsList>
  )
}
