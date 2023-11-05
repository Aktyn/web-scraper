import { CodeRounded, FormatListBulletedRounded, TimerRounded } from '@mui/icons-material'
import {
  FormControl,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import {
  ActionStepErrorType,
  ActionStepType,
  type UpsertSiteInstructionsSchema,
} from '@web-scraper/common'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { ValueQueryInput } from './ValueQueryInput'
import { actionStepErrorTypeNames } from '../../utils/dictionaries'
import { ItemsList } from '../common/treeStructure/ItemsList'
import { FormInput } from '../form/FormInput'

interface DataFieldFormProps {
  fieldName: `actions.${number}.actionSteps.${number}.data`
}

interface StepDataFormProps extends DataFieldFormProps {
  stepFieldName: `actions.${number}.actionSteps.${number}`
}

export const StepDataForm = ({ stepFieldName, ...fieldFormProps }: StepDataFormProps) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const stepType = form.watch(`${stepFieldName}.type`)

  switch (stepType) {
    default:
      return null
    case ActionStepType.WAIT:
      return <DurationFormInput {...fieldFormProps} type="duration" />
    case ActionStepType.WAIT_FOR_ELEMENT:
      return (
        <>
          <ElementFormInput {...fieldFormProps} />
          <DurationFormInput {...fieldFormProps} type="timeout" />
        </>
      )
    // case ActionStepType.UPLOAD_FILE:
    case ActionStepType.FILL_INPUT:
    case ActionStepType.SELECT_OPTION:
      return (
        <>
          <ElementFormInput {...fieldFormProps} />
          <ValueQueryInput {...fieldFormProps} />
          <DurationFormInput {...fieldFormProps} type="waitForElementTimeout" />
        </>
      )
    case ActionStepType.PRESS_BUTTON:
      return (
        <>
          <ElementFormInput {...fieldFormProps} />
          <WaitForNavigationFormInput {...fieldFormProps} />
          <DurationFormInput {...fieldFormProps} type="waitForElementTimeout" />
          <DurationFormInput {...fieldFormProps} type="waitForNavigationTimeout" />
        </>
      )
    //TODO
    // case ActionStepType.SOLVE_CAPTCHA:
    //   return (
    //     <>
    //       <CaptchaSolverFormInput {...fieldFormProps} />
    //       <ElementsFormInput {...fieldFormProps} />
    //     </>
    //   )
    case ActionStepType.CHECK_ERROR:
    case ActionStepType.CHECK_SUCCESS:
      return (
        <>
          <ElementFormInput {...fieldFormProps} />
          <MapSiteErrorsFormInput
            {...fieldFormProps}
            keyName={stepType === ActionStepType.CHECK_ERROR ? 'mapError' : 'mapSuccess'}
          />
          <DurationFormInput {...fieldFormProps} type="waitForElementTimeout" />
        </>
      )
  }
  return null
}

const DurationFormInput = ({
  fieldName,
  type = 'duration',
}: DataFieldFormProps & {
  type?: 'duration' | 'timeout' | 'waitForElementTimeout' | 'waitForNavigationTimeout'
}) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()

  return (
    <FormInput
      name={`${fieldName}.${type}`}
      form={form}
      label={
        type === 'duration'
          ? 'Duration'
          : type === 'timeout'
          ? 'Timeout'
          : type === 'waitForElementTimeout'
          ? 'Wait for element timeout'
          : type === 'waitForNavigationTimeout'
          ? 'Wait for navigation timeout'
          : 'Unknown type'
      }
      type="number"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <TimerRounded />
          </InputAdornment>
        ),
        endAdornment: <InputAdornment position="end">ms</InputAdornment>,
      }}
    />
  )
}

const ElementFormInput = ({ fieldName }: DataFieldFormProps) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()

  return (
    <FormInput
      name={`${fieldName}.element`}
      form={form}
      label="Element"
      placeholder="JS path"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <CodeRounded />
          </InputAdornment>
        ),
      }}
      sx={{
        minWidth: '16rem',
      }}
    />
  )
}

