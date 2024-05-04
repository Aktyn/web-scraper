import { useEffect, useState } from 'react'
import { ExpandMoreRounded } from '@mui/icons-material'
import {
  IconButton,
  Stack,
  Step,
  StepContent,
  StepIcon,
  StepLabel,
  Stepper,
  type StepperProps,
} from '@mui/material'
import { ScraperExecutionItemContent } from './ScraperExecutionItemContent'
import { ScraperExecutionItemLabel } from './ScraperExecutionItemLabel'
import { executionItemResultFailed, type ParsedScraperExecution } from './helpers'

type ExecutionStepperProps = {
  execution: ParsedScraperExecution[]
} & StepperProps

export const ExecutionStepper = ({
  execution,
  orientation = 'vertical',
  ...stepperProps
}: ExecutionStepperProps) => {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    setActiveStep((current) => {
      const index = execution.length - 1
      return index > current ? index : current
    })
  }, [execution.length])

  return (
    <Stepper
      activeStep={activeStep}
      orientation={orientation}
      alternativeLabel={orientation === 'horizontal'}
      nonLinear
      {...stepperProps}
    >
      {execution.map((executionItem, index) => (
        <Step key={executionItem.start.id} completed={!!executionItem.finish}>
          <StepLabel
            StepIconComponent={StepIcon}
            onClick={() => setActiveStep(index)}
            error={executionItemResultFailed(executionItem)}
            sx={{ cursor: orientation === 'vertical' ? 'pointer' : 'auto' }}
          >
            <Stack direction="row" alignItems="center" gap="0.5rem">
              <ScraperExecutionItemLabel item={executionItem} />
              {orientation === 'vertical' && (
                <IconButton disabled={activeStep === index}>
                  <ExpandMoreRounded fontSize="inherit" />
                </IconButton>
              )}
            </Stack>
            {orientation === 'horizontal' && <ScraperExecutionItemContent item={executionItem} />}
          </StepLabel>
          {orientation === 'vertical' && (
            <StepContent>
              <ScraperExecutionItemContent item={executionItem} />
            </StepContent>
          )}
        </Step>
      ))}
    </Stepper>
  )
}
