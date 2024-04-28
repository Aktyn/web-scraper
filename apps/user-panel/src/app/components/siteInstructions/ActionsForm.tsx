import { useCallback, useContext, useState } from 'react'
import { LabelRounded, LinkRounded } from '@mui/icons-material'
import { FormControl, FormHelperText, InputAdornment, Stack } from '@mui/material'
import {
  ActionStepErrorType,
  type Action,
  type ActionStep,
  type UpsertSiteInstructionsSchema,
} from '@web-scraper/common'
import { get, useFieldArray, useFormContext } from 'react-hook-form'
import { StepsForm, actionStepSchemaToExecutableActionStep } from './StepsForm'
import { SiteInstructionsTestingSessionContext } from '../../context/siteInstructionsTestingSessionContext'
import { useApiRequest } from '../../hooks/useApiRequest'
import { actionStepErrorTypeNames, actionStepTypeNames } from '../../utils/dictionaries'
import { TermInfo } from '../common/TermInfo'
import { ItemTitle } from '../common/treeStructure/ItemTitle'
import { ItemsList } from '../common/treeStructure/ItemsList'
import { FormInput } from '../form/FormInput'

export const ActionsForm = () => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const getValues = form.getValues
  const error = form.getFieldState('actions').error

  const actionsFields = useFieldArray<UpsertSiteInstructionsSchema, 'actions'>({
    name: 'actions',
  })

  const { submit: submitTestAction, submitting: testingAction } = useApiRequest(
    window.electronAPI.testAction,
  )

  const testingSession = useContext(SiteInstructionsTestingSessionContext)

  const [loadingPlayButtonIndex, setLoadingPlayButtonIndex] = useState(-1)

  const testAction = useCallback(
    (actionSchema: UpsertSiteInstructionsSchema['actions'][number], itemIndex: number) => {
      if (!testingSession) {
        return
      }

      const action = actionSchemaToExecutableAction({
        ...actionSchema,
        name: get(getValues(), `actions.${itemIndex}.name`),
        url: get(getValues(), `actions.${itemIndex}.url`),
      })

      if (!action) {
        return
      }

      console.info(`Manually executing action (${action.name}):`, action)

      setLoadingPlayButtonIndex(itemIndex)
      submitTestAction(
        {
          onSuccess: (actionExecutionResult, { enqueueSnackbar }) => {
            setLoadingPlayButtonIndex(-1)

            console.info('Action execution result:', actionExecutionResult)

            const failedStepResult = actionExecutionResult.actionStepsResults.find(
              (result) => result.result.errorType !== ActionStepErrorType.NO_ERROR,
            )

            if (!failedStepResult) {
              enqueueSnackbar({
                variant: 'success',
                message: `Action completed with all steps successful (${action.name})`,
              })
            } else {
              enqueueSnackbar({
                variant: 'error',
                message: `Action step failed (step: ${
                  actionStepTypeNames[failedStepResult.step.type]
                }; error: ${
                  actionStepErrorTypeNames[failedStepResult.result.errorType]
                }); mapped content: ${failedStepResult.result.content ?? '-'}`,
              })
            }
          },
        },
        testingSession.testingSession.sessionId,
        action,
      )
    },
    [getValues, submitTestAction, testingSession],
  )

  return (
    <FormControl error={!!error}>
      <ItemsList
        title={
          <Stack direction="row" alignItems="center" spacing={1} mr={2} color="text.secondary">
            <ItemTitle>Actions</ItemTitle>
            <TermInfo term="action" sx={{ pointerEvents: 'all' }} />
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
        onPlay={!testingSession ? undefined : testAction}
        onPlayTooltip="Test action"
        loadingPlayButtonIndex={testingAction ? loadingPlayButtonIndex : -1}
        disablePlayButtons={testingAction}
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
            <StepsForm fieldName={`actions.${index}.actionSteps`} testingAction={testingAction} />
          </Stack>,
        ]}
      </ItemsList>
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  )
}

export function actionSchemaToExecutableAction(
  actionSchema: UpsertSiteInstructionsSchema['actions'][number],
): Action | null {
  return {
    ...actionSchema,
    id: 0,
    siteInstructionsId: 0,
    actionSteps: actionSchema.actionSteps.reduce((acc, actionStepSchema, index) => {
      const step = actionStepSchemaToExecutableActionStep(actionStepSchema, index)
      if (step) {
        acc.push(step)
      }
      return acc
    }, [] as ActionStep[]),
  }
}
