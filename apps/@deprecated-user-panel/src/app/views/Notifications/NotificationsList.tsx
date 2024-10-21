import { type MutableRefObject, memo, useCallback, useEffect, useRef, useState } from 'react'
import { RefreshRounded, SelectAllRounded } from '@mui/icons-material'
import { Box, Button, Divider, Grow, Stack, Tooltip, Typography, alpha } from '@mui/material'
import { useSnackbar } from 'notistack'
import { FixedSizeList, type ListOnScrollProps } from 'react-window'
import { NotificationItem } from './NotificationItem'
import {
  notificationItemHeight,
  notificationTypeProps,
  notificationsFetchChunkSize,
  notificationsListInfiniteLoadOffset,
} from './helpers'
import { TransitionType, ViewTransition } from '../../components/animation/ViewTransition'
import { AutoSizer } from '../../components/common/AutoSizer'
import { ToggleButton } from '../../components/common/button/ToggleButton'
import { FullViewLoader } from '../../components/common/loader/FullViewLoader'
import { MultiSelect, type OptionSchema } from '../../components/common/select/MultiSelect'
import { ApiErrorSnackbarMessage } from '../../hooks/useApiRequest'
import { useDebounce } from '../../hooks/useDebounce'
import {
  NotificationsModule,
  type NotificationData,
  NotificationType,
} from '../../modules/NotificationsModule'

type FiltersSchema = Partial<{
  onlyUnread: boolean
  types: NotificationType[]
}>

export const NotificationsList = memo(() => {
  const listRef = useRef<HTMLDivElement | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [cursor, setCursor] = useState<NotificationData['index'] | null>(null)
  const [filters, setFilters] = useState<FiltersSchema>({})
  const [loading, setLoading] = useState(true)
  const [newNotificationsWaiting, setNewNotificationsWaiting] = useState(false)

  const { getNotifications, markAllNotificationsAsRead, setAsRead, unreadNotificationsCount } =
    NotificationsModule.useNotifications(
      (newNotification) => {
        const [filteredNotification] = NotificationsModule.filterNotifications(
          [newNotification],
          parseFilters(filters),
        )
        if (!filteredNotification) {
          return
        }

        setNewNotificationsWaiting(true)
      },
      [filters],
    )

  const load = useDebounce(
    (internalCursor = cursor, internalFilters = filters) => {
      if (internalCursor === 0) {
        return
      }

      const response = getNotifications({
        count: notificationsFetchChunkSize,
        cursor: typeof internalCursor === 'number' ? { index: internalCursor } : undefined,
        filters: parseFilters(internalFilters),
      })

      setLoading(false)
      setNewNotificationsWaiting(false)

      if ('errorCode' in response) {
        enqueueSnackbar({ variant: 'error', message: <ApiErrorSnackbarMessage data={response} /> })
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

        return [...data, ...[...response.data].reverse()]
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
      <ViewTransition
        type={TransitionType.DEFAULT}
        targets={(element) => element.querySelectorAll(':scope > *')}
      >
        <Stack
          direction="row"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="flex-start"
          p={2}
          gap={2}
        >
          <ToggleButton
            active={filters.onlyUnread === true}
            onToggle={(active) => reload({ ...filters, onlyUnread: active })}
          >
            Show only unread
          </ToggleButton>
          <MultiSelect
            options={typeOptions}
            selectedValues={filters.types ?? []}
            onChange={(types) => reload({ ...filters, types: types.length ? types : undefined })}
          />
          <Button
            onClick={() => {
              markAllNotificationsAsRead()
              reload(filters)
            }}
            endIcon={<SelectAllRounded />}
            disabled={!unreadNotificationsCount}
          >
            Mark all as read
          </Button>
          <Grow in={newNotificationsWaiting}>
            <Tooltip title="Refresh list to show new notifications">
              <Button
                onClick={() => reload(filters)}
                endIcon={<RefreshRounded />}
                sx={{ ml: 'auto' }}
              >
                New notifications
              </Button>
            </Tooltip>
          </Grow>
        </Stack>
      </ViewTransition>
      <ViewTransition type={TransitionType.SCALE_X}>
        <Divider />
      </ViewTransition>
      <ViewTransition type={TransitionType.FADE}>
        {notifications.length > 0 ? (
          <Box>
            <AutoSizer>
              {({ height }) => (
                <MemoizedList
                  key={height.toString()}
                  listRef={listRef}
                  height={height}
                  notifications={notifications}
                  handleScroll={handleScroll}
                  setAsRead={setAsRead}
                />
              )}
            </AutoSizer>
          </Box>
        ) : loading ? (
          <FullViewLoader />
        ) : (
          <Typography
            variant="h6"
            fontWeight="bold"
            textAlign="center"
            color="text.secondary"
            p={2}
          >
            No notifications
          </Typography>
        )}
      </ViewTransition>
    </Box>
  )
})

interface MemoizedListProps {
  listRef: MutableRefObject<HTMLDivElement | null>
  height: number
  notifications: NotificationData[]
  handleScroll: (props: ListOnScrollProps) => void
  setAsRead: (index: number, onFinish: () => void) => void
}

const MemoizedList = memo<MemoizedListProps>(
  ({ listRef, height, notifications, handleScroll, setAsRead }) => (
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
      {(props) => (
        <NotificationItem
          key={props.data[props.index].index.toString()}
          setAsRead={setAsRead}
          {...props}
        />
      )}
    </FixedSizeList>
  ),
)

function buildItemKey(index: number, data: NotificationData[]) {
  return data[index].index.toString()
}

function parseFilters(filters: FiltersSchema) {
  return [
    {
      read: filters.onlyUnread === true ? false : undefined,
      type: filters.types?.length ? { in: filters.types } : undefined,
    },
  ]
}

const TypeItem = ({ type, label }: { type: NotificationType; label: string }) => {
  const notificationProps = notificationTypeProps[type]

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      pr={0.5}
      color={notificationProps.colorAccent[100]}
    >
      <notificationProps.icon sx={{ color: notificationProps.colorAccent[200] }} />
      {label}
    </Stack>
  )
}

const typeOptions: OptionSchema<NotificationType>[] = [
  {
    value: NotificationType.SUCCESS,
    label: <TypeItem type={NotificationType.SUCCESS} label="Success" />,
    chipProps: {
      sx: {
        backgroundColor: alpha(
          notificationTypeProps[NotificationType.SUCCESS].colorAccent[100],
          0.15,
        ),
      },
    },
  },
  {
    value: NotificationType.INFO,
    label: <TypeItem type={NotificationType.INFO} label="Info" />,
    chipProps: {
      sx: {
        backgroundColor: alpha(notificationTypeProps[NotificationType.INFO].colorAccent[100], 0.15),
      },
    },
  },
  {
    value: NotificationType.WARNING,
    label: <TypeItem type={NotificationType.WARNING} label="Warning" />,
    chipProps: {
      sx: {
        backgroundColor: alpha(
          notificationTypeProps[NotificationType.WARNING].colorAccent[100],
          0.15,
        ),
      },
    },
  },
  {
    value: NotificationType.ERROR,
    label: <TypeItem type={NotificationType.ERROR} label="Error" />,
    chipProps: {
      sx: {
        backgroundColor: alpha(
          notificationTypeProps[NotificationType.ERROR].colorAccent[100],
          0.15,
        ),
      },
    },
  },
]
