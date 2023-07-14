import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Divider, Stack } from '@mui/material'
import { useSnackbar } from 'notistack'
import { FixedSizeList, type ListOnScrollProps } from 'react-window'
import { NotificationItem } from './NotificationItem'
import {
  notificationItemHeight,
  notificationsFetchChunkSize,
  notificationsListInfiniteLoadOffset,
} from './helpers'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { AutoSizer } from '../../components/common/AutoSizer'
import { ToggleButton } from '../../components/common/button/ToggleButton'
import { useDebounce } from '../../hooks/useDebounce'
import { NotificationsModule, type NotificationData } from '../../modules/NotificationsModule'
import { errorLabels } from '../../utils'

type FiltersSchema = Partial<{
  onlyUnread: boolean
}>

export const NotificationsList = () => {
  const listRef = useRef<HTMLDivElement | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const { getNotifications } = NotificationsModule.useNotifications()

  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [cursor, setCursor] = useState<NotificationData['index'] | null>(null)
  const [filters, setFilters] = useState<FiltersSchema>({})

  const load = useDebounce(
    (internalCursor = cursor, internalFilters = filters) => {
      if (internalCursor === 0) {
        return
      }

      console.info(`Loading ${notificationsFetchChunkSize} notifications`)
      const response = getNotifications({
        count: notificationsFetchChunkSize,
        cursor: typeof internalCursor === 'number' ? { index: internalCursor } : undefined,
        filters: [
          {
            read: internalFilters.onlyUnread === true ? false : undefined,
          },
        ],
      })

      if ('errorCode' in response) {
        enqueueSnackbar({ variant: 'error', message: errorLabels[response.errorCode] })
        return
      }

      setNotifications((data) => {
        const lastDataItem = data.at(-1)
        const lastResponseDataItem = response.data.at(-1)

        if (
          !response.data.length ||
          (lastDataItem &&
            lastResponseDataItem &&
            lastDataItem.index === lastResponseDataItem.index)
        ) {
          return data
        }

        return [...data, ...response.data.reverse()]
      })
      setCursor(response.cursor?.index ?? null)
    },
    200,
    [cursor, filters, enqueueSnackbar, getNotifications],
  )

  const reload = useCallback(
    (newFilters: FiltersSchema) => {
      setNotifications([])
      setCursor(null)
      setFilters(newFilters)
      load(null, newFilters)
    },
    [load],
  )

  useEffect(() => {
    reload({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleScroll = useCallback(
    (props: ListOnScrollProps) => {
      const container = listRef.current?.parentNode as HTMLDivElement | undefined
      if (props.scrollDirection !== 'forward' || !container) {
        return
      }

      if (
        props.scrollOffset + notificationsListInfiniteLoadOffset >
        container.scrollHeight - container.getBoundingClientRect().height
      ) {
        load()
      }
    },
    [load],
  )

  const buildItemKey = useCallback((index: number, data: NotificationData[]) => {
    return data[index].index
  }, [])

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: '100%',
        gridTemplateRows: 'auto 1px 1fr',
        justifyContent: 'stretch',
      }}
    >
      <ViewTransition type={TransitionType.DEFAULT}>
        <Stack direction="row" alignItems="center" justifyContent="flex-start" p={2}>
          <ToggleButton
            active={filters.onlyUnread === true}
            onToggle={(active) => reload({ ...filters, onlyUnread: active })}
          >
            Show only unread
          </ToggleButton>
          {/* TODO: list of checkboxes for each notification type to show only selected types */}
        </Stack>
      </ViewTransition>
      <ViewTransition type={TransitionType.SCALE_X}>
        <Divider />
      </ViewTransition>
      <ViewTransition type={TransitionType.FADE}>
        <Box>
          <AutoSizer>
            {({ height }) => (
              <FixedSizeList<NotificationData[]>
                innerRef={listRef}
                itemData={notifications}
                height={height}
                width="100%"
                layout="vertical"
                itemKey={buildItemKey}
                itemSize={notificationItemHeight}
                itemCount={notifications.length}
                overscanCount={2}
                onScroll={handleScroll}
              >
                {(props) => <NotificationItem {...props} />}
              </FixedSizeList>
            )}
          </AutoSizer>
        </Box>
      </ViewTransition>
    </Box>
  )
}
