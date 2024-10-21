import { useEffect, useMemo, useRef } from 'react'
import { CheckRounded, ExitToAppRounded } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { ExecutionStepper } from './ExecutionStepper'
import { parseScraperExecution } from './helpers'
import {
  ScraperExecutionModule,
  type ScraperExecutionLite,
} from '../../modules/ScraperExecutionModule'
import { scraperExecutionScopeNames } from '../../utils/dictionaries'

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
        <Stack gap="1rem">
          <ExecutionStepper execution={execution} />
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
