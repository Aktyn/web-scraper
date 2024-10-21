import { useCallback, useRef, useState } from 'react'
import {
  DeleteRounded,
  EditRounded,
  PlayArrowRounded,
  VisibilityOffRounded,
  VisibilityRounded,
} from '@mui/icons-material'
import { Box, Button, Stack, useTheme } from '@mui/material'
import { type Routine } from '@web-scraper/common'
import { CustomDrawer, type CustomDrawerRef } from '../../components/common/CustomDrawer'
import { TermInfo } from '../../components/common/TermInfo'
import { ConfirmableButton } from '../../components/common/button/ConfirmableButton'
import { IconToggle } from '../../components/common/button/IconToggle'
import { AnimatedBorder } from '../../components/common/effect/AnimatedBorder'
import { RoutineForm } from '../../components/routine/RoutineForm'
import { useApiRequest } from '../../hooks/useApiRequest'

interface RoutinePanelHeaderOptionsProps {
  routine?: Routine | null
  loading?: boolean
  onEdited?: (routine: Routine) => void
  onDeleted?: (routineId: Routine['id']) => void
  active?: boolean
}

export const RoutinePanelHeaderOptions = ({
  routine,
  loading,
  onEdited,
  onDeleted,
  active = false,
}: RoutinePanelHeaderOptionsProps) => {
  const routineDrawerRef = useRef<CustomDrawerRef>(null)
  const theme = useTheme()

  const { submit: deleteRoutineRequest, submitting: deletingRoutine } = useApiRequest(
    window.electronAPI.deleteRoutine,
  )
  const { submit: executeRoutineRequest, submitting: runningRoutine } = useApiRequest(
    window.electronAPI.executeRoutine,
  )

  const [runWithPreview, setRunWithPreview] = useState(false)

  const handleDelete = useCallback(() => {
    if (!routine?.id) {
      return
    }
    deleteRoutineRequest(
      {
        onSuccess: (_, { enqueueSnackbar }) => {
          enqueueSnackbar({ variant: 'success', message: 'Routine deleted' })
          onDeleted?.(routine.id)
        },
      },
      routine.id,
    )
  }, [deleteRoutineRequest, onDeleted, routine?.id])

  const handleRoutineEdited = useCallback(
    (routine: Routine) => {
      routineDrawerRef.current?.close()
      onEdited?.(routine)
    },
    [onEdited],
  )

  const handleRunRoutine = useCallback(() => {
    if (!routine?.id) {
      return
    }

    executeRoutineRequest(
      {
        onSuccess: (data, { enqueueSnackbar }) => {
          enqueueSnackbar({
            variant: 'success',
            message: `Routine is running with execution id ${data.executionId}`,
          })
        },
      },
      routine.id,
      runWithPreview,
    )
  }, [executeRoutineRequest, routine?.id, runWithPreview])

  return (
    <>
      <Stack
        direction="row"
        flexWrap="wrap"
        justifyContent="flex-end"
        alignItems="center"
        gap="0.5rem"
      >
        <AnimatedBorder
          active={active}
          borderRadius="max"
          animationDuration={800}
          offset={-1}
          rectProps={{
            strokeWidth: 2,
            strokeDasharray: [11, 12],
            stroke: theme.palette.secondary.main,
          }}
        >
          <ConfirmableButton
            variant="outlined"
            size="large"
            disabled={active || !routine}
            startIcon={
              <Box sx={{ my: '-7px', ml: 'calc(-21px + 0.5rem)' }}>
                <IconToggle
                  tooltipTitle="Toggle routine execution preview"
                  options={routineExecutionPreviewToggleOptions}
                  value={runWithPreview}
                  onChange={setRunWithPreview}
                  buttonProps={{ tabIndex: -1, disableRipple: true }}
                  sx={{ backgroundColor: 'transparent' }}
                />
              </Box>
            }
            endIcon={<PlayArrowRounded />}
            onConfirm={handleRunRoutine}
            loadingPosition="end"
            loading={runningRoutine}
          >
            Run
          </ConfirmableButton>
        </AnimatedBorder>
        <Button
          size="large"
          disabled={loading || !routine}
          endIcon={<EditRounded />}
          onClick={() => {
            if (routine) {
              routineDrawerRef.current?.open()
            }
          }}
        >
          Edit
        </Button>
        <ConfirmableButton
          variant="outlined"
          size="large"
          disabled={loading || !routine}
          endIcon={<DeleteRounded />}
          onConfirm={handleDelete}
          loadingPosition="end"
          loading={deletingRoutine}
        >
          Delete
        </ConfirmableButton>
      </Stack>
      <CustomDrawer
        ref={routineDrawerRef}
        title={
          <Stack direction="row" alignItems="center" gap="0.5rem">
            <Box>Edit routine</Box>
            <TermInfo term="routine" />
          </Stack>
        }
      >
        <RoutineForm routine={routine} onSuccess={handleRoutineEdited} />
      </CustomDrawer>
    </>
  )
}

const routineExecutionPreviewToggleOptions = [
  {
    value: true,
    icon: <VisibilityRounded fontSize="inherit" />,
  },
  {
    value: false,
    icon: <VisibilityOffRounded fontSize="inherit" />,
  },
] as const
