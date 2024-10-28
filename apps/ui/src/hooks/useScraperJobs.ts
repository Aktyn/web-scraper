import type { ScraperJob, UpsertScraperJobSchema } from '@web-scraper/common'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useApiRequest } from './useApiRequest'
import { usePaginatedApiRequest } from './usePaginatedApiRequest'

export function useScraperJobs() {
  const {
    data: scraperJobs,
    setData: setScraperJobs,
    load,
    loading,
    clearData,
    hasMore,
  } = usePaginatedApiRequest(window.electronAPI.getScraperJobs)
  const { submit: apiDelete, submitting: deleting } = useApiRequest(
    window.electronAPI.deleteScraperJob,
  )
  const { submit: apiUpdate, submitting: editing } = useApiRequest(
    window.electronAPI.updateScraperJob,
  )

  const [deletingTarget, setDeletingTarget] = useState<ScraperJob['id'] | null>(null)
  const [editingTarget, setEditingTarget] = useState<ScraperJob['id'] | null>(null)
  const loadMore = useCallback(
    (startOver = false) => {
      load({}, [], startOver)
    },
    [load],
  )

  useEffect(() => {
    loadMore()

    return () => clearData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deleteScraperJob = useCallback(
    (scraperJobId: ScraperJob['id']) => {
      setDeletingTarget(scraperJobId)
      apiDelete(
        {
          onSuccess: () => {
            toast.success('Scraper job deleted')
            loadMore(true)
          },
        },
        scraperJobId,
      )
    },
    [apiDelete, loadMore],
  )

  const editScraperJob = useCallback(
    (scraperJobId: ScraperJob['id'], data: UpsertScraperJobSchema) => {
      setEditingTarget(scraperJobId)

      apiUpdate(
        {
          onSuccess: (scraperJob) => {
            toast.success(`Scraper job updated (${scraperJob.name})`)
            setScraperJobs((prev) =>
              prev.map((job) => (job.id === scraperJobId ? scraperJob : job)),
            )
          },
        },
        scraperJobId,
        data,
      )
    },
    [apiUpdate, setScraperJobs],
  )

  return useMemo(
    () => ({
      scraperJobs,
      loadMore,
      loading,
      hasMore,
      deleteScraperJob,
      deleting: deleting ? deletingTarget : null,
      editScraperJob,
      editing: editing ? editingTarget : null,
    }),
    [
      scraperJobs,
      loadMore,
      loading,
      hasMore,
      deleteScraperJob,
      deleting,
      deletingTarget,
      editScraperJob,
      editing,
      editingTarget,
    ],
  )
}
