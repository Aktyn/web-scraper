import { mdiBell, mdiChip, mdiInformation, mdiViewDashboard } from '@mdi/js'
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
    svgPath: mdiViewDashboard,
    component: Dashboard,
    subViews: [],
  },
  {
    view: View.SCRAPER_JOBS,
    label: 'Scraper jobs',
    svgPath: mdiChip,
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
    svgPath: mdiBell,
    component: Notifications,
    subViews: [],
  },
  {
    view: View.ABOUT,
    label: 'About',
    svgPath: mdiInformation,
    component: About,
    subViews: [],
  },
]
