import {
  type PropsWithChildren,
  createContext,
  useContext,
  useCallback,
  useRef,
  useEffect,
} from 'react'
import { type AwaitedFunction, type PaginatedApiFunction } from '@web-scraper/common'
import { noop } from '../utils'

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

const NotificationsContext = createContext({
  getNotifications: noop as unknown as AwaitedFunction<
    PaginatedApiFunction<NotificationData, 'index'>
  >,
  setAsRead: noop as (index: number, onFinish: () => void) => void,
})

function NotificationsProvider({ children }: PropsWithChildren) {
  const notificationsStore = useRef<NotificationData[]>([])
  const notificationsToReadQueue = useRef<{ index: number; onFinish: () => void }[]>([])
  const readNextNotificationTimeout = useRef<NodeJS.Timeout | null>(null)

  //TODO: remove data mocking
  useEffect(() => {
    for (let i = 0; i < 300; i++) {
      if (i === 0 && notificationsStore.current.length > 0) {
        return
      }
      notificationsStore.current.push({
        index: i,
        type: [
          NotificationType.SUCCESS,
          NotificationType.INFO,
          NotificationType.WARNING,
          NotificationType.ERROR,
        ][Math.floor(Math.random() * 4)],
        title: 'Mock notification title',
        content: 'Mock notification content',
        createdAt: new Date(),
        read: Math.random() > 0.5,
      })
    }
  }, [])

  const getNotifications = useCallback<
    AwaitedFunction<PaginatedApiFunction<NotificationData, 'index'>>
  >(({ count, cursor, filters }) => {
    const filteredNotifications = filters
      ? notificationsStore.current.filter((notification) => {
          for (const filter of filters ?? []) {
            if (filter?.read !== undefined && filter.read !== notification.read) {
              return false
            }
          }
          return true
        })
      : notificationsStore.current

    const from = cursor?.index ?? filteredNotifications.length
    const to = Math.max(from - count, 0)
    return {
      data: filteredNotifications.slice(to, from),
      cursor: {
        index: to,
      },
    }
  }, [])

  const queueNotificationToBeRead = useCallback((index: number, onFinish: () => void) => {
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
        item.onFinish()
      }, 200)
    }
    markAsRead(notificationsToReadQueue.current.shift())
  }, [])

  return (
    <NotificationsContext.Provider
      value={{
        getNotifications,
        setAsRead: queueNotificationToBeRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

function useNotifications() {
  return useContext(NotificationsContext)
}

export const NotificationsModule = {
  Provider: NotificationsProvider,
  useNotifications,
}
