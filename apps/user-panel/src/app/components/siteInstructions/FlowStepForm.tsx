import { useCallback, useContext, useMemo, useState } from 'react'
import { Stack } from '@mui/material'
import {
  GLOBAL_ACTION_PREFIX,
  GlobalActionType,
  isFinishGlobalAction,
  isGlobalAction,
  type Action,
  type FlowStep,
  type UpsertSiteInstructionsSchema,
} from '@web-scraper/common'
import { useFormContext } from 'react-hook-form'
import { ActionNameInput } from './ActionNameInput'
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

      const flow = flowSchemaToExecutableFlow(flowSchema)

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

            const failed = !flowExecutionResult.flowStepsResults.at(-1)?.succeeded

            const lastFlowStepResult = flowExecutionResult.flowStepsResults.at(-1)
            const returnedValues = lastFlowStepResult?.returnedValues.reduce(
              (acc, returnedValue) => {
                if (typeof returnedValue === 'string') {
                  acc.push(returnedValue)
                }
                return acc
              },
              [] as string[],
            )

            if (!failed) {
              enqueueSnackbar({
                variant: 'success',
                message: `Flow completed successfully (returned values: ${
                  returnedValues?.join(', ') ?? '-'
                })`,
              })
            } else {
              enqueueSnackbar({
                variant: 'error',
                message: `Flow execution failed (returned values: ${
                  returnedValues?.join(', ') ?? '-'
                })`,
              })
            }
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
      title={
        title === 'Flow' ? (
          <Stack direction="row" alignItems="center" spacing={1} mr={2} color="text.secondary">
            <ItemTitle>{title}</ItemTitle>
            <TermInfo term="flowStep" sx={{ pointerEvents: 'all' }} />
          </Stack>
        ) : (
          title
        )
      }
      items={items}
      level={level}
      disabled={disabled}
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
        const isFinishActionType = isFinishGlobalAction(field.actionName as FlowStep['actionName'])

        return [
          index,
          <Stack key={index} flexGrow={1} gap="1rem">
            <ActionNameInput fieldName={fieldName} />
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

export function flowSchemaToExecutableFlow(flowSchema: FlowSchemaType, level = 0): FlowStep | null {
  if (!flowSchema) {
    return null
  }

  return {
    ...flowSchema,
    id: level,
    actionName: flowSchema.actionName as FlowStep['actionName'],
    onSuccess: flowSchema.onSuccess
      ? flowSchemaToExecutableFlow(flowSchema.onSuccess as FlowSchemaType, level + 1)
      : null,
    onFailure: flowSchema.onFailure
      ? flowSchemaToExecutableFlow(flowSchema.onFailure as FlowSchemaType, level + 1)
      : null,
  }
}
