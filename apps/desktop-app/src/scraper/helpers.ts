import {
  cacheable,
  type ActionStep,
  type ActionStepType,
  type DataSourceItem,
  type DataSourceValueQuery,
  type TypedKeys,
  type ValueQuery,
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

export function parseScrapperStringValue(
  value: string | null | undefined,
  helpers: Partial<{ siteURL: string }> = {},
) {
  if (typeof value !== 'string') {
    return ''
  }
  return value.replace(/{{([^}]+)}}/g, (_, matchedGroup: string) => {
    //TODO: add some info/tutorial about supported special values
    const specialCode = matchedGroup.replace(/\s+/g, '').toUpperCase()
    if (specialCode === 'URL') {
      return helpers.siteURL ?? ''
    }
    const urlMatch = specialCode.match(/^URL\.(.*)/i)
    if (urlMatch) {
      try {
        const url = new URL(helpers.siteURL ?? '')
        const urlProperty = urlMatch[1].toLowerCase() as TypedKeys<URL, string>
        return url[urlProperty] ?? ''
      } catch {
        // noop
      }
    }

    if (['NOW', 'TIMESTAMP', 'CURRENT_TIMESTAMP'].includes(specialCode)) {
      return Date.now().toString()
    }

    console.warn(`Unknown special code: ${specialCode}`)
    return ''
  })
}
