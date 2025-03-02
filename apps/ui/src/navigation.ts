import type { dynamicIconImports } from 'lucide-react/dynamic'
import { Dashboard } from '~/views/dashboard'
import { About } from './views/about'
import { Notifications } from './views/notifications'
import { ScraperJobCreator } from './views/scraper-job-creator'
import { ScraperJobs } from './views/scraper-jobs'

export enum View {
  DASHBOARD,
  SCRAPER_JOBS,
  SCRAPER_JOB_CREATOR,
  NOTIFICATIONS,
  ABOUT,
}

export const NAVIGATION = [
  {
    view: View.DASHBOARD,
    label: 'Dashboard',
    iconName: 'layout-dashboard',
    component: Dashboard,
    subViews: [],
  },
  {
    view: View.SCRAPER_JOBS,
    label: 'Scraper jobs',
    iconName: 'cpu',
    component: ScraperJobs,
    subViews: [
      {
        view: View.SCRAPER_JOB_CREATOR,
        label: 'Creator',
        component: ScraperJobCreator,
      },
    ],
  },
  {
    view: View.NOTIFICATIONS,
    label: 'Notifications',
    iconName: 'bell',
    component: Notifications,
    subViews: [],
  },
  {
    view: View.ABOUT,
    label: 'About',
    iconName: 'info',
    component: About,
    subViews: [],
  },
] satisfies Array<{ [key: string]: unknown; iconName: keyof typeof dynamicIconImports }>
