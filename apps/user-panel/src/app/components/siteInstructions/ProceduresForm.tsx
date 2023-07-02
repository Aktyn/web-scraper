import { useCallback, useContext, useState } from 'react'
import { CodeRounded, FormatListBulletedRounded, LinkRounded } from '@mui/icons-material'
import { InputAdornment, MenuItem, Stack } from '@mui/material'
import {
  ProcedureType,
  type Procedure,
  type UpsertSiteInstructionsSchema,
  type Action,
} from '@web-scraper/common'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { actionSchemaToExecutableAction } from './ActionsForm'
import { FlowStepForm, flowSchemaToExecutableFlow } from './FlowStepForm'
import { SiteInstructionsTestingSessionContext } from '../../context/siteInstructionsTestingSessionContext'
import { useApiRequest } from '../../hooks/useApiRequest'
import { actionStepErrorTypeNames, procedureTypeNames } from '../../utils/site-instructions-helpers'
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
              } else {
                enqueueSnackbar({
                  variant: 'error',
                  message: `Procedure execution failed (returned values: ${
                    returnedValues?.join(', ') ?? '-'
                  })`,
                })
              }
            }
          },
        },
        testingSession.sessionId,
        procedure,
        actions,
      )
    },
    [getValues, submitTestProcedure, testingSession],
  )

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
          type: ProcedureType.ACCOUNT_CHECK,
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
