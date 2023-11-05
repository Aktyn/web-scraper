import { useCallback, useContext, useState } from 'react'
import { FormatListBulletedRounded } from '@mui/icons-material'
import { InputAdornment, MenuItem, Stack } from '@mui/material'
import {
  type ActionStep,
  ActionStepErrorType,
  ActionStepType,
  type UpsertSiteInstructionsSchema,
  type ValueQuery,
  ValueQueryType,
} from '@web-scraper/common'
import { get, useFieldArray, useFormContext } from 'react-hook-form'
import { StepDataForm } from './StepDataForm'
import { SiteInstructionsTestingSessionContext } from '../../context/siteInstructionsTestingSessionContext'
import { useApiRequest } from '../../hooks/useApiRequest'
import { actionStepErrorTypeNames, actionStepTypeNames } from '../../utils/dictionaries'
import { ItemsList } from '../common/treeStructure/ItemsList'
import { FormInput } from '../form/FormInput'

interface StepsFormProps {
  fieldName: `actions.${number}.actionSteps`
  testingAction: boolean
}

export const StepsForm = ({ fieldName, testingAction }: StepsFormProps) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const getValues = form.getValues
  const stepsFields = useFieldArray<UpsertSiteInstructionsSchema, typeof fieldName>({
    name: fieldName,
  })

  const { submit: submitTestActionStep, submitting: testingActionStep } = useApiRequest(
    window.electronAPI.testActionStep,
  )

  const testingSession = useContext(SiteInstructionsTestingSessionContext)

  const [loadingPlayButtonIndex, setLoadingPlayButtonIndex] = useState(-1)

  const testActionStep = useCallback(
    (
      actionStepSchema: UpsertSiteInstructionsSchema['actions'][number]['actionSteps'][number],
      itemIndex: number,
    ) => {
      if (!testingSession) {
        return
      }

      const actionStep = actionStepSchemaToExecutableActionStep(
        {
          ...actionStepSchema,
          type: get(getValues(), `${fieldName}.${itemIndex}.type`),
        },
        itemIndex,
      )

      if (!actionStep) {
        return
      }

      console.info(
        `Manually executing action step (${actionStepTypeNames[actionStep.type]}):`,
        actionStep,
      )

      setLoadingPlayButtonIndex(itemIndex)
      submitTestActionStep(
        {
          onSuccess: (mapSiteError, { enqueueSnackbar }) => {
            setLoadingPlayButtonIndex(-1)

            if (mapSiteError.errorType === ActionStepErrorType.NO_ERROR) {
              enqueueSnackbar({
                variant: 'success',
                message: `Action step completed (${actionStepTypeNames[actionStep.type]})`,
              })
            } else {
              enqueueSnackbar({
                variant: 'error',
                message: `Action step failed (${
                  actionStepErrorTypeNames[mapSiteError.errorType]
                }); mapped content: ${mapSiteError.content ?? '-'}`,
              })
            }
          },
        },
        testingSession.sessionId,
        actionStep,
      )
    },
    [fieldName, getValues, submitTestActionStep, testingSession],
  )

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
            value: `${ValueQueryType.CUSTOM}.`,
          },
        })
      }
      onDelete={(_, index) => stepsFields.remove(index)}
      onPlay={!testingSession ? undefined : testActionStep}
      onPlayTooltip="Test step"
      loadingPlayButtonIndex={testingActionStep ? loadingPlayButtonIndex : -1}
      disablePlayButtons={testingActionStep || testingAction}
    >
      {(field, index) => [
        field.id,
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
        </Stack>,
      ]}
    </ItemsList>
  )
}

