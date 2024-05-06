import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FindInPageRounded } from '@mui/icons-material'
import { Box, Grow, Skeleton, Stack, Typography } from '@mui/material'
import type { Routine } from '@web-scraper/common'
import { RoutinePanel } from './RoutinePanel'
import { ViewTransition } from '../../components/animation/ViewTransition'
import { CustomDrawer, type CustomDrawerRef } from '../../components/common/CustomDrawer'
import { TabsView, type TabSchema, type TabsHandle } from '../../components/common/TabsView'
import { TermInfo } from '../../components/common/TermInfo'
import { RoutineForm } from '../../components/routine/RoutineForm'
import { DataSourcesContext } from '../../context/dataSourcesContext'
import { useApiRequest } from '../../hooks/useApiRequest'
import { useCancellablePromise } from '../../hooks/useCancellablePromise'
import { useDataSourcesLoader } from '../../hooks/useDataSourcesLoader'
import { usePersistentState } from '../../hooks/usePersistentState'
import type { ViewComponentProps } from '../helpers'

const RoutinesView = ({ doNotRender }: ViewComponentProps) => {
  const routineDrawerRef = useRef<CustomDrawerRef>(null)
  const tabsRef = useRef<TabsHandle<Routine['id']>>(null)
  const { submit: getRoutinesRequest } = useApiRequest(window.electronAPI.getRoutines)
  const { loadDataSources, dataSources } = useDataSourcesLoader()
  const cancellable = useCancellablePromise()

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
    return new Promise((resolve, reject) => {
      getRoutinesRequest({
        onSuccess: (routines) => {
          setRoutines(routines)
          resolve(routines)
        },
        onError: (error, { showErrorSnackbar }) => {
          reject(error)
          showErrorSnackbar()
        },
        onEnd: () => setLoadingRoutines(false),
      })
    })
  }, [getRoutinesRequest, setLoadingRoutines, setRoutines])

  useEffect(() => {
    void loadRoutines()
  }, [loadRoutines])

  const handleAdd = useCallback(() => {
    routineDrawerRef.current?.open()
  }, [])

  const handleRoutineAdded = useCallback(
    (routine: Routine) => {
      routineDrawerRef.current?.close()
      void cancellable(loadRoutines()).then(() => tabsRef.current?.changeTab(routine.id))
    },
    [cancellable, loadRoutines],
  )

  const handleRoutineDeleted = useCallback(
    (routineId: Routine['id']) => {
      const deletedRoutineIndex = routines.findIndex((routine) => routine.id === routineId)
      if (deletedRoutineIndex === -1) {
        return
      }
      if (deletedRoutineIndex < routines.length - 1) {
        tabsRef.current?.changeTab(routines[deletedRoutineIndex + 1].id)
      } else if (deletedRoutineIndex > 0) {
        tabsRef.current?.changeTab(routines[deletedRoutineIndex - 1].id)
      }

      void loadRoutines()
    },
    [loadRoutines, routines],
  )

  const tabs = useMemo<TabSchema<Routine['id']>[]>(
    () =>
      loadingRoutines
        ? Array.from({ length: 3 }, (_, i) => ({
            value: -i - 1,
            label: (
              <Box minWidth="8rem">
                <Skeleton variant="rounded" width="100%" height="1.75rem" animation="pulse" />
              </Box>
            ),
            content: null,
            tabComponentProps: { disabled: true },
          }))
        : routines.length > 0
          ? routines.map(
              (routine) =>
                ({
                  value: routine.id,
                  label: routine.name,
                  content: (
                    <RoutinePanel
                      routineInfo={routine}
                      onDeleted={handleRoutineDeleted}
                      onNameChanged={loadRoutines}
                    />
                  ),
                }) satisfies TabSchema<Routine['id']>,
            )
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
    [handleRoutineDeleted, loadRoutines, loadingRoutines, routines],
  )

  if (doNotRender) {
    return null
  }

  return (
    <DataSourcesContext.Provider value={dataSources ?? emptyArray}>
      <CustomDrawer
        ref={routineDrawerRef}
        title={
          <Stack direction="row" alignItems="center" gap="0.5rem">
            <Box>Create routine</Box>
            <TermInfo term="routine" />
          </Stack>
        }
      >
        <RoutineForm onSuccess={handleRoutineAdded} />
      </CustomDrawer>
      <TabsView
        handleRef={tabsRef}
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
}
export default RoutinesView

const emptyArray = [] as never[]
