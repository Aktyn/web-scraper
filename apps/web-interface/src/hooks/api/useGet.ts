import {
  api,
  type RouteParameters,
  type Routes,
  type RoutesWithMethod,
} from "@/lib/api"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { useMounted } from "../useMounted"

export function useGet<RoutePath extends RoutesWithMethod<"get">>(
  route: `/${RoutePath}` | null,
  params?: RouteParameters<RoutePath>,
  queryParams?: Routes[RoutePath] extends { get: { querystring: infer Query } }
    ? Query
    : undefined,
) {
  type ResponseType = Routes[RoutePath]["get"]["response"]

  const mounted = useMounted()

  const [data, setData] = useState<ResponseType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const stringifiedParams = params && JSON.stringify(params)
  const stringifiedQueryParams = queryParams && JSON.stringify(queryParams)

  const fetch = useCallback(() => {
    if (!route) {
      setIsLoading(false)
      return
    } else {
      setIsLoading(true)
    }

    const restoredParams = stringifiedParams
      ? (JSON.parse(stringifiedParams) as RouteParameters<RoutePath>)
      : undefined
    const restoredQueryParams = stringifiedQueryParams
      ? (JSON.parse(stringifiedQueryParams) as typeof queryParams)
      : undefined

    api
      .get<RoutePath>(route, restoredParams, restoredQueryParams)
      .then((data) => setData(data))
      .catch((error) => {
        console.error(error)
        toast.error("Failed to fetch data", {
          description: error instanceof Error ? error.message : "Unknown error",
        })
      })
      .finally(() => {
        if (mounted.current) {
          setIsLoading(false)
        }
      })
  }, [mounted, route, stringifiedParams, stringifiedQueryParams])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, isLoading, refetch: fetch }
}