const WaitForNavigationFormInput = ({ fieldName }: DataFieldFormProps) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()

  return (
    <FormControl>
      <Controller
        name={`${fieldName}.waitForNavigation`}
        control={form.control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch checked={!!field.value} onChange={(_, checked) => field.onChange(checked)} />
            }
            label="Wait for navigation"
          />
        )}
      />
    </FormControl>
  )
}

//TODO
// const CaptchaSolverFormInput = ({ fieldName }: DataFieldFormProps) => {
//   const form = useFormContext<UpsertSiteInstructionsSchema>()

//   return (
//     <Controller
//       name={`${fieldName}.solver`}
//       control={form.control}
//       render={({ field }) => (
//         <TextField
//           variant="standard"
//           label="Captcha solver"
//           select
//           value={field.value ?? ''}
//           onChange={(e) => field.onChange(e.target.value)}
//           onBlur={field.onBlur}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <FormatListBulletedRounded />
//               </InputAdornment>
//             ),
//           }}
//         >
//           {Object.values(CaptchaSolverType).map((solver) => (
//             <MenuItem key={solver} value={solver}>
//               {captchaSolverTypeNames[solver]}
//             </MenuItem>
//           ))}
//         </TextField>
//       )}
//     />
//   )
// }

// const ElementsFormInput = ({ fieldName }: DataFieldFormProps) => {
//   const form = useFormContext<UpsertSiteInstructionsSchema>()
//   const elementsFields = useFieldArray<
//     UpsertSiteInstructionsSchema,
//     // @ts-expect-error missing type support for array of strings
//     `${typeof fieldName}.elements`
//   >({
//     name: `${fieldName}.elements`,
//   })

//   return (
//     <ItemsList
//       title="Elements"
//       items={elementsFields.fields}
//       level={2}
//       onAdd={() => elementsFields.append('')}
//       onDelete={(_, index) => elementsFields.remove(index)}
//     >
//       {(field, index) => [
//         field.id,
//         <FormInput
//           key={field.id}
//           name={`${fieldName}.elements.${index}`}
//           form={form}
//           label="Element"
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <CodeRounded />
//               </InputAdornment>
//             ),
//           }}
//           sx={{
//             minWidth: '16rem',
//           }}
//         />,
//       ]}
//     </ItemsList>
//   )
// }

const MapSiteErrorsFormInput = ({
  fieldName,
  keyName,
}: DataFieldFormProps & { keyName: 'mapError' | 'mapSuccess' }) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const siteErrorFields = useFieldArray<
    UpsertSiteInstructionsSchema,
    `${typeof fieldName}.${typeof keyName}`
  >({
    name: `${fieldName}.${keyName}`,
  })

  return (
    <ItemsList
      title={keyName === 'mapError' ? 'Map error' : 'Map success'}
      items={siteErrorFields.fields}
      level={2}
      onAdd={() =>
        siteErrorFields.append(
          (keyName === 'mapError'
            ? {
                content: '',
                errorType: ActionStepErrorType.UNKNOWN,
              }
            : { content: '' }) as typeof keyName extends 'mapError'
            ? { content: string; errorType: ActionStepErrorType }
            : { content: string },
        )
      }
      onDelete={(_, index) => siteErrorFields.remove(index)}
    >
      {(field, index) => [
        field.id,
        <Stack key={field.id} flexGrow={1} gap={2}>
          <FormInput
            name={`${fieldName}.${keyName}.${index}.content`}
            form={form}
            label="Content"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CodeRounded />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: '16rem',
            }}
          />
          {keyName === 'mapError' && (
            <Controller
              name={`${fieldName}.${keyName}.${index}.errorType`}
              control={form.control}
              render={({ field }) => (
                <TextField
                  variant="standard"
                  label="Error type"
                  select
                  value={field.value ?? ''}
                  onChange={(e) =>
                    //TODO: test it
                    field.onChange(e.target.value as never)
                  }
                  onBlur={field.onBlur}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FormatListBulletedRounded />
                      </InputAdornment>
                    ),
                  }}
                >
                  {Object.values(ActionStepErrorType).map((errorType) => (
                    <MenuItem key={errorType} value={errorType}>
                      {actionStepErrorTypeNames[errorType]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}
        </Stack>,
      ]}
    </ItemsList>
  )
}
