import {
  api,
  type RouteParameters,
  type Routes,
  type RoutesWithMethod,
} from "@/lib/api"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export function useInfiniteGet<RoutePath extends RoutesWithMethod<"get">>(
  route: `/${RoutePath}`,
  params?: RouteParameters<RoutePath>,
  baseQueryParams?: Omit<
    Routes[RoutePath] extends { get: { querystring: infer Query } }
      ? Query
      : undefined,
    "page"
  >,
  options?: { enabled?: boolean },
) {
  type ResponseType = Routes[RoutePath]["get"]["response"]
  type DataType = ResponseType extends { data: infer Data } ? Data : never
  type ItemType = DataType extends (infer Item)[] ? Item : never
  type QueryParams = Routes[RoutePath] extends {
    get: { querystring: infer Query }
  }
    ? Query
    : undefined

  const [allData, setAllData] = useState<ItemType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [fetchFailed, setFetchFailed] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const enabled = options?.enabled ?? true

  const stringifiedParams = params ? JSON.stringify(params) : undefined
  const stringifiedBaseQueryParams = baseQueryParams
    ? JSON.stringify(baseQueryParams)
    : undefined

  const loadPage = useCallback(
    async (page: number, isInitial = false) => {
      if (!enabled) {
        setIsLoading(false)
        setIsLoadingMore(false)
        setAllData([])
        setHasMore(false)
        return
      }
      const setLoadingState = isInitial ? setIsLoading : setIsLoadingMore
      setLoadingState(true)

      try {
        const queryParams = {
          ...(stringifiedBaseQueryParams
            ? JSON.parse(stringifiedBaseQueryParams)
            : {}),
          page,
        } as QueryParams
        const response = await api.get<RoutePath>(
          route,
          stringifiedParams && JSON.parse(stringifiedParams),
          queryParams,
        )

        setFetchFailed(false)

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
            const pageSize =
              (queryParams as Record<string, unknown>)?.pageSize || 64
            setHasMore(newData.length >= (pageSize as number))
          }

          setCurrentPage(page)
        }
      } catch (error) {
        setFetchFailed(true)

        console.error(error)
        toast.error("Failed to fetch data", {
          description: error instanceof Error ? error.message : "Unknown error",
        })
      } finally {
        setLoadingState(false)
      }
    },
    [route, stringifiedParams, stringifiedBaseQueryParams, enabled],
  )

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !fetchFailed) {
      void loadPage(currentPage + 1, false)
    }
  }, [currentPage, fetchFailed, hasMore, isLoadingMore, loadPage])

  const refresh = useCallback(() => {
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
