import { useCallback, useEffect, useMemo } from 'react'
import type { SiteProcedures } from '@web-scraper/common'
import { useApiRequest } from './useApiRequest'
import { usePersistentState } from './usePersistentState'

export function useProceduresGroupedBySite(initialLoad = false) {
  const { submit: getGroupedProceduresRequest } = useApiRequest(
    window.electronAPI.getProceduresGroupedBySite,
  )
  const [loadingGroupedProcedures, setLoadingGroupedProcedures] = usePersistentState(
    'loading-procedures-grouped-by-site',
    true,
  )

  const [groupedSiteProcedures, setGroupedSiteProcedures] = usePersistentState<SiteProcedures[]>(
    'procedures-grouped-by-site',
    [],
  )

  const loadGroupedProcedures = useCallback(() => {
    getGroupedProceduresRequest({
      onSuccess: setGroupedSiteProcedures,
      onEnd: () => setLoadingGroupedProcedures(false),
    })
  }, [getGroupedProceduresRequest, setLoadingGroupedProcedures, setGroupedSiteProcedures])

  useEffect(() => {
    if (initialLoad) {
      loadGroupedProcedures()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadGroupedProcedures])

  return useMemo(
    () => ({
      loadGroupedProcedures,
      loadingGroupedProcedures,
      groupedSiteProcedures,
    }),
    [groupedSiteProcedures, loadGroupedProcedures, loadingGroupedProcedures],
  )
}
