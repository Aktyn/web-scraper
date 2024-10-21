import { useCallback, useContext, useState } from 'react'
import { FormatListBulletedRounded, LabelRounded, LinkRounded } from '@mui/icons-material'
import { InputAdornment, MenuItem, Stack } from '@mui/material'
import {
  ProcedureType,
  type Action,
  type Procedure,
  type UpsertSiteInstructionsSchema,
} from '@web-scraper/common'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { actionSchemaToExecutableAction } from './ActionsForm'
import { ElementFormInput } from './ElementFormInput'
import { FlowStepForm, flowSchemaToExecutableFlow } from './FlowStepForm'
import { SiteInstructionsTestingSessionContext } from '../../context/siteInstructionsTestingSessionContext'
import { useApiRequest } from '../../hooks/useApiRequest'
import { NotificationType, NotificationsModule } from '../../modules/NotificationsModule'
import { actionStepErrorTypeNames, procedureTypeNames } from '../../utils/dictionaries'
import { TermInfo } from '../common/TermInfo'
import { ItemTitle } from '../common/treeStructure/ItemTitle'
import { ItemsList } from '../common/treeStructure/ItemsList'
import { FormInput } from '../form/FormInput'

export const ProceduresForm = () => {
  const form = useFormContext<UpsertSiteInstructionsSchema>()
  const getValues = form.getValues
  const proceduresFields = useFieldArray<UpsertSiteInstructionsSchema, 'procedures'>({
    name: 'procedures',
  })

  const { submit: submitTestProcedure, submitting: testingProcedure } = useApiRequest(
    window.electronAPI.testProcedure,
  )
  const { pushNotification } = NotificationsModule.useNotifications()

  const testingSession = useContext(SiteInstructionsTestingSessionContext)

  const [loadingPlayButtonIndex, setLoadingPlayButtonIndex] = useState(-1)

  const testProcedure = useCallback(
    (procedureSchema: UpsertSiteInstructionsSchema['procedures'][number], itemIndex: number) => {
      if (!testingSession) {
        return
      }

      const procedure = procedureSchemaToExecutableProcedure(procedureSchema)

      if (!procedure) {
        return
      }

      console.info(
        `Manually executing procedure (${procedureTypeNames[procedure.type]}):`,
        procedure,
      )
      pushNotification({
        type: NotificationType.INFO,
        title: 'Procedure execution',
        content: `Executing procedure. Type: ${procedureTypeNames[procedure.type]}. Id: ${
          procedure.id
        }`,
      })

      const actions = getValues().actions.reduce((acc, actionSchema) => {
        const action = actionSchemaToExecutableAction(actionSchema)
        if (action) {
          acc.push(action)
        }
        return acc
      }, [] as Action[])

      setLoadingPlayButtonIndex(itemIndex)
      submitTestProcedure(
        {
          onSuccess: (procedureExecutionResult, { enqueueSnackbar }) => {
            setLoadingPlayButtonIndex(-1)

            console.info('Procedure execution result:', procedureExecutionResult)

            if ('errorType' in procedureExecutionResult.flowExecutionResult) {
              enqueueSnackbar({
                variant: 'error',
                message: `Procedure execution failed with error: ${
                  actionStepErrorTypeNames[procedureExecutionResult.flowExecutionResult.errorType]
                }`,
              })
              pushNotification({
                type: NotificationType.ERROR,
                title: 'Procedure execution',
                content: `Procedure execution failed. Error: ${
                  actionStepErrorTypeNames[procedureExecutionResult.flowExecutionResult.errorType]
                }; Procedure id: ${procedure.id}`,
              })
            } else {
              const failed =
                !procedureExecutionResult.flowExecutionResult.flowStepsResults.at(-1)?.succeeded

              const lastFlowStepResult =
                procedureExecutionResult.flowExecutionResult.flowStepsResults.at(-1)
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
                  message: `Procedure completed successfully (returned values: ${
                    returnedValues?.join(', ') ?? '-'
                  })`,
                })
                pushNotification({
                  type: NotificationType.SUCCESS,
                  title: 'Procedure execution',
                  content: returnedValues?.length
                    ? `Procedure succeeded. Returned values: ${
                        returnedValues?.join(', ') ?? '-'
                      }; Procedure id: ${procedure.id}`
                    : `Procedure succeeded. Procedure id: ${procedure.id}`,
                })
              } else {
                enqueueSnackbar({
                  variant: 'error',
                  message: returnedValues?.length
                    ? `Procedure execution failed. Returned values: ${
                        returnedValues?.join(', ') ?? '-'
                      }`
                    : 'Procedure execution failed',
                })
                pushNotification({
                  type: NotificationType.WARNING,
                  title: 'Procedure execution',
                  content: returnedValues?.length
                    ? `Procedure ended unsuccessfully. Returned values: ${
                        returnedValues?.join(', ') ?? '-'
                      }; Procedure id: ${procedure.id}`
                    : `Procedure ended unsuccessfully. Procedure id: ${procedure.id}`,
                })
              }
            }
          },
        },
        testingSession.testingSession.sessionId,
        procedure,
        actions,
      )
    },
    [getValues, pushNotification, submitTestProcedure, testingSession],
  )

  return (
    <ItemsList
      title={
        <Stack direction="row" alignItems="center" gap="0.5rem" mr="1rem" color="text.secondary">
          <ItemTitle>Procedures</ItemTitle>
          <TermInfo term="procedure" sx={{ pointerEvents: 'all' }} />
        </Stack>
      }
      items={proceduresFields.fields}
      onAdd={() =>
        proceduresFields.append({
          type: ProcedureType.ACCOUNT_CHECK,
          name: '',
          startUrl: '',
          waitFor: null,
          flow: null,
        })
      }
      onDelete={(_, index) => proceduresFields.remove(index)}
      onPlay={!testingSession ? undefined : testProcedure}
      onPlayTooltip="Test procedure"
      loadingPlayButtonIndex={testingProcedure ? loadingPlayButtonIndex : -1}
      disablePlayButtons={testingProcedure}
    >
      {(field, index) => [
        field.id,
        <Stack key={field.id} flexGrow={1} gap="1rem">
          <FormInput
            name={`procedures.${index}.name`}
            form={form}
            label="Name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LabelRounded />
                </InputAdornment>
              ),
            }}
          />
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
          <ElementFormInput name={`procedures.${index}.waitFor`} label="Wait for" />
          <FlowStepForm fieldName={`procedures.${index}.flow`} />
        </Stack>,
      ]}
    </ItemsList>
  )
}

function procedureSchemaToExecutableProcedure(
  procedureSchema: UpsertSiteInstructionsSchema['procedures'][number],
): Procedure | null {
  return {
    ...procedureSchema,
    id: 0,
    siteInstructionsId: 0,
    flow: flowSchemaToExecutableFlow(procedureSchema.flow),
  }
}
