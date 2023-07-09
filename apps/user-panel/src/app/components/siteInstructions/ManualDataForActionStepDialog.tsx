import { useCallback, useState } from 'react'
import { SendRounded } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  type DialogProps,
  TextField,
} from '@mui/material'
import { ElectronToRendererMessage, type ActionStep } from '@web-scraper/common'
import { useApiRequest } from '../../hooks/useApiRequest'
import { actionStepTypeNames } from '../../utils/dictionaries'
import { LabeledValuesList } from '../common/LabeledValuesList'

interface DataSchema {
  requestId: string
  actionStep: ActionStep
  valueQuery: string
}

type ManualDataForActionStepDialogProps = Omit<DialogProps, 'onClose'> & {
  onResponseSent: (data: DataSchema) => void
  data?: DataSchema
}

export function ManualDataForActionStepDialog({
  onResponseSent,
  data,
  ...dialogProps
}: ManualDataForActionStepDialogProps) {
  const {
    submit: submitReturnManualDataForActionStep,
    submitting: submittingReturnManualDataForActionStep,
  } = useApiRequest(window.electronAPI.returnManualDataForActionStep)

  const [userValue, setUserValue] = useState('')

  const handleSendData = useCallback(() => {
    if (!data) {
      return
    }

    submitReturnManualDataForActionStep(
      {
        onSuccess: (_, { enqueueSnackbar }) => {
          enqueueSnackbar({ variant: 'success', message: 'Data returned to continue action step' })
        },
        onEnd: () => onResponseSent(data),
      },
      ElectronToRendererMessage.requestManualDataForActionStep,
      data.requestId,
      userValue,
    )
  }, [data, onResponseSent, submitReturnManualDataForActionStep, userValue])

  return (
    <Dialog {...dialogProps}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" pr="1.5rem">
        <DialogTitle color="text.secondary">Action step requires data to continue</DialogTitle>
      </Stack>
      <DialogContent sx={{ pt: 0 }}>
        <Stack alignItems="center" rowGap={1}>
          <Stack alignItems="center">
            <LabeledValuesList
              data={[
                {
                  label: 'Action step',
                  value: data ? actionStepTypeNames[data.actionStep.type] : '-',
                },
                {
                  label: 'Value query',
                  value: data?.valueQuery ?? '-',
                },
              ]}
            />
          </Stack>
          <DialogContentText color="text.primary" whiteSpace="pre-wrap">
            Fill data that will be used in action step
          </DialogContentText>
          <TextField
            variant="standard"
            required
            autoFocus
            fullWidth
            label="Value"
            value={userValue}
            onChange={(event) => setUserValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSendData()
              }
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="outlined"
          color="primary"
          onClick={handleSendData}
          endIcon={<SendRounded />}
          loading={submittingReturnManualDataForActionStep}
          loadingPosition="end"
        >
          Send data
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
