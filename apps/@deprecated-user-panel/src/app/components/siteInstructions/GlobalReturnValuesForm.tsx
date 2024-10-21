import type { UpsertSiteInstructionsSchema } from '@web-scraper/common'
import { useFormContext } from 'react-hook-form'
import { ElementFormInput } from './ElementFormInput'
import { ItemsList } from '../common/treeStructure/ItemsList'

type GlobalReturnValuesFormProps = {
  level: number
  fieldName: `procedures.${number}.flow.globalReturnValues`
}

export const GlobalReturnValuesForm = ({ level, fieldName }: GlobalReturnValuesFormProps) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const globalReturnValues = form.watch(fieldName)

  return (
    <ItemsList
      title="Global return values"
      items={globalReturnValues}
      level={level}
      onAdd={() => form.setValue(fieldName, globalReturnValues.concat(''))}
      onDelete={(_, index) =>
        form.setValue(
          fieldName,
          globalReturnValues.filter((_, i) => i !== index),
        )
      }
    >
      {(_, index) => [
        index,
        <ElementFormInput
          key={index}
          name={`${fieldName}.${index}`}
          label="Value"
          debounceChange
        />,
      ]}
    </ItemsList>
  )
}
