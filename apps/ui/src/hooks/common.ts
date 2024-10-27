import type { ApiError } from '@web-scraper/common'
import type { toast } from 'sonner'

export type ApiRequestConfigType<DataType> = {
  onSuccess?: (data: DataType, extras: { toast: typeof toast }) => void
  onError?: (error: ApiError, extras: { toast: typeof toast; showErrorToast: () => void }) => void
  /** Called regardless the request succeeded or failed */
  onEnd?: () => void
}
