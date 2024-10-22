import { NotificationsModule } from '~/modules/notifications-module'

export function Notifications() {
  const notifications = NotificationsModule.useNotifications()

  console.log(notifications) // TODO: Implement notifications view

  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full">
      <p>Notifications</p>
    </div>
  )
}
