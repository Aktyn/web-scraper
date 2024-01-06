import { useCallback, useRef } from 'react'
import { DeleteRounded, EditRounded, PlayArrowRounded } from '@mui/icons-material'
import { Box, Button, Stack } from '@mui/material'
import { type Routine } from '@web-scraper/common'
import { CustomDrawer, type CustomDrawerRef } from '../../components/common/CustomDrawer'
import { TermInfo } from '../../components/common/TermInfo'
import { ConfirmableButton } from '../../components/common/button/ConfirmableButton'
import { RoutineForm } from '../../components/routine/RoutineForm'
import { useApiRequest } from '../../hooks/useApiRequest'

interface RoutinePanelHeaderOptionsProps {
  routine?: Routine | null
  loading?: boolean
  onEdited?: (routine: Routine) => void
  onDeleted?: (routineId: Routine['id']) => void
}

export const RoutinePanelHeaderOptions = ({
  routine,
  loading,
  onEdited,
  onDeleted,
}: RoutinePanelHeaderOptionsProps) => {
  const routineDrawerRef = useRef<CustomDrawerRef>(null)

  const { submit: deleteRoutineRequest, submitting: deletingRoutine } = useApiRequest(
    window.electronAPI.deleteRoutine,
  )

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

  return (
    <>
      <Stack
        direction="row"
        flexWrap="wrap"
        justifyContent="flex-end"
        alignItems="center"
        gap="0.5rem"
      >
        <Button
          size="large"
          disabled={loading || !routine}
          endIcon={<PlayArrowRounded />}
          onClick={() => {
            //TODO
          }}
        >
          Run
        </Button>
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
          loading={deletingRoutine}
          loadingPosition="end"
        >
          Delete
        </ConfirmableButton>
      </Stack>
      <CustomDrawer
        ref={routineDrawerRef}
        title={
          <Stack direction="row" alignItems="center" gap="0.5rem">
            <Box>Edit routine</Box>
            <TermInfo term="Routine" />
          </Stack>
        }
      >
        <RoutineForm routine={routine} onSuccess={handleRoutineEdited} />
      </CustomDrawer>
    </>
  )
}
