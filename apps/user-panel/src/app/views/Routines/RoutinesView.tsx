import { useEffect, useMemo, useState } from 'react'
import { FindInPageRounded } from '@mui/icons-material'
import { Box, Skeleton, Stack, Typography } from '@mui/material'
import type { Routine } from '@web-scraper/common'
import { usePersistentState } from 'src/app/hooks/usePersistentState'
import { TabsView, type TabSchema } from '../../components/common/TabsView'
import { useApiRequest } from '../../hooks/useApiRequest'
import type { ViewComponentProps } from '../helpers'

const RoutinesView = ({ doNotRender }: ViewComponentProps) => {
  const { submit: getRoutinesRequest } = useApiRequest(window.electronAPI.getRoutines)

  const [tabsReady, setTabsReady] = useState(true)
  const [routines, setRoutines] = usePersistentState<Pick<Routine, 'id' | 'name'>[]>(
    'routines-list',
    [],
  )
  const [loadingRoutines, setLoadingSettings] = usePersistentState('routines-list-loading', true)

  useEffect(() => {
    getRoutinesRequest({
      onSuccess: setRoutines,
      onEnd: () => setLoadingSettings(false),
    })
  }, [getRoutinesRequest, setLoadingSettings, setRoutines])

  const tabs = useMemo<TabSchema<Routine['id']>[]>(
    () =>
      loadingRoutines
        ? Array.from({ length: 3 }, (_, i) => ({
            value: -i - 1,
            label: (
              <Box minWidth="8rem">
                <Skeleton variant="rounded" width="100%" height="1.5rem" animation="pulse" />
              </Box>
            ),
            content: null,
            tabComponentProps: { disabled: true },
          }))
        : routines.length > 0
          ? routines.map((routine) => ({
              value: routine.id,
              label: routine.name,
              content: <Stack>{routine.name}</Stack>,
            }))
          : [
              {
                value: -1,
                label: <FindInPageRounded />,
                content: (
                  <Stack alignItems="center" py="4rem">
                    <Typography variant="h5">No routines found</Typography>
                  </Stack>
                ),
                // tabComponentProps: { disabled: true },
              },
            ],
    [loadingRoutines, routines],
  )

  if (doNotRender) {
    return null
  }

  return (
    <TabsView
      name="routines"
      tabs={tabs}
      onAdd={() => void 0}
      addTooltip="Add routine"
      tabsProps={{ scrollButtons: tabsReady ? 'auto' : false, sx: { flexGrow: 1 } }}
      onTabsEntryAnimationStarted={() => setTabsReady(false)}
      onTabsEntryAnimationFinished={() => setTabsReady(true)}
    />
  )

  // TODO: Create, delete, or modify routines, and select existing data sources or create
  // new ones.
  // <br />
  // Routine will contain information about how data should be retrieved from data source which
  // is related to how many times routine will execute (eg.: running routine sequentially for
  // each item in data source).
  // <br />
  // Data source will be attached to routine when it is running.
  // <br />
  // Routine will expose method for currently performing action step which requires external data
  // in some cases (eg.: fill input action step).
  // <br />
  // This method will return data from data source according to current state of routine
  // execution which will be monitored.

  //TODO
  // Example self explanatory routine name: Update crypto prices
  // Testing routines will only be option for previewing puppeteer window
}
export default RoutinesView
