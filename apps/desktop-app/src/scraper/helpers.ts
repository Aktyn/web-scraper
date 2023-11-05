import {
  cacheable,
  type ActionStep,
  type ActionStepType,
  type ValueQuery,
  type DataSourceValueQuery,
  type DataSourceItem,
} from '@web-scraper/common'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Notification } from 'electron'

import { ExtendedBrowserWindow } from '../extendedBrowserWindow'

export type PerformableActionStep<Type extends ActionStepType = ActionStepType> = Omit<
  ActionStep & { type: Type },
  'id' | 'orderIndex' | 'actionId'
>

export type RequestDataCallback = (
  valueQuery: ValueQuery,
  actionStep: ActionStep,
) => Promise<string | number | null>

export type RequestDataSourceItemIdCallback = (
  dataSourceValueQuery: DataSourceValueQuery,
  actionStep: ActionStep,
) => Promise<DataSourceItem['id'] | null>

export const getFlowFinishedNotification = cacheable(() => {
  const notification = new Notification({
    title: 'Flow execution finished',
    body: 'Click here to focus Web Scraper window',
    urgency: 'normal',
  })

  notification.on('click', () => {
    const browserWindow = ExtendedBrowserWindow.getInstances().at(-1)
    if (!browserWindow) {
      return
    }
    if (browserWindow.isMinimized()) {
      browserWindow.restore()
    }
    browserWindow.focus()
  })

  return notification
})
