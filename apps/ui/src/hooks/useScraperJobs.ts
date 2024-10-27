import type { ScraperJob } from '@web-scraper/common'
import { useCallback, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { useApiRequest } from './useApiRequest'
import { usePaginatedApiRequest } from './usePaginatedApiRequest'

export function useScraperJobs() {
  const {
    data: scraperJobs,
    load,
    loading,
    clearData,
    hasMore,
  } = usePaginatedApiRequest(window.electronAPI.getScraperJobs)
  const { submit: apiDelete, submitting: deleting } = useApiRequest(
    window.electronAPI.deleteScraperJob,
  )

  const loadMore = useCallback(() => {
    load({}, [])
  }, [load])

  useEffect(() => {
    loadMore()

    return () => clearData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deleteScraperJob = useCallback(
    (scraperJobId: ScraperJob['id']) => {
      apiDelete(
        {
          onSuccess: () => {
            toast.success('Scraper job deleted')
            clearData()
            loadMore()
          },
        },
        scraperJobId,
      )
    },
    [apiDelete, clearData, loadMore],
  )

  return useMemo(
    () => ({
      scraperJobs,
      loadMore,
      loading,
      hasMore,
      deleteScraperJob,
      deleting,
    }),
    [scraperJobs, loadMore, loading, hasMore, deleteScraperJob, deleting],
  )
}
