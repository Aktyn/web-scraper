import { ErrorCode, type ApiError } from '@web-scraper/common'

export const errorLabels: { [key in ErrorCode]: string } = {
  [ErrorCode.NO_ERROR]: 'No error',
  [ErrorCode.UNKNOWN_ERROR]: 'Unknown error',
  [ErrorCode.INTERNAL_ERROR]: 'Internal error',
  [ErrorCode.API_ERROR]: 'API error',
  [ErrorCode.DATABASE_ERROR]: 'Database error',
  [ErrorCode.INCORRECT_DATA]: 'Incorrect data',
  [ErrorCode.ENTRY_ALREADY_EXISTS]: 'Entry already exists',
  [ErrorCode.ACTION_CANCELLED_BY_USER]: 'Action cancelled by user',
  [ErrorCode.NOT_FOUND]: 'Not found',
  [ErrorCode.ACTION_REQUIRED_BY_PROCEDURE_NOT_FOUND]: 'Action required by procedure not found',
  [ErrorCode.SCRAPER_INIT_ERROR]: 'Scraper init error',
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
