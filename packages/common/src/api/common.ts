import type { ErrorCode } from '../error'

export interface ApiError {
  errorCode: ErrorCode
}

export type PaginatedApiResponse<DataType> =
  | ApiError
  | {
      data: DataType[]
    }

export type ApiResponse<DataType> =
  | ApiError
  | {
      data: DataType
    }
