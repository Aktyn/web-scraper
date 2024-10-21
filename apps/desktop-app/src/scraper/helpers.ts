import {
  cacheable,
  type ActionStep,
  type ActionStepType,
  type DataSourceItem,
  type DataSourceValueQuery,
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

export const pageEvaluators = {
  getPageElementJsPath: () => {
    function getJsPathFromElement(element: HTMLElement | null) {
      const pathParts = []

      while (element) {
        let selector = element.tagName.toLowerCase()

        if (element.id) {
          selector += `#${element.id}`
        } else {
          const siblings = element.parentNode?.children ?? ([] as Element[])
          let siblingIndex = 1
          for (const sibling of htmlCollectionToIterable(siblings)) {
            if (sibling === element) {
              break
            }
            if (sibling.tagName === element.tagName) {
              siblingIndex++
            }
          }
          if (siblingIndex > 1) {
            selector += `:nth-of-type(${siblingIndex})`
          }
        }

        pathParts.unshift(selector)
        element = element.parentElement
      }

      return pathParts.slice(1).join(' > ')
    }

    class InteractiveElementSelector {
      private resolve: ((element: string | null) => void) | null = null
      private highlightedElement: Element | null = null

      private onClick = (event: MouseEvent) => {
        if (event.target && event.target instanceof HTMLElement) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          this.resolve?.(getJsPathFromElement(event.target))
          this.stop()
        } else {
          this.resolve?.(null)
        }
      }
      private onMouseMove = (event: MouseEvent) => {
        if (event.target && event.target instanceof Element) {
          this.highlightedElement?.classList.remove('highlighted')
          this.highlightedElement = event.target
          event.target.classList.add('highlighted')
        }
      }

      async getSelectedElement() {
        window.addEventListener('click', this.onClick, true)
        window.addEventListener('mousemove', this.onMouseMove)

        return new Promise<string | null>((resolve) => {
          this.resolve = resolve
        })
      }

      stop() {
        this.highlightedElement?.classList.remove('highlighted')
        window.removeEventListener('click', this.onClick, true)
        window.removeEventListener('mousemove', this.onMouseMove)
        this.resolve?.(null)
      }
    }

    if ('interactiveElementSelector' in window) {
      try {
        //@ts-expect-error dynamic window property without type
        window.interactiveElementSelector.stop()
        delete window.interactiveElementSelector
      } catch {
        // noop
      }
    }

    const ies = new InteractiveElementSelector()
    //@ts-expect-error dynamic window property without type
    window.interactiveElementSelector = ies
    return ies.getSelectedElement()
  },
  stopAndRemoveInteractiveElementSelector: () => {
    if ('interactiveElementSelector' in window) {
      try {
        //@ts-expect-error dynamic window property without type
        window.interactiveElementSelector.stop()
        delete window.interactiveElementSelector
      } catch {
        // noop
      }
    }
  },
}

function htmlCollectionToIterable(htmlCollection: HTMLCollection | Element[]) {
  if (Array.isArray(htmlCollection)) {
    return htmlCollection
  }
  return Array.from(htmlCollection)
}