export function actionStepSchemaToExecutableActionStep(
  actionStepSchema: UpsertSiteInstructionsSchema['actions'][number]['actionSteps'][number],
  orderIndex = 0,
): ActionStep | null {
  if (!actionStepSchema?.data) {
    return null
  }

  const zeroIndexes = { id: 0, actionId: 0, orderIndex } as const

  switch (actionStepSchema.type) {
    case ActionStepType.WAIT:
      if (!actionStepSchema.data.duration) {
        return null
      }
      return {
        ...actionStepSchema,
        ...zeroIndexes,
        type: actionStepSchema.type,
        data: {
          duration: actionStepSchema.data.duration,
        },
      }
    case ActionStepType.WAIT_FOR_ELEMENT:
      if (!actionStepSchema.data.element) {
        return null
      }
      return {
        ...actionStepSchema,
        ...zeroIndexes,
        type: actionStepSchema.type,
        data: {
          element: actionStepSchema.data.element,
          timeout: actionStepSchema.data.timeout ?? undefined,
        },
      }
    case ActionStepType.FILL_INPUT:
      if (!actionStepSchema.data.element || !actionStepSchema.data.value) {
        return null
      }
      return {
        ...actionStepSchema,
        ...zeroIndexes,
        type: actionStepSchema.type,
        data: {
          element: actionStepSchema.data.element,
          value: actionStepSchema.data.value as ValueQuery,
          waitForElementTimeout: actionStepSchema.data.waitForElementTimeout ?? undefined,
        },
      }
    // case ActionStepType.UPLOAD_FILE:
    //   if (!actionStepSchema.data.element || !actionStepSchema.data.value) {
    //     return null
    //   }
    //   return {
    //     ...actionStepSchema,
    //     data: {
    //       element: actionStepSchema.data.element,
    //       value: actionStepSchema.data.value,
    //     },
    //   }
    case ActionStepType.SELECT_OPTION:
      if (!actionStepSchema.data.element || !actionStepSchema.data.value) {
        return null
      }
      return {
        ...actionStepSchema,
        ...zeroIndexes,
        type: actionStepSchema.type,
        data: {
          element: actionStepSchema.data.element,
          value: actionStepSchema.data.value as ValueQuery,
          waitForElementTimeout: actionStepSchema.data.waitForElementTimeout ?? undefined,
        },
      }
    case ActionStepType.PRESS_BUTTON:
      if (!actionStepSchema.data.element) {
        return null
      }
      return {
        ...actionStepSchema,
        ...zeroIndexes,
        type: actionStepSchema.type,
        data: {
          element: actionStepSchema.data.element,
          waitForNavigation: actionStepSchema.data.waitForNavigation ?? false,
          waitForNavigationTimeout: actionStepSchema.data.waitForNavigationTimeout ?? undefined,
          waitForElementTimeout: actionStepSchema.data.waitForElementTimeout ?? undefined,
        },
      }
    //TODO
    // case ActionStepType.SOLVE_CAPTCHA:
    //   if (
    //     !actionStepSchema.data.solver ||
    //     !actionStepSchema.data.elements ||
    //     !actionStepSchema.data.elements.every(Boolean)
    //   ) {
    //     return null
    //   }
    //   return {
    //     ...actionStepSchema,
    //     data: {
    //       solver: actionStepSchema.data.solver,
    //       elements: actionStepSchema.data.elements as string[],
    //     },
    //   }
    case ActionStepType.CHECK_ERROR:
      if (!actionStepSchema.data.element || !actionStepSchema.data.mapError) {
        return null
      }
      return {
        ...actionStepSchema,
        ...zeroIndexes,
        type: actionStepSchema.type,
        data: {
          element: actionStepSchema.data.element,
          mapError: actionStepSchema.data.mapError,
          waitForElementTimeout: actionStepSchema.data.waitForElementTimeout ?? undefined,
        },
      }
    case ActionStepType.CHECK_SUCCESS:
      if (!actionStepSchema.data.element || !actionStepSchema.data.mapSuccess) {
        return null
      }
      return {
        ...actionStepSchema,
        ...zeroIndexes,
        type: actionStepSchema.type,
        data: {
          element: actionStepSchema.data.element,
          mapSuccess: actionStepSchema.data.mapSuccess?.map((item) => ({ content: item.content })),
          waitForElementTimeout: actionStepSchema.data.waitForElementTimeout ?? undefined,
        },
      }
  }
}
