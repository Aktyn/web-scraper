import { memo, useEffect, useState } from 'react'
import { Box, Chip, Fade, Grow, Stack, Typography, alpha, keyframes } from '@mui/material'
import { common } from '@mui/material/colors'
import { type ListChildComponentProps } from 'react-window'
import { notificationItemHeight, notificationTypeProps } from './helpers'
import { type NotificationData } from '../../modules/NotificationsModule'
import { formatDate } from '../../utils'

const readDelay = 4000

const shrinkKeyframes = keyframes`
  from {
    transform: scaleY(1);
  }
  to {
    transform: scaleY(0);
  }
`

interface NotificationItemProps extends ListChildComponentProps<NotificationData[]> {
  setAsRead: (index: number, onFinish: () => void) => void
}

export const NotificationItem = memo<NotificationItemProps>(
  ({ index, style, data, setAsRead }) => {
    const notification = data[index]

    const [isNew, setIsNew] = useState(!notification.read)

    useEffect(() => {
      if (!isNew) {
        return
      }

      let mounted = true

      setTimeout(() => {
        if (!mounted) {
          return
        }
        setAsRead(notification.index, () => {
          if (mounted) {
            setIsNew(false)
          }
        })
      }, readDelay)

      return () => {
        mounted = false
      }
    }, [isNew, notification.index, setAsRead])

    const notificationProps = notificationTypeProps[notification.type]

    return (
      <Fade key={notification.index} in>
        <Box
          style={style}
          sx={{
            height: `${notificationItemHeight}px`,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '4px auto 1fr auto 4px',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 2,
            color: notificationProps.colorAccent[50],
            backgroundColor: isNew
              ? (theme) => alpha(theme.palette.text.primary, 0.1)
              : notification.index % 2 === 0
                ? alpha(common.white, 0.01)
                : alpha(common.black, 0.01),
            transition: (theme) => theme.transitions.create('background-color'),

            '&:not(:last-child)': {
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            },
            '&::before': {
              content: '""',
              display: 'block',
              height: '100%',
              width: '4px',
              borderRadius: '4px',
              backgroundColor: notificationProps.colorAccent[200],
            },
            '&::after': isNew
              ? {
                  content: '""',
                  display: 'block',
                  height: '100%',
                  width: '4px',
                  borderRadius: '4px',
                  backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.5),
                  animation: `${shrinkKeyframes} ${readDelay}ms ease-in forwards`,
                }
              : undefined,
          }}
        >
          {<notificationProps.icon sx={{ color: notificationProps.colorAccent[200] }} />}
          <Stack>
            <Stack direction="row" alignItems="center" justifyContent="flex-start" gap={1}>
              <Typography
                variant="body2"
                fontWeight="bold"
                whiteSpace="nowrap"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: notificationProps.colorAccent[100],
                }}
              >
                {notification.title}
              </Typography>
              <Grow in={isNew} appear={false}>
                <Chip
                  label="New"
                  sx={{ fontWeight: 'bold', color: 'text.primary' }}
                  variant="filled"
                  size="small"
                  color="default"
                />
              </Grow>
            </Stack>
            <Typography
              variant="body1"
              color="inherit"
              whiteSpace="nowrap"
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {notification.content}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {formatDate(notification.createdAt)}
          </Typography>
        </Box>
      </Fade>
    )
  },
  (prevProps, nextProps) => {
    const prevNotification = prevProps.data[prevProps.index]
    const nextNotification = nextProps.data[nextProps.index]

    return (
      prevNotification.index === nextNotification.index &&
      prevNotification.type === nextNotification.type &&
      prevNotification.read === nextNotification.read
    )
  },
)
