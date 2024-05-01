import { FormatListBulletedRounded, TimerRounded } from '@mui/icons-material'
import { InputAdornment, MenuItem, Stack, TextField } from '@mui/material'
import {
  ActionStepErrorType,
  ActionStepType,
  SaveDataType,
  type UpsertSiteInstructionsSchema,
} from '@web-scraper/common'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { DataSourceQuerySelect } from './DataSourceQuerySelect'
import { ElementFormInput } from './ElementFormInput'
import { SaveToDataSourceValueInput } from './SaveToDataSourceValueInput'
import { ValueQueryInput } from './ValueQueryInput'
import { actionStepErrorTypeNames, saveDataTypeNames } from '../../utils/dictionaries'
import { ItemsList } from '../common/treeStructure/ItemsList'
import { FormInput } from '../form/FormInput'
import { FormSwitch } from '../form/FormSwitch'
import { RegexIcon } from '../icons/RegexIcon'

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
          <ActionElementFormInput {...fieldFormProps} />
          <DurationFormInput {...fieldFormProps} type="timeout" />
        </>
      )
    // case ActionStepType.UPLOAD_FILE:
    case ActionStepType.FILL_INPUT:
    case ActionStepType.SELECT_OPTION:
      return (
        <>
          <ActionElementFormInput {...fieldFormProps} />
          <ValueQueryInput {...fieldFormProps} />
          {stepType === ActionStepType.FILL_INPUT && (
            <>
              <PressEnterFormSwitch {...fieldFormProps} />
              <InputActionFields {...fieldFormProps} />
            </>
          )}
          <DurationFormInput {...fieldFormProps} type="waitForElementTimeout" />
        </>
      )
    case ActionStepType.PRESS_BUTTON:
      return (
        <>
          <ActionElementFormInput {...fieldFormProps} />
          <WaitForNavigationFormSwitch {...fieldFormProps} />
          <DurationFormInput {...fieldFormProps} type="waitForElementTimeout" />
          <DurationFormInput {...fieldFormProps} type="waitForNavigationTimeout" />
        </>
      )
    case ActionStepType.SAVE_TO_DATA_SOURCE:
      return (
        <>
          <DataSourceQuerySelect {...fieldFormProps} />
          <FormInput
            form={form}
            name={`${fieldFormProps.fieldName}.saveDataType`}
            variant="standard"
            label="Data type"
            select
            defaultValue={form.getValues(`${fieldFormProps.fieldName}.saveDataType`) ?? ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FormatListBulletedRounded />
                </InputAdornment>
              ),
            }}
          >
            {Object.values(SaveDataType).map((saveDataType) => (
              <MenuItem key={saveDataType} value={saveDataType}>
                {saveDataTypeNames[saveDataType]}
              </MenuItem>
            ))}
          </FormInput>
          <SaveToDataSourceValueInput {...fieldFormProps} />
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
          <ActionElementFormInput {...fieldFormProps} />
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

const InputActionFields = ({ fieldName }: DataFieldFormProps) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const pressEnter = form.watch(`${fieldName}.pressEnter`)

  if (!pressEnter) {
    return null
  }

  return (
    <>
      <DurationFormInput fieldName={fieldName} type="delayEnter" />
      <WaitForNavigationFormSwitch fieldName={fieldName} />
      <DurationFormInput fieldName={fieldName} type="waitForNavigationTimeout" />
    </>
  )
}

const DurationFormInput = ({
  fieldName,
  type = 'duration',
}: DataFieldFormProps & {
  type?:
    | 'duration'
    | 'timeout'
    | 'waitForElementTimeout'
    | 'waitForNavigationTimeout'
    | 'delayEnter'
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
                : type === 'delayEnter'
                  ? 'Delay before pressing enter'
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

const ActionElementFormInput = ({ fieldName }: DataFieldFormProps) => {
  return <ElementFormInput name={`${fieldName}.element`} />
}

const WaitForNavigationFormSwitch = ({ fieldName }: DataFieldFormProps) => {
  return (
    <FormSwitch<UpsertSiteInstructionsSchema>
      fieldName={`${fieldName}.waitForNavigation`}
      label="Wait for navigation"
    />
  )
}

const PressEnterFormSwitch = ({ fieldName }: DataFieldFormProps) => {
  return (
    <FormSwitch<UpsertSiteInstructionsSchema>
      fieldName={`${fieldName}.pressEnter`}
      label="Press enter"
    />
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
//?          value={{field.value ?? ''}}
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
            placeholder="RegExp pattern without slashes"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <RegexIcon />
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
