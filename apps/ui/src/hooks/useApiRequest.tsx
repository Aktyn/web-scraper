import { ErrorCode, isApiError, type ApiError } from '@web-scraper/common'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ApiErrorToastMessage } from '~/components/toast/api-error-toast-message'
import type { ApiRequestConfigType } from './common'
import { useCancellablePromise } from './useCancellablePromise'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyApiFunction = (...args: any[]) => Promise<ApiError | object>

export function useApiRequest<RequestFunctionType extends AnyApiFunction>(
  request: RequestFunctionType,
) {
  const cancellable = useCancellablePromise()

  const [submitting, setSubmitting] = useState(false)
  const [submittingData, setSubmittingData] = useState<Parameters<RequestFunctionType> | null>(null)
  const [data, setData] = useState<Awaited<ReturnType<RequestFunctionType>> | null>(null)

  type DataType = Awaited<ReturnType<RequestFunctionType>> extends ApiError | infer T ? T : never

  const submit = useCallback(
    (config: ApiRequestConfigType<DataType>, ...args: Parameters<RequestFunctionType>) => {
      setSubmitting(true)
      setSubmittingData(args)

      cancellable(request(...args))
        .then((data) => {
          setData(data as never)
          setSubmitting(false)
          setSubmittingData(null)
          if (isApiError(data) && data.errorCode !== ErrorCode.NO_ERROR) {
            const showErrorToast = () => toast.error(<ApiErrorToastMessage data={data} />)

            if (config.onError) {
              config.onError(data, { toast, showErrorToast })
            } else {
              showErrorToast()
            }
            config.onEnd?.()
            return
          }

          config.onSuccess?.(data as DataType, { toast })
          config.onEnd?.()
        })
        .catch((error) => {
          if (!error) {
            return
          }
          console.error(error)
          setSubmitting(false)
          setSubmittingData(null)
        })
    },
    [cancellable, request],
  )

  return useMemo(
    () => ({
      submit,
      submitting,
      submittingData,
      data,
    }),
    [data, submit, submitting, submittingData],
  )
}
