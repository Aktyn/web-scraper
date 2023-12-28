import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AddRounded, SettingsRounded } from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  darken,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { type DataSourceStructure } from '@web-scraper/common'
import { DataSource } from './DataSource'
import { SiteTags } from './SiteTags'
import { Sites } from './Sites'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { CustomDrawer, type CustomDrawerRef } from '../../components/common/CustomDrawer'
import { SearchInput } from '../../components/common/input/SearchInput'
import { DataSourceForm, DataSourceSuccessAction } from '../../components/dataSource/DataSourceForm'
import { DataSourcesContext } from '../../context/dataSourcesContext'
import { useDataSourcesLoader } from '../../hooks/useDataSourcesLoader'
import { usePersistentState } from '../../hooks/usePersistentState'
import { commonLayoutTransitions } from '../../layout/helpers'
import type { ViewComponentProps } from '../helpers'

type ContentItemSchema<ValueType = DataManagerSubView | `DataSource.${string}`> = {
  value: ValueType
  label: ReactNode
  content: ReactNode
}

enum DataManagerSubView {
  SITES,
  SITE_TAGS,
}

const DataManagerView = ({ doNotRender }: ViewComponentProps) => {
  const dataSourceDrawerRef = useRef<CustomDrawerRef>(null)

  const { loadDataSources, dataSources, loadingDataSources, loadIndex } = useDataSourcesLoader()

  const [dataSourceToEdit, setDataSourceToEdit] = useState<DataSourceStructure | null>(null)
  const [searchValue, setSearchValue] = usePersistentState('data-manager-data-sources-search', '')
  const [selectedItem, setSelectedItem] = usePersistentState<ContentItemSchema['value']>(
    'data-manager-view-item',
    DataManagerSubView.SITES,
  )
  const [previousItem, setPreviousItem] = useState<ContentItemSchema['value']>(selectedItem)

  const selectItem = useCallback(
    (item: ContentItemSchema['value']) => {
      setSelectedItem((current) => {
        setPreviousItem(current)
        return item
      })
    },
    [setSelectedItem],
  )

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
                selectItem(`DataSource.${lastDataSource.name}`)
              } else {
                selectItem(DataManagerSubView.SITES)
              }
            }
            break
        }
      })
      dataSourceDrawerRef.current?.close()
    },
    [loadDataSources, selectItem],
  )

  const subViewItems = useMemo<ContentItemSchema<DataManagerSubView>[]>(
    () => [
      {
        value: DataManagerSubView.SITES,
        label: 'Sites',
        content: (
          <DataSourcesContext.Provider value={dataSources ?? emptyArray}>
            <Sites />
          </DataSourcesContext.Provider>
        ),
      },
      {
        value: DataManagerSubView.SITE_TAGS,
        label: 'Site tags',
        content: <SiteTags />,
      },
    ],
    [dataSources],
  )

  const dataSourceItems = useMemo<ContentItemSchema<`DataSource.${string}`>[]>(
    () =>
      (dataSources ?? []).map((dataSource) => ({
        value: `DataSource.${dataSource.name}` as const,
        label: (
          <Stack
            key={loadIndex}
            width="100%"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            columnGap="0.5rem"
          >
            {dataSource.name}
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
      })),
    [dataSources, loadIndex],
  )

  const items = useMemo(
    () => [...subViewItems, ...dataSourceItems],
    [dataSourceItems, subViewItems],
  )

  const itemIndex = items.findIndex((item) => item.value === selectedItem)

  if (doNotRender) {
    return null
  }

  const filteredDataSourceItem = dataSourceItems.filter((item) =>
    item.value.substring('DataSource.'.length).toLowerCase().includes(searchValue.trim()),
  )

  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
          maxHeight: '100%',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          justifyContent: 'flex-start',
        }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          {items.map((item, index) => (
            <Box
              key={item.value}
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                transform: `translateX(${
                  index === itemIndex ? 0 : index > itemIndex ? 100 : index < itemIndex ? -100 : 0
                }%)`,
                opacity: selectedItem === item.value ? 1 : 0,
                transition: (theme) => theme.transitions.create(['transform', 'opacity']),
              }}
            >
              {selectedItem === item.value || previousItem === item.value ? item.content : null}
            </Box>
          ))}
        </Box>
        <ViewTransition type={TransitionType.MOVE_RIGHT}>
          <Stack
            justifyContent="flex-start"
            overflow="hidden"
            sx={{
              backgroundColor: (theme) => darken(theme.palette.background.default, 0.15),
              transition: commonLayoutTransitions.backgroundColor,
              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack p="1rem">
              <Button
                endIcon={<AddRounded />}
                onClick={() => {
                  setDataSourceToEdit(null)
                  dataSourceDrawerRef.current?.open()
                }}
              >
                Add data source
              </Button>
            </Stack>
            <Divider sx={{ borderWidth: '1.5px' }} />
            <Stack>
              {subViewItems.map((item) => (
                <ContentItem
                  key={item.value}
                  item={item}
                  selected={selectedItem === item.value}
                  onSelect={selectItem}
                />
              ))}
            </Stack>
            <Divider />
            <Stack px="1rem" py="0.5rem" rowGap="0.5rem">
              <Typography variant="body2" color="text.primary" fontWeight="bold">
                Data sources
              </Typography>
              <SearchInput size="small" value={searchValue} onChange={setSearchValue} />
            </Stack>
            <Stack flexGrow={1} overflow="auto">
              {filteredDataSourceItem.map((item) => (
                <ContentItem
                  key={item.value}
                  item={item}
                  selected={selectedItem === item.value}
                  onSelect={selectItem}
                />
              ))}
              {loadingDataSources &&
                Array.from({ length: 3 }).map((_, index) => (
                  <Box key={index} p="0.5rem">
                    <Skeleton variant="rounded" width="100%" height="2rem" animation="pulse" />
                  </Box>
                ))}
            </Stack>
          </Stack>
        </ViewTransition>
      </Box>
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

interface ContentItemProps {
  item: ContentItemSchema
  selected: boolean
  onSelect: (item: ContentItemSchema['value']) => void
}

const ContentItem = ({ item, selected, onSelect }: ContentItemProps) => {
  return (
    <Button
      key={item.value}
      variant="text"
      disableRipple={selected}
      disableFocusRipple={selected}
      disableTouchRipple={selected}
      onClick={() => onSelect(item.value)}
      sx={{
        height: '3rem',
        justifyContent: 'flex-start',
        borderRadius: 0,
        px: '1rem',
        cursor: selected ? 'default' : undefined,
        color: (theme) => (selected ? `${theme.palette.text.primary} !important` : undefined),
        '&, &:hover': {
          backgroundColor: (theme) =>
            selected ? alpha(theme.palette.text.primary, 0.16) : undefined,
        },
        transition: (theme) => theme.transitions.create('background-color'),
        textTransform: 'initial',
      }}
    >
      {item.label}
    </Button>
  )
}

const emptyArray = [] as never[]
