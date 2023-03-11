import { ErrorCode } from '@web-scrapper/common'

export const errorMessages: { [key in ErrorCode]: string } = {
  [ErrorCode.NO_ERROR]: 'No error',
  [ErrorCode.UNKNOWN_ERROR]: 'Unknown error',
  [ErrorCode.API_ERROR]: 'API error',
  [ErrorCode.DATABASE_ERROR]: 'Database error',
}
