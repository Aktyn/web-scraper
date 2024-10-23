import type { TypedKeys } from '../../types'

import type { ActionStepErrorType } from './action'

export interface MapSiteError {
  /** Regexp pattern allowed */
  content?: string
  errorType: ActionStepErrorType
}

export function isMapSiteError(value: unknown): value is MapSiteError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'errorType' in value &&
    typeof value.errorType === 'string'
  )
}

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
