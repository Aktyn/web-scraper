/* eslint-disable react-refresh/only-export-components */
import type { AwaitedFunction, DataFilter, PaginatedApiFunction } from '@web-scraper/common'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Context,
  type DependencyList,
  type PropsWithChildren,
} from 'react'
import { noop } from '~/lib/utils'

export enum NotificationType {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface NotificationData {
  index: number
  type: NotificationType
  title: string
  content: string
  createdAt: Date
  read: boolean
}

type NewNotificationListener = (
  newNotification: NotificationData,
  allNotifications: NotificationData[],
) => void

const NotificationsContext = createContext({
  pushNotification: noop as (data: Pick<NotificationData, 'type' | 'title' | 'content'>) => void,
  queueNotificationToBeRead: noop as (index: number, onFinish: () => void) => void,
  markAllNotificationsAsRead: noop as () => void,
  getNotifications: noop as unknown as AwaitedFunction<
    PaginatedApiFunction<NotificationData, 'index'>
  >,
  registerNewNotificationsListener: noop as (listener: NewNotificationListener) => void,
  unregisterNewNotificationsListener: noop as (listener: NewNotificationListener) => void,

  unreadNotificationsCount: 0,
})

type NotificationsContextType = typeof NotificationsContext extends Context<infer T> ? T : never

function NotificationsProvider({ children }: PropsWithChildren) {
  const notificationsStore = useRef<NotificationData[]>([])
  const notificationsToReadQueue = useRef<{ index: number; onFinish: () => void }[]>([])
  const readNextNotificationTimeout = useRef<NodeJS.Timeout | null>(null)
  const newNotificationsListeners = useRef(new Set<NewNotificationListener>())

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  // Mocked data - uncomment for testing
  // useEffect(() => {
  //   for (let i = 0; i < 300; i++) {
  //     if (i === 0 && notificationsStore.current.length > 0) {
  //       return
  //     }
  //     notificationsStore.current.push({
  //       index: i,
  //       type: [
  //         NotificationType.SUCCESS,
  //         NotificationType.INFO,
  //         NotificationType.WARNING,
  //         NotificationType.ERROR,
  //       ][Math.floor(Math.random() * 4)],
  //       title: 'Mock notification title',
  //       content: 'Mock notification content',
  //       createdAt: new Date(),
  //       read: Math.random() > 0.5,
  //     })
  //   }
  // }, [])

  const pushNotification = useCallback<NotificationsContextType['pushNotification']>((data) => {
    setUnreadNotificationsCount((count) => count + 1)

    const newNotification: NotificationData = {
      ...data,
      index: notificationsStore.current.length,
      createdAt: new Date(),
      read: false,
    }
    notificationsStore.current.push(newNotification)

    newNotificationsListeners.current.forEach((listener) =>
      listener(newNotification, notificationsStore.current),
    )
  }, [])

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const newNotification: NotificationData = {
  //       index: notificationsStore.current.length,
  //       type: [
  //         NotificationType.SUCCESS,
  //         NotificationType.INFO,
  //         NotificationType.WARNING,
  //         NotificationType.ERROR,
  //       ][Math.floor(Math.random() * 4)],
  //       title: 'Mock notification title',
  //       content: 'Mock notification content',
  //       createdAt: new Date(),
  //       read: false,
  //     }

  //     console.log('pushing mock notification', newNotification)
  //     pushNotification(newNotification)
  //   }, 1000)
  //   return () => clearInterval(interval)
  // }, [pushNotification])

  const registerNewNotificationsListener = useCallback<
    NotificationsContextType['registerNewNotificationsListener']
  >((listener) => {
    newNotificationsListeners.current.add(listener)
  }, [])

  const unregisterNewNotificationsListener = useCallback<
    NotificationsContextType['unregisterNewNotificationsListener']
  >((listener) => {
    newNotificationsListeners.current.delete(listener)
  }, [])

  const getNotifications = useCallback<NotificationsContextType['getNotifications']>(
    ({ count, cursor, filters }) => {
      const filteredNotifications = Array.isArray(filters)
        ? filterNotifications(notificationsStore.current, filters)
        : notificationsStore.current

      const from = cursor?.index ?? filteredNotifications.length
      const to = Math.max(from - count, 0)
      return {
        data: filteredNotifications.slice(to, from),
        cursor: {
          index: to,
        },
      }
    },
    [],
  )

  const queueNotificationToBeRead = useCallback<
    NotificationsContextType['queueNotificationToBeRead']
  >((index, onFinish) => {
    notificationsToReadQueue.current.push({ index, onFinish })
    if (readNextNotificationTimeout.current !== null) {
      return
    }

    const markAsRead = (item?: { index: number; onFinish: () => void }) => {
      if (!item) {
        return
      }
      readNextNotificationTimeout.current = setTimeout(() => {
        readNextNotificationTimeout.current = null
        markAsRead(notificationsToReadQueue.current.shift())

        notificationsStore.current[item.index].read = true
        setUnreadNotificationsCount((count) => Math.max(0, count - 1))
        item.onFinish()
      }, 200)
    }
    markAsRead(notificationsToReadQueue.current.shift())
  }, [])

  const markAllNotificationsAsRead = useCallback<
    NotificationsContextType['markAllNotificationsAsRead']
  >(() => {
    notificationsStore.current.forEach((notification) => {
      notification.read = true
    })
    setUnreadNotificationsCount(0)
  }, [])

  return (
    <NotificationsContext.Provider
      value={{
        pushNotification,
        queueNotificationToBeRead,
        markAllNotificationsAsRead,
        getNotifications,
        registerNewNotificationsListener,
        unregisterNewNotificationsListener,
        unreadNotificationsCount,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

function useNotifications(
  newNotificationsListener?: NewNotificationListener,
  deps: DependencyList = [],
) {
  const context = useContext(NotificationsContext)

  useEffect(() => {
    if (!newNotificationsListener) {
      return
    }

    context.registerNewNotificationsListener(newNotificationsListener)
    return () => {
      context.unregisterNewNotificationsListener(newNotificationsListener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, newNotificationsListener, ...deps])

  return useMemo(
    () => ({
      pushNotification: context.pushNotification,
      setAsRead: context.queueNotificationToBeRead,
      markAllNotificationsAsRead: context.markAllNotificationsAsRead,
      getNotifications: context.getNotifications,

      unreadNotificationsCount: context.unreadNotificationsCount,
    }),
    [
      context.getNotifications,
      context.markAllNotificationsAsRead,
      context.pushNotification,
      context.queueNotificationToBeRead,
      context.unreadNotificationsCount,
    ],
  )
}

const filterNotifications = (
  notifications: NotificationData[],
  filters: DataFilter<NotificationData>[],
) => {
  return notifications.filter((notification) => {
    for (const filter of filters) {
      if (filter.read !== undefined && filter.read !== notification.read) {
        return false
      }
      if (
        filter.type &&
        typeof filter.type === 'object' &&
        Array.isArray(filter.type.in) &&
        !filter.type.in.includes(notification.type)
      ) {
        return false
      }
    }
    return true
  })
}

export const NotificationsModule = {
  Provider: NotificationsProvider,
  useNotifications,
  filterNotifications,
}
