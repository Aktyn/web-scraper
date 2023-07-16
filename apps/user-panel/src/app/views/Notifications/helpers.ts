import { CheckCircleRounded, InfoRounded, WarningRounded, ErrorRounded } from '@mui/icons-material'
import { type SvgIconTypeMap } from '@mui/material'
import { type OverridableComponent } from '@mui/material/OverridableComponent'
import { lightGreen, lightBlue, orange, red } from '@mui/material/colors'
import { NotificationType } from '../../modules/NotificationsModule'
import { type ColorSchema } from '../../themes/generators/generateColorizedTheme'

export const notificationsFetchChunkSize = 32
export const notificationItemHeight = 64
export const notificationsListInfiniteLoadOffset = 96

export const notificationTypeProps: {
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
