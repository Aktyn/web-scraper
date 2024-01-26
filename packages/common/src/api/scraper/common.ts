import { type ActionStepErrorType } from './action'

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
