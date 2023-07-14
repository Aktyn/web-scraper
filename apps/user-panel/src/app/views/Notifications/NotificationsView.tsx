import { NotificationsList } from './NotificationsList'
import { type ViewComponentProps } from '../helpers'

const NotificationsView = ({ doNotRender }: ViewComponentProps) => {
  if (doNotRender) {
    return null
  }

  return <NotificationsList />
}

export default NotificationsView
