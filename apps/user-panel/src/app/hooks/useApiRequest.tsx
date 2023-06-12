import { useCallback, useMemo, useState } from 'react'
import { Stack, Typography } from '@mui/material'
import { ErrorCode, type ApiError } from '@web-scraper/common'
import { useSnackbar } from 'notistack'
import { useCancellablePromise } from './useCancellablePromise'
import { errorLabels, parseError } from '../utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyApiFunction = (...args: any[]) => Promise<ApiError | object>

export function useApiRequest<RequestFunctionType extends AnyApiFunction>(
  request: RequestFunctionType,
) {
  const cancellable = useCancellablePromise()
  const { enqueueSnackbar } = useSnackbar()

  const [submitting, setSubmitting] = useState(false)
  const [submittingData, setSubmittingData] = useState<Parameters<RequestFunctionType> | null>(null)
  const [data, setData] = useState<Awaited<ReturnType<RequestFunctionType>> | null>(null)

  type DataType = Awaited<ReturnType<RequestFunctionType>> extends ApiError | infer T ? T : never

  type ConfigType = {
    onSuccess?: (data: DataType, extras: { enqueueSnackbar: typeof enqueueSnackbar }) => void
    onError?: (
      error: ApiError,
      extras: { enqueueSnackbar: typeof enqueueSnackbar; showErrorSnackbar: () => void },
    ) => void
    /** Called regardless the request succeeded or failed */
    onEnd?: () => void
  }

  const submit = useCallback(
    (config: ConfigType, ...args: Parameters<RequestFunctionType>) => {
      setSubmitting(true)
      setSubmittingData(args)

      cancellable(request(...args))
        .then((data) => {
          setData(data as never)
          setSubmitting(false)
          setSubmittingData(null)
          if ('errorCode' in data && data.errorCode !== ErrorCode.NO_ERROR) {
            const showErrorSnackbar = () =>
              enqueueSnackbar({
                variant: 'error',
                message: (
                  <Stack alignItems="flex-start" gap={0}>
                    <Typography variant="body2">{errorLabels[data.errorCode]}</Typography>
                    {data.error && (
                      <Typography
                        variant="caption"
                        sx={{
                          maxWidth: '16rem',
                          maxHeight: '8rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        ({parseError(data.error)})
                      </Typography>
                    )}
                  </Stack>
                ),
              })

            if (config.onError) {
              config.onError(data, { enqueueSnackbar, showErrorSnackbar })
            } else {
              showErrorSnackbar()
            }
            config.onEnd?.()
            return
          }

          config.onSuccess?.(data as DataType, { enqueueSnackbar })
          config.onEnd?.()
        })
        .catch((error) => {
          if (error) {
            console.error(error)
          } else {
            setSubmitting(false)
            setSubmittingData(null)
          }
        })
    },
    [cancellable, enqueueSnackbar, request],
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
