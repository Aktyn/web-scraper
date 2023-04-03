import { useCallback, useMemo, useState } from 'react'
import { Stack, Typography } from '@mui/material'
import { type ApiError, ErrorCode } from '@web-scraper/common'
import { useSnackbar } from 'notistack'
import { useCancellablePromise } from './useCancellablePromise'
import { errorHelpers, parseError } from '../utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyApiFunction = (...args: any[]) => Promise<ApiError | object>

export function useApiRequest<RequestFunctionType extends AnyApiFunction>(
  request: RequestFunctionType,
) {
  const cancellable = useCancellablePromise()
  const { enqueueSnackbar } = useSnackbar()

  const [submitting, setSubmitting] = useState(false)
  const [data, setData] = useState<Awaited<ReturnType<RequestFunctionType>> | null>(null)

  type DataType = Awaited<ReturnType<RequestFunctionType>> extends ApiError | infer T ? T : never

  type ConfigType = {
    onSuccess?: (data: DataType, extras: { enqueueSnackbar: typeof enqueueSnackbar }) => void
    onError?: (error: ApiError, extras: { enqueueSnackbar: typeof enqueueSnackbar }) => void
  }

  const submit = useCallback(
    (config: ConfigType, ...args: Parameters<RequestFunctionType>) => {
      setSubmitting(true)
      cancellable(request(...args))
        .then((data) => {
          setData(data as never)
          setSubmitting(false)
          if ('errorCode' in data && data.errorCode !== ErrorCode.NO_ERROR) {
            if (config.onError) {
              config.onError(data, { enqueueSnackbar })
            } else {
              enqueueSnackbar({
                variant: 'error',
                message: (
                  <Stack alignItems="flex-start" gap={0}>
                    <Typography variant="body2">{errorHelpers[data.errorCode]}</Typography>
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
            }
            return
          }
          config.onSuccess?.(data as DataType, { enqueueSnackbar })
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
      data,
    }),
    [data, submit, submitting],
  )
}
