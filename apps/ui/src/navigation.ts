import { mdiBell, mdiChip, mdiInformation, mdiViewDashboard } from '@mdi/js'
import { Dashboard } from '~/views/dashboard'
import { About } from './views/about'
import { Instructions } from './views/instructions'
import { Notifications } from './views/notifications'

export enum View {
  DASHBOARD,
  INSTRUCTIONS,
  NOTIFICATIONS,
  ABOUT,
}

export const Navigation = [
  { view: View.DASHBOARD, label: 'Dashboard', svgPath: mdiViewDashboard, component: Dashboard },
  { view: View.INSTRUCTIONS, label: 'Instructions', svgPath: mdiChip, component: Instructions },
  { view: View.NOTIFICATIONS, label: 'Notifications', svgPath: mdiBell, component: Notifications },
  { view: View.ABOUT, label: 'About', svgPath: mdiInformation, component: About },
]
