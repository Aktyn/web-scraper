import { type ActionStepErrorType } from './action'

export interface MapSiteError {
  /** Regexp pattern allowed */
  content?: string
  errorType: ActionStepErrorType
}
