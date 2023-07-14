import { useEffect, useState } from 'react'
import { CheckCircleRounded, ErrorRounded, InfoRounded, WarningRounded } from '@mui/icons-material'
import {
  Box,
  Chip,
  Stack,
  Typography,
  type SvgIconTypeMap,
  alpha,
  Grow,
  keyframes,
} from '@mui/material'
import { type OverridableComponent } from '@mui/material/OverridableComponent'
import { lightBlue, lightGreen, orange, red } from '@mui/material/colors'
import { type ListChildComponentProps } from 'react-window'
import { notificationItemHeight } from './helpers'
import {
  NotificationType,
  type NotificationData,
  NotificationsModule,
} from '../../modules/NotificationsModule'
import { type ColorSchema } from '../../themes/generators/generateColorizedTheme'
import { formatDate, genericMemo } from '../../utils'

const readDelay = 4000

const shrinkKeyframes = keyframes`
  from {
    transform: scaleY(1);
  }
  to {
    transform: scaleY(0);
  }
`

export const NotificationItem = genericMemo(
  ({ index, style, data }: ListChildComponentProps<NotificationData[]>) => {
    const { setAsRead } = NotificationsModule.useNotifications()

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
      <Box
        key={notification.index}
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
          backgroundColor: (theme) => alpha(theme.palette.text.primary, isNew ? 0.1 : 0),
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
    )
  },
)

const notificationTypeProps: {
  [key in NotificationType]: {
    icon: OverridableComponent<SvgIconTypeMap<object, 'svg'>> & {
      muiName: string
    }
    colorAccent: ColorSchema
  }
} = {
  [NotificationType.SUCCESS]: {
    icon: CheckCircleRounded,
    colorAccent: lightGreen,
  },
  [NotificationType.INFO]: {
    icon: InfoRounded,
    colorAccent: lightBlue,
  },
  [NotificationType.WARNING]: {
    icon: WarningRounded,
    colorAccent: orange,
  },
  [NotificationType.ERROR]: {
    icon: ErrorRounded,
    colorAccent: red,
  },
}
