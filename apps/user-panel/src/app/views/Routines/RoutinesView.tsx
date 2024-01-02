import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FindInPageRounded } from '@mui/icons-material'
import { Box, Grow, Skeleton, Stack, Typography } from '@mui/material'
import type { Routine } from '@web-scraper/common'
import { DataSourcesContext } from 'src/app/context/dataSourcesContext'
import { ViewTransition } from '../../components/animation/ViewTransition'
import { CustomDrawer, type CustomDrawerRef } from '../../components/common/CustomDrawer'
import { TabsView, type TabSchema } from '../../components/common/TabsView'
import { TermInfo } from '../../components/common/TermInfo'
import { RoutineForm } from '../../components/routine/RoutineForm'
import { useApiRequest } from '../../hooks/useApiRequest'
import { useDataSourcesLoader } from '../../hooks/useDataSourcesLoader'
import { usePersistentState } from '../../hooks/usePersistentState'
import type { ViewComponentProps } from '../helpers'

const RoutinesView = ({ doNotRender }: ViewComponentProps) => {
  const siteDrawerRef = useRef<CustomDrawerRef>(null)
  const { submit: getRoutinesRequest } = useApiRequest(window.electronAPI.getRoutines)
  const { loadDataSources, dataSources } = useDataSourcesLoader()

  const [tabsReady, setTabsReady] = useState(true)
  const [routines, setRoutines] = usePersistentState<Pick<Routine, 'id' | 'name'>[]>(
    'routines-list',
    [],
  )
  const [loadingRoutines, setLoadingRoutines] = usePersistentState('routines-list-loading', true)

  useEffect(() => {
    void loadDataSources()
  }, [loadDataSources])

  const loadRoutines = useCallback(() => {
    getRoutinesRequest({
      onSuccess: setRoutines,
      onEnd: () => setLoadingRoutines(false),
    })
  }, [getRoutinesRequest, setLoadingRoutines, setRoutines])

  useEffect(() => {
    loadRoutines()
  }, [loadRoutines])

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
              content: <Stack>{routine.name}</Stack>, //TODO: routine panel
            }))
          : [
              {
                value: -1,
                label: <FindInPageRounded />,
                content: (
                  <ViewTransition>
                    <Stack alignItems="center" py="4rem">
                      <Grow in>
                        <Typography variant="h5">No routines found</Typography>
                      </Grow>
                    </Stack>
                  </ViewTransition>
                ),
                tabComponentProps: { disabled: true },
              },
            ],
    [loadingRoutines, routines],
  )

  const handleAdd = useCallback(() => {
    siteDrawerRef.current?.open()
  }, [])

  const handleRoutineAdded = useCallback(() => {
    siteDrawerRef.current?.close()
    loadRoutines()
  }, [loadRoutines])

  if (doNotRender) {
    return null
  }

  return (
    <DataSourcesContext.Provider value={dataSources ?? emptyArray}>
      <CustomDrawer
        ref={siteDrawerRef}
        title={
          <Stack direction="row" alignItems="center" gap="0.5rem">
            <Box>Create routine</Box>
            <TermInfo term="Routine" />
          </Stack>
        }
      >
        <RoutineForm onSuccess={handleRoutineAdded} />
      </CustomDrawer>
      <TabsView
        name="routines"
        tabs={tabs}
        onAdd={handleAdd}
        addTooltip="Add routine"
        tabsProps={{ scrollButtons: tabsReady ? 'auto' : false, sx: { flexGrow: 1 } }}
        onTabsEntryAnimationStarted={() => setTabsReady(false)}
        onTabsEntryAnimationFinished={() => setTabsReady(true)}
      />
    </DataSourcesContext.Provider>
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

const emptyArray = [] as never[]
