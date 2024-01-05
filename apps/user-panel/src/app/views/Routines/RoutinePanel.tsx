import { useCallback, useEffect, useRef, useState } from 'react'
import { DeleteRounded, EditRounded } from '@mui/icons-material'
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { upsertRoutineSchema, type Routine } from '@web-scraper/common'
import { HorizontallyScrollableContainer } from 'src/app/components/common/HorizontallyScrollableContainer'
import { BooleanValue } from 'src/app/components/table/BooleanValue'
import { CustomDrawer, type CustomDrawerRef } from '../../components/common/CustomDrawer'
import { TermInfo } from '../../components/common/TermInfo'
import { ConfirmableButton } from '../../components/common/button/ConfirmableButton'
import { RoutineForm } from '../../components/routine/RoutineForm'
import { useApiRequest } from '../../hooks/useApiRequest'

export const RoutinePanel = ({ routineInfo }: { routineInfo: Pick<Routine, 'name' | 'id'> }) => {
  const routineDrawerRef = useRef<CustomDrawerRef>(null)
  const { submit: getRoutineRequest } = useApiRequest(window.electronAPI.getRoutine)

  const [routine, setRoutine] = useState<Routine | null>(null)
  const [loadingRoutine, setLoadingRoutine] = useState(true)

  const loadRoutine = useCallback(() => {
    getRoutineRequest(
      {
        onSuccess: setRoutine,
        onEnd: () => setLoadingRoutine(false),
      },
      routineInfo.id,
    )
  }, [getRoutineRequest, routineInfo.id])

  useEffect(() => {
    loadRoutine()
  }, [loadRoutine])

  const handleDelete = useCallback(() => {
    //TODO
  }, [])

  const handleRoutineEdited = useCallback(() => {
    routineDrawerRef.current?.close()
    loadRoutine()
  }, [loadRoutine])

  return (
    <>
      <Stack height="100%" p="1rem">
        <Stack
          direction="row"
          maxWidth="100%"
          justifyContent="space-between"
          alignItems="flex-start"
          gap="1rem"
        >
          <Stack maxWidth="100%" overflow="hidden">
            <HorizontallyScrollableContainer>
              <Typography variant="h4" whiteSpace="nowrap">
                {routineInfo.name}
              </Typography>
            </HorizontallyScrollableContainer>
            {routine && (
              <>
                <HorizontallyScrollableContainer>
                  <Typography variant="h6" whiteSpace="nowrap" color="text.secondary">
                    {routine.description ?? '-'}
                  </Typography>
                </HorizontallyScrollableContainer>
                <Typography variant="body1">
                  Stop on error:&nbsp;
                  <BooleanValue
                    component="span"
                    value={
                      routine.stopOnError ?? upsertRoutineSchema.getDefault().stopOnError ?? false
                    }
                    sx={{ display: 'inline-flex', verticalAlign: 'bottom' }}
                  />
                </Typography>
              </>
            )}
          </Stack>
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="flex-end"
            alignItems="center"
            gap="0.5rem"
          >
            <Button
              size="large"
              disabled={loadingRoutine || !routine}
              startIcon={<EditRounded />}
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
              disabled={loadingRoutine || !routine}
              startIcon={<DeleteRounded />}
              onConfirm={handleDelete}
            >
              Delete
            </ConfirmableButton>
          </Stack>
        </Stack>
        {loadingRoutine && (
          <CircularProgress color="primary" size="2rem" sx={{ mx: 'auto', my: 2 }} />
        )}
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
