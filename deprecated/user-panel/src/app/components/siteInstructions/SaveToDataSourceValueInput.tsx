import { LabelRounded } from '@mui/icons-material'
import { InputAdornment } from '@mui/material'
import { SaveDataType, type UpsertSiteInstructionsSchema } from '@web-scraper/common'
import { useFormContext } from 'react-hook-form'
import { ElementFormInput } from './ElementFormInput'
import { FormInput } from '../form/FormInput'

interface SaveToDataSourceValueInputProps {
  fieldName: `actions.${number}.actionSteps.${number}.data`
}

export const SaveToDataSourceValueInput = ({ fieldName }: SaveToDataSourceValueInputProps) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()

  const saveDataType = (form.watch(`${fieldName}.saveDataType`) ?? '') as SaveDataType | ''

  if (saveDataType !== SaveDataType.ELEMENT_CONTENT && saveDataType !== SaveDataType.CUSTOM) {
    return null
  }

  if (saveDataType === SaveDataType.ELEMENT_CONTENT) {
    return <ElementFormInput name={`${fieldName}.saveToDataSourceValue`} label="Element path" />
  }

  return (
    <FormInput
      form={form}
      name={`${fieldName}.saveToDataSourceValue`}
      variant="standard"
      label="Custom value"
      defaultValue=""
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <LabelRounded />
          </InputAdornment>
        ),
      }}
    />
  )
}
