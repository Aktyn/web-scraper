import { useCallback, useMemo, useState } from 'react'
import { type DataSourceStructure } from '@web-scraper/common'
import { useSnackbar } from 'notistack'
import { ApiErrorSnackbarMessage } from './useApiRequest'
import { useCancellablePromise } from './useCancellablePromise'
import { usePersistentState } from './usePersistentState'

export function useDataSourcesLoader() {
  const cancellable = useCancellablePromise()
  const { enqueueSnackbar } = useSnackbar()

  const [loadingDataSources, setLoadingDataSources] = useState(true)
  const [dataSources, setDataSources] = usePersistentState<DataSourceStructure[] | null>(
    'data-sources',
    null,
  )
  const [loadIndex, setLoadIndex] = useState(0)

  const loadDataSources = useCallback(() => {
    setLoadingDataSources(true)
    return cancellable(window.electronAPI.getDataSources())
      .then((data) => {
        if ('errorCode' in data) {
          enqueueSnackbar({
            variant: 'error',
            message: <ApiErrorSnackbarMessage data={data} />,
          })
          return
        }

        setLoadingDataSources(false)
        setDataSources(data)
        setLoadIndex((prev) => prev + 1)

        return data
      })
      .catch((error) => {
        if (error) {
          enqueueSnackbar({
            variant: 'error',
            message: error instanceof Error ? error.message : String(error),
          })
        } else {
          setLoadingDataSources(false)
        }
      })
  }, [cancellable, enqueueSnackbar, setDataSources])

  return useMemo(
    () => ({ loadDataSources, loadingDataSources, dataSources, loadIndex }),
    [dataSources, loadDataSources, loadIndex, loadingDataSources],
  )
}
