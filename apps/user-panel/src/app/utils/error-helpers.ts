import type { ApiError } from '@web-scraper/common'
import { ErrorCode } from '@web-scraper/common'

export const errorLabels: { [key in ErrorCode]: string } = {
  [ErrorCode.NO_ERROR]: 'No error',
  [ErrorCode.UNKNOWN_ERROR]: 'Unknown error',
  [ErrorCode.API_ERROR]: 'API error',
  [ErrorCode.DATABASE_ERROR]: 'Database error',
  [ErrorCode.INCORRECT_DATA]: 'Incorrect data',
  [ErrorCode.ENTRY_ALREADY_EXISTS]: 'Entry already exists',
  [ErrorCode.NOT_FOUND]: 'Not found',
}

export function parseError(error: ApiError['error']) {
  if (!error) {
    return null
  }
  if (error instanceof Error) {
    return error.message
  }
  return error
}
