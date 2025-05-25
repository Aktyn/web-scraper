import { api, type Routes } from "@/lib/api"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export function useInfiniteGet<RoutePath extends keyof Routes>(
  route: `/${RoutePath}`,
  baseQueryParams?: Omit<
    Routes[RoutePath]["get"] extends { querystring: infer Query } ? Query : undefined,
    "page"
  >,
) {
  type ResponseType = Routes[RoutePath]["get"]["response"]
  type DataType = ResponseType extends { data: infer Data } ? Data : never
  type ItemType = DataType extends (infer Item)[] ? Item : never
  type QueryParams = Routes[RoutePath]["get"] extends { querystring: infer Query }
    ? Query
    : undefined

  const [allData, setAllData] = useState<ItemType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

  const loadPage = useCallback(
    async (page: number, isInitial = false) => {
      const setLoadingState = isInitial ? setIsLoading : setIsLoadingMore
      setLoadingState(true)

      try {
        const queryParams = { ...baseQueryParams, page } as QueryParams
        const response = await api.get<RoutePath>(route, queryParams)

        if ("data" in response && Array.isArray(response.data)) {
          const newData = response.data as ItemType[]

          if (isInitial) {
            setAllData(newData)
          } else {
            setAllData((prev) => [...prev, ...newData])
          }

          // Check if there's more data based on response
          if ("hasMore" in response) {
            setHasMore(response.hasMore as boolean)
          } else {
            // Fallback: assume no more data if we got less than expected
            const pageSize = (queryParams as Record<string, unknown>)?.pageSize || 64
            setHasMore(newData.length >= (pageSize as number))
          }

          setCurrentPage(page)
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to fetch data", {
          description: error instanceof Error ? error.message : "Unknown error",
        })
      } finally {
        setLoadingState(false)
      }
    },
    [route, baseQueryParams],
  )

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      void loadPage(currentPage + 1, false)
    }
  }, [currentPage, hasMore, isLoadingMore, loadPage])

  const refresh = useCallback(() => {
    setAllData([])
    setCurrentPage(0)
    setHasMore(true)
    void loadPage(0, true)
  }, [loadPage])

  // Initial load
  useEffect(() => {
    void loadPage(0, true)
  }, [loadPage])

  return {
    data: allData,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  }
}
