import { useCallback, useMemo, useState } from 'react'
import { type ApiError, ErrorCode } from '@web-scrapper/common'
import { useSnackbar } from 'notistack'
import { useCancellablePromise } from './useCancellablePromise'
import { errorMessages } from '../utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyApiFunction = (...args: any[]) => Promise<ApiError | object>

export function useApiRequest<RequestFunctionType extends AnyApiFunction>(
  request: RequestFunctionType,
) {
  const cancellable = useCancellablePromise()
  const { enqueueSnackbar } = useSnackbar()

  const [submitting, setSubmitting] = useState(false)

  type DataType = Awaited<ReturnType<RequestFunctionType>> extends ApiError | infer T ? T : never

  type ConfigType = {
    onSuccess?: (data: DataType) => void
  }

  const submit = useCallback(
    (config: ConfigType, ...args: Parameters<RequestFunctionType>) => {
      setSubmitting(true)
      cancellable(request(...args))
        .then((data) => {
          setSubmitting(false)
          if ('errorCode' in data && data.errorCode !== ErrorCode.NO_ERROR) {
            enqueueSnackbar({ variant: 'error', message: errorMessages[data.errorCode] })
            return
          }
          config.onSuccess?.(data as DataType)
        })
        .catch((error) => {
          if (error) {
            console.error(error)
          } else {
            setSubmitting(false)
          }
        })
    },
    [cancellable, enqueueSnackbar, request],
  )

  return useMemo(
    () => ({
      submit,
      submitting,
    }),
    [submit, submitting],
  )
}
