import {
  type DataFilter,
  ErrorCode,
  isApiError,
  type PaginatedApiFunction,
} from '@web-scraper/common'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ApiErrorToastMessage } from '~/components/toast/api-error-toast-message'
import { Config } from '~/config'
import type { ApiRequestConfigType } from './common'
import { useCancellablePromise } from './useCancellablePromise'

export function usePaginatedApiRequest<
  DataType,
  IdProperty extends keyof DataType,
  OmitInFilters extends keyof DataType = never,
>(request: PaginatedApiFunction<DataType, IdProperty, OmitInFilters>) {
  const cancellable = useCancellablePromise()

  const [data, setData] = useState<DataType[]>([])
  const [loading, setLoading] = useState(false)
  const [cursor, setCursor] = useState<
    | {
        [key in IdProperty]: DataType[IdProperty]
      }
    | undefined
  >(undefined)
  const load = useCallback(
    (
      config: ApiRequestConfigType<DataType>,
      filters?: DataFilter<Omit<DataType, OmitInFilters>>[] | string,
    ) => {
      setLoading(true)

      cancellable(
        request({
          count: Config.PAGINATION_PAGE_SIZE,
          cursor,
          filters,
        }),
      )
        .then((response) => {
          if (isApiError(response)) {
            if (response.errorCode === ErrorCode.NO_ERROR) {
              return
            }
            const showErrorToast = () => toast.error(<ApiErrorToastMessage data={response} />)

            if (config.onError) {
              config.onError(response, { toast, showErrorToast })
            } else {
              showErrorToast()
            }
            config.onEnd?.()
            return
          }

          setCursor(response.cursor)
          setData((prev) => [...prev, ...response.data])
          setLoading(false)
        })
        .catch((error) => {
          if (error === null || error === undefined) {
            return
          }
          console.error(error)
          setLoading(false)
        })
    },
    [cancellable, cursor, request],
  )

  const clearData = useCallback(() => {
    setData([])
    setCursor(undefined)
  }, [])

  const hasMore = !!cursor

  return useMemo(
    () => ({
      data,
      load,
      clearData,
      loading,
      hasMore,
    }),
    [data, load, loading, clearData, hasMore],
  )
}
