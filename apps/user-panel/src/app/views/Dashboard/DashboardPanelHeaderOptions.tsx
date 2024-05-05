import { useRef } from 'react'
import { HistoryRounded } from '@mui/icons-material'
import { Button, Stack } from '@mui/material'
import { CustomDrawer, type CustomDrawerRef } from '../../components/common/CustomDrawer'
import { RoutineExecutionHistoryTable } from '../../components/routine/executionResults/RoutineExecutionHistoryTable'

export const DashboardPanelHeaderOptions = () => {
  const executionHistoryDrawerRef = useRef<CustomDrawerRef>(null)

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" width="100%">
        <Button
          size="large"
          endIcon={<HistoryRounded />}
          onClick={() => executionHistoryDrawerRef.current?.open()}
        >
          Show routines execution history
        </Button>
      </Stack>
      <CustomDrawer
        ref={executionHistoryDrawerRef}
        title="Routines execution history"
        anchor="bottom"
        closeAfterTransition
      >
        <RoutineExecutionHistoryTable />
      </CustomDrawer>
    </>
  )
}
