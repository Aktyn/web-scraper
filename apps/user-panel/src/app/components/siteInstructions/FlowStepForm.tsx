import { useCallback, useContext, useMemo, useState } from 'react'
import { Stack } from '@mui/material'
import {
  type FlowStep,
  GlobalActionType,
  type UpsertSiteInstructionsSchema,
  GLOBAL_ACTION_PREFIX,
  isGlobalAction,
  type Action,
} from '@web-scraper/common'
import { useFormContext } from 'react-hook-form'
import { ActionNameForm } from './ActionNameForm'
import { actionSchemaToExecutableAction } from './ActionsForm'
import { GlobalReturnValuesForm } from './GlobalReturnValuesForm'
import { SiteInstructionsTestingSessionContext } from '../../context/siteInstructionsTestingSessionContext'
import { useApiRequest } from '../../hooks/useApiRequest'
import { TermInfo } from '../common/TermInfo'
import { ItemTitle } from '../common/treeStructure/ItemTitle'
import { ItemsList } from '../common/treeStructure/ItemsList'

type FlowSchemaType = UpsertSiteInstructionsSchema['procedures'][number]['flow']

interface FlowStepFormProps {
  fieldName:
    | `procedures.${number}.flow`
    | `procedures.${number}.flow.onSuccess`
    | `procedures.${number}.flow.onFailure`
  level?: number
  title?: string
  disabled?: boolean
}

export const FlowStepForm = ({
  fieldName: deepFieldName,
  title = 'Flow',
  level = 1,
  disabled,
}: FlowStepFormProps) => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const getValues = form.getValues

  const fieldName = deepFieldName as `procedures.${number}.flow`
  const flow = form.watch(fieldName)
  const items = useMemo(() => (flow ? [flow] : []), [flow])

  const { submit: submitTestFlow, submitting: testingFlow } = useApiRequest(
    window.electronAPI.testFlow,
  )

  const testingSession = useContext(SiteInstructionsTestingSessionContext)

  const [loadingPlayButtonIndex, setLoadingPlayButtonIndex] = useState(-1)

  const testFlow = useCallback(
    (flowSchema: FlowSchemaType, itemIndex: number) => {
      if (!testingSession) {
        return
      }

      const flow = flowSchemaToExecutableFlow(
        flowSchema,
        // name: get(getValues(), `actions.${itemIndex}.name`),
        // url: get(getValues(), `actions.${itemIndex}.url`),
      )

      if (!flow) {
        return
      }

      console.info('Manually executing flow:', flow)

      const actions = getValues().actions.reduce((acc, actionSchema) => {
        const action = actionSchemaToExecutableAction(actionSchema)
        if (action) {
          acc.push(action)
        }
        return acc
      }, [] as Action[])

      setLoadingPlayButtonIndex(itemIndex)
      submitTestFlow(
        {
          onSuccess: (flowExecutionResult, { enqueueSnackbar }) => {
            setLoadingPlayButtonIndex(-1)

            console.info('Flow execution result:', flowExecutionResult)

            //TODO
            // const failedStepResult = actionExecutionResult.actionStepsResults.find(
            //   (result) => result.result.errorType !== ActionStepErrorType.NO_ERROR,
            // )

            // if (!failedStepResult) {
            enqueueSnackbar({
              variant: 'success',
              message: `Flow completed successfully`,
            })
            // } else {
            //   enqueueSnackbar({
            //     variant: 'error',
            //     message: `Action step failed (step: ${
            //       actionStepTypeNames[failedStepResult.step.type]
            //     }; error: ${
            //       actionStepErrorTypeNames[failedStepResult.result.errorType]
            //     }); mapped content: ${failedStepResult.result.content ?? '-'}`,
            //   })
            // }
          },
        },
        testingSession.sessionId,
        flow,
        actions,
      )
    },
    [getValues, submitTestFlow, testingSession],
  )

  return (
    <ItemsList
      disabled={disabled}
      title={
        title === 'Flow' ? (
          <Stack direction="row" alignItems="center" spacing={1} mr={2} color="text.secondary">
            <ItemTitle>{title}</ItemTitle>
            <TermInfo term="Flow step" sx={{ pointerEvents: 'all' }} />
          </Stack>
        ) : (
          title
        )
      }
      items={items}
      level={level}
      onAdd={
        flow
          ? undefined
          : () =>
              form.setValue(fieldName, {
                actionName: `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH}`,
                globalReturnValues: [],
                onSuccess: null,
                onFailure: null,
              })
      }
      onDelete={() => form.setValue(fieldName, null)}
      onPlay={!testingSession ? undefined : testFlow}
      onPlayTooltip="Test flow"
      loadingPlayButtonIndex={testingFlow ? loadingPlayButtonIndex : -1}
      disablePlayButtons={testingFlow}
    >
      {(field, index) => {
        const isFinishActionType =
          field.actionName === `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH}` ||
          field.actionName === `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH_WITH_ERROR}` ||
          field.actionName ===
            `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH_WITH_NOTIFICATION}`

        return [
          index,
          <Stack key={index} flexGrow={1} gap={2}>
            <ActionNameForm fieldName={fieldName} />
            {isGlobalAction(field.actionName as FlowStep['actionName']) && (
              <GlobalReturnValuesForm
                level={level + 1}
                fieldName={`${fieldName}.globalReturnValues`}
              />
            )}
            <FlowStepForm
              fieldName={`${fieldName}.onSuccess`}
              title="On success"
              level={level + 1}
              disabled={isFinishActionType}
            />
            <FlowStepForm
              fieldName={`${fieldName}.onFailure`}
              title="On failure"
              level={level + 1}
              disabled={isFinishActionType}
            />
          </Stack>,
        ]
      }}
    </ItemsList>
  )
}

export function flowSchemaToExecutableFlow(flowSchema: FlowSchemaType): FlowStep | null {
  if (!flowSchema) {
    return null
  }

  return {
    ...flowSchema,
    id: 0,
    actionName: flowSchema.actionName as FlowStep['actionName'],
    onSuccess: flowSchema.onSuccess
      ? flowSchemaToExecutableFlow(flowSchema.onSuccess as FlowSchemaType)
      : null,
    onFailure: flowSchema.onFailure
      ? flowSchemaToExecutableFlow(flowSchema.onFailure as FlowSchemaType)
      : null,
  }
}
