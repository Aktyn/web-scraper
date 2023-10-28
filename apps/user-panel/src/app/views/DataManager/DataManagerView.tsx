import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SettingsRounded } from '@mui/icons-material'
import { Box, IconButton, Skeleton, Stack, Tooltip, Typography } from '@mui/material'
import { type DataSourceStructure } from '@web-scraper/common'
import { useSnackbar } from 'notistack'
import { DataSource } from './DataSource'
import { SiteTags } from './SiteTags'
import { Sites } from './Sites'
import { CustomDrawer, type CustomDrawerRef } from '../../components/common/CustomDrawer'
import { type TabSchema, type TabsHandle, TabsView } from '../../components/common/TabsView'
import { DataSourceForm, DataSourceSuccessAction } from '../../components/dataSource/DataSourceForm'
import { ApiErrorSnackbarMessage } from '../../hooks/useApiRequest'
import { useCancellablePromise } from '../../hooks/useCancellablePromise'
import { usePersistentState } from '../../hooks/usePersistentState'
import type { ViewComponentProps } from '../helpers'

enum DataManagerTab {
  SITES,
  SITE_TAGS,
  DATA_SOURCES_SKELETON,
}

const DataManagerView = ({ doNotRender }: ViewComponentProps) => {
  const dataSourceDrawerRef = useRef<CustomDrawerRef>(null)
  const tabsHandleRef = useRef<TabsHandle<DataManagerTab | `DataSource.${string}`>>(null)
  const cancellable = useCancellablePromise()
  const { enqueueSnackbar } = useSnackbar()

  const [loadingDataSources, setLoadingDataSources] = useState(true)
  const [dataSources, setDataSources] = usePersistentState<DataSourceStructure[] | null>(
    'data-sources',
    null,
  )
  const [loadIndex, setLoadIndex] = useState(0)
  const [dataSourceToEdit, setDataSourceToEdit] = useState<DataSourceStructure | null>(null)

  const loadDataSources = useCallback(() => {
    setLoadingDataSources(true)
    return cancellable(window.electronAPI.getDataSources())
      .then((data) => {
        if ('errorCode' in data) {
          enqueueSnackbar({
            variant: 'error',
            message: <ApiErrorSnackbarMessage data={data} />,
          })
          return
        }

        setLoadingDataSources(false)
        setDataSources(data)
        setLoadIndex((prev) => prev + 1)

        return data
      })
      .catch((error) => {
        if (error) {
          enqueueSnackbar({
            variant: 'error',
            message: error instanceof Error ? error.message : String(error),
          })
        } else {
          setLoadingDataSources(false)
        }
      })
  }, [cancellable, enqueueSnackbar, setDataSources])

  useEffect(() => {
    void loadDataSources()
  }, [loadDataSources])

  const handleDataSourceSuccess = useCallback(
    (action: DataSourceSuccessAction) => {
      void loadDataSources().then((dataSources) => {
        switch (action) {
          case DataSourceSuccessAction.DELETED:
          case DataSourceSuccessAction.CREATED:
          case DataSourceSuccessAction.UPDATED:
            {
              const lastDataSource = dataSources?.at(-1)
              if (lastDataSource) {
                tabsHandleRef.current?.changeTab(`DataSource.${lastDataSource.name}`)
              } else {
                tabsHandleRef.current?.changeTab(DataManagerTab.SITES)
              }
            }
            break
        }
      })
      dataSourceDrawerRef.current?.close()
    },
    [loadDataSources],
  )

  const tabs = useMemo(() => {
    const tabsArray: TabSchema<DataManagerTab | `DataSource.${string}`>[] = [
      {
        value: DataManagerTab.SITES,
        label: 'Sites',
        content: <Sites />,
      },
      {
        value: DataManagerTab.SITE_TAGS,
        label: 'Site tags',
        content: <SiteTags />,
      },
    ]

    if (dataSources) {
      tabsArray.push(
        ...dataSources.map((dataSource) => ({
          value: `DataSource.${dataSource.name}` as const,
          label: (
            <Stack key={loadIndex} direction="row" alignItems="center" columnGap="0.5rem">
              <Stack flexGrow={1} alignItems="center" justifyContent="center">
                <Box sx={{ textTransform: 'none' }}>{dataSource.name}</Box>
                <Stack sx={{ height: 0, overflow: 'visible' }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={200}
                    sx={{ opacity: 0.5, WebkitTextStrokeWidth: 0 }}
                  >
                    Data source
                  </Typography>
                </Stack>
              </Stack>
              <Tooltip title="Manage">
                <IconButton
                  component="div"
                  size="small"
                  color="inherit"
                  onClick={(event) => {
                    event.stopPropagation()
                    setDataSourceToEdit(dataSource)
                    dataSourceDrawerRef.current?.open()
                  }}
                >
                  <SettingsRounded fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Stack>
          ),
          content: <DataSource key={loadIndex} dataSource={dataSource} />,
          tabComponentProps: {
            sx: {
              pr: '0.5rem',
              py: 0,
            },
          },
        })),
      )
    }

    if (!dataSources && loadingDataSources) {
      tabsArray.push({
        value: DataManagerTab.DATA_SOURCES_SKELETON,
        label: <Skeleton variant="text" width="100%" animation="wave" />,
        content: null,
        tabComponentProps: {
          disabled: true,
          sx: {
            pointerEvents: 'none',
          },
        },
      })
    }

    return tabsArray
  }, [dataSources, loadIndex, loadingDataSources])

  if (doNotRender) {
    return null
  }

  return (
    <>
      <TabsView
        handleRef={tabsHandleRef}
        name="data-manager"
        tabs={tabs}
        addTooltip="Add data source"
        onAdd={() => {
          setDataSourceToEdit(null)
          dataSourceDrawerRef.current?.open()
        }}
      />
      <CustomDrawer
        ref={dataSourceDrawerRef}
        title={dataSourceToEdit ? 'Manage data source' : 'Add data source'}
      >
        <DataSourceForm
          dataSource={dataSourceToEdit ?? undefined}
          onSuccess={handleDataSourceSuccess}
        />
      </CustomDrawer>
    </>
  )
}
export default DataManagerView
