import { useEffect, useMemo } from 'react'
import { usePaginatedApiRequest } from './usePaginatedApiRequest'

export function useScraperJobs() {
  const {
    data: scraperJobs,
    load,
    loading,
    clearData,
  } = usePaginatedApiRequest(window.electronAPI.getScraperJobs)

  useEffect(() => {
    load({}, [])

    return () => {
      clearData()
    }
  }, [load, clearData])

  return useMemo(
    () => ({
      scraperJobs,
      loading,
    }),
    [scraperJobs, loading],
  )
}
