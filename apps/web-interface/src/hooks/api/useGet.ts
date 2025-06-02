import {
  api,
  type RouteParameters,
  type Routes,
  type RoutesWithMethod,
} from "@/lib/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function useGet<RoutePath extends RoutesWithMethod<"get">>(
  route: `/${RoutePath}`,
  params?: RouteParameters<RoutePath>,
  queryParams?: Routes[RoutePath] extends { get: { querystring: infer Query } }
    ? Query
    : undefined,
) {
  type ResponseType = Routes[RoutePath]["get"]["response"]

  const [data, setData] = useState<ResponseType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    api
      .get<RoutePath>(route, params, queryParams)
      .then((data) => setData(data))
      .catch((error) => {
        console.error(error)
        toast.error("Failed to fetch data", {
          description: error instanceof Error ? error.message : "Unknown error",
        })
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [route, params, queryParams])

  return { data, isLoading }
}
