import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckRounded,
  CircleRounded,
  CodeRounded,
  ErrorRounded,
  ExitToAppRounded,
  ExpandMoreRounded,
  FormatListBulletedRounded,
  LabelRounded,
  LinkRounded,
} from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  type TextFieldProps,
} from '@mui/material'
import { ActionStepErrorType, ScraperExecutionScope } from '@web-scraper/common'
import { StepIcon } from './StepIcon'
import {
  parseScraperExecution,
  type ParsedScraperExecution,
  executionItemResultFailed,
} from './helpers'
import {
  ScraperExecutionModule,
  type ScraperExecutionLite,
} from '../../modules/ScraperExecutionModule'
import {
  actionStepErrorTypeNames,
  actionStepTypeNames,
  procedureTypeNames,
  scraperExecutionScopeNames,
} from '../../utils/dictionaries'

const actionStepScopes = [ScraperExecutionScope.ACTION_STEP]
const anyScopeExceptActionStep = [
  ScraperExecutionScope.PROCEDURE,
  ScraperExecutionScope.FLOW,
  ScraperExecutionScope.ACTION,
]

interface ScraperTestingExecutionDialogProps extends ScraperExecutionLite {
  open: boolean
  onClose: () => void
}

export const ScraperTestingExecutionDialog = ({
  scraperId,
  mode,
  scope,
  open,
  onClose,
}: ScraperTestingExecutionDialogProps) => {
  const executionFinishedInfoRef = useRef<HTMLDivElement | null>(null)

  const executionData = ScraperExecutionModule.useScraperExecution(scraperId, mode)

  const execution = useMemo(
    () => parseScraperExecution(executionData?.execution ?? []),
    [executionData?.execution],
  )

  useEffect(() => {
    if (!executionFinishedInfoRef.current || !executionData?.finished) {
      return
    }
    executionFinishedInfoRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [executionData?.finished])

  return (
    <Dialog open={open}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" pr="1.5rem">
        <DialogTitle color="text.secondary">
          Scraper {scraperExecutionScopeNames[scope]} testing execution
        </DialogTitle>
      </Stack>
      <DialogContent sx={{ pt: 0 }}>
        <Stack gap={2}>
          <ExecutionStepper execution={execution} ignoreScopes={actionStepScopes} />
          {executionData?.finished && (
            <Typography
              ref={executionFinishedInfoRef}
              variant="h6"
              fontWeight="bold"
              color="success.main"
            >
              Execution finished <CheckRounded sx={{ verticalAlign: 'text-bottom' }} />
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="primary" onClick={onClose} endIcon={<ExitToAppRounded />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface ExecutionStepperProps {
  execution: ParsedScraperExecution[]
  ignoreScopes?: ScraperExecutionScope[]
}

const ExecutionStepper = ({ execution, ignoreScopes = [] }: ExecutionStepperProps) => {
  const [activeStep, setActiveStep] = useState(0)

  const filteredExecution = useMemo(
    () => execution.filter((executionItem) => !ignoreScopes.includes(executionItem.start.scope)),
    [execution, ignoreScopes],
  )

  useEffect(() => {
    setActiveStep((current) => {
      const index = filteredExecution.length - 1
      return index > current ? index : current
    })
  }, [filteredExecution.length])

  return (
    <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
      {filteredExecution.map((executionItem, index) => {
        const globalIndex = execution.indexOf(executionItem)

        const actionStepsExecution =
          executionItem.start.scope === ScraperExecutionScope.ACTION
            ? execution.slice(
                globalIndex + 1,
                execution.findIndex(
                  (item, index2) =>
                    index2 > globalIndex && item.start.scope !== ScraperExecutionScope.ACTION_STEP,
                ),
              )
            : null

        return (
          <Step key={executionItem.start.id} completed={!!executionItem.finish}>
            <StepLabel
              StepIconComponent={StepIcon}
              onClick={() => setActiveStep(index)}
              error={executionItemResultFailed(executionItem)}
              sx={{ cursor: 'pointer' }}
            >
              <Stack direction="row" alignItems="center" gap={1}>
                <ScraperExecutionItemLabel item={executionItem} />
                <IconButton disabled={activeStep === index}>
                  <ExpandMoreRounded fontSize="inherit" />
                </IconButton>
              </Stack>
            </StepLabel>
            <StepContent>
              <ScraperExecutionItemContent item={executionItem} />
              {actionStepsExecution && actionStepsExecution.length > 0 && (
                <ExecutionStepper
                  execution={actionStepsExecution}
                  ignoreScopes={anyScopeExceptActionStep}
                />
              )}
            </StepContent>
          </Step>
        )
      })}
    </Stepper>
  )
}

interface ScraperExecutionItemProps {
  item: ParsedScraperExecution
}

const ScraperExecutionItemLabel = ({ item }: ScraperExecutionItemProps) => {
  const status = item.finish ? 'finished' : 'running'

  return (
    <Typography variant="body1" fontWeight="bold">
      {scraperExecutionScopeNames[item.start.scope]} execution {status}
    </Typography>
  )
}

const ScraperExecutionItemContent = ({ item }: ScraperExecutionItemProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 200)
  }, [])

  const start = item.start

  return (
    <Stack ref={containerRef} width="100%">
      {start.scope === ScraperExecutionScope.PROCEDURE && (
        <>
          <ReadonlyField
            label="Type"
            value={procedureTypeNames[start.procedure.type]}
            icon={<FormatListBulletedRounded />}
          />
          <ReadonlyField
            label="Start URL"
            value={start.procedure.startUrl}
            icon={<LinkRounded />}
          />
          {start.procedure.waitFor && (
            <ReadonlyField
              label="Wait for"
              value={start.procedure.waitFor}
              icon={<CodeRounded />}
            />
          )}
        </>
      )}
      {start.scope === ScraperExecutionScope.FLOW && (
        <ReadonlyField
          label="Action name"
          value={start.flow.actionName}
          icon={<FormatListBulletedRounded />}
        />
      )}
      {start.scope === ScraperExecutionScope.ACTION && (
        <>
          <ReadonlyField label="Name" value={start.action.name} icon={<LabelRounded />} />
          {start.action.url && (
            <ReadonlyField label="URL" value={start.action.url} icon={<LinkRounded />} />
          )}
        </>
      )}
      {start.scope === ScraperExecutionScope.ACTION_STEP && (
        <>
          <ReadonlyField
            label="Type"
            value={actionStepTypeNames[start.actionStep.type]}
            icon={<FormatListBulletedRounded />}
          />
        </>
      )}

      {item.result?.scope === ScraperExecutionScope.FLOW &&
        item.result.flowResult.map((flowResult, index) =>
          flowResult.returnedValues.length > 0 ? (
            <Fragment key={index}>
              {flowResult.returnedValues.map((returnedValue, index2) => (
                <ReadonlyField
                  key={index2}
                  label="Returned value"
                  value={typeof returnedValue === 'string' ? returnedValue : returnedValue.error}
                  icon={<CircleRounded />}
                />
              ))}
            </Fragment>
          ) : null,
        )}
      {item.result?.scope === ScraperExecutionScope.ACTION_STEP &&
        item.result.actionStepResult.errorType !== ActionStepErrorType.NO_ERROR && (
          <ReadonlyField
            label="Action error"
            value={actionStepErrorTypeNames[item.result.actionStepResult.errorType]}
            icon={<ErrorRounded color="error" />}
            error
          />
        )}
    </Stack>
  )
}

type ReadonlyFieldProps = TextFieldProps & {
  icon: React.ReactNode
}

const ReadonlyField = ({ icon, ...props }: ReadonlyFieldProps) => (
  <TextField
    variant="standard"
    InputProps={{
      readOnly: true,
      startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
    }}
    {...props}
  />
)
