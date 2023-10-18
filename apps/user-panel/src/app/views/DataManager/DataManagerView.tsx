import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SettingsRounded } from '@mui/icons-material'
import { Box, IconButton, Skeleton, Stack, Tooltip, Typography } from '@mui/material'
import { type DataSourceStructure } from '@web-scraper/common'
import { useSnackbar } from 'notistack'
import { DataSource } from './DataSource'
import { SiteTags } from './SiteTags'
import { Sites } from './Sites'
import { CustomDrawer, type CustomDrawerRef } from '../../components/common/CustomDrawer'
import { type TabSchema, TabsView } from '../../components/common/TabsView'
import { DataSourceForm } from '../../components/dataSource/DataSourceForm'
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
  const cancellable = useCancellablePromise()
  const { enqueueSnackbar } = useSnackbar()

  const [loadingDataSources, setLoadingDataSources] = useState(true)
  const [dataSources, setDataSources] = usePersistentState<DataSourceStructure[] | null>(
    'data-sources',
    null,
  )
  const [dataSourceToEdit, setDataSourceToEdit] = useState<DataSourceStructure | null>(null)

  const load = useCallback(() => {
    setLoadingDataSources(true)
    cancellable(window.electronAPI.getDataSources())
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
      })
      .catch((error) => {
        if (!error) {
          return
        }

        setLoadingDataSources(false)
      })
  }, [cancellable, enqueueSnackbar, setDataSources])

  useEffect(() => {
    load()
  }, [load])

  const handleDataSourceSuccess = useCallback(() => {
    load()
    dataSourceDrawerRef.current?.close()
  }, [load])

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
            <Stack key={dataSource.name} direction="row" alignItems="center" columnGap="0.5rem">
              <Stack flexGrow={1} alignItems="center" justifyContent="center">
                <Box>{dataSource.name}</Box>
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
                  <SettingsRounded />
                </IconButton>
              </Tooltip>
            </Stack>
          ),
          content: <DataSource key={dataSource.name} />,
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
  }, [dataSources, loadingDataSources])

  if (doNotRender) {
    return null
  }

  return (
    <>
      <TabsView
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
