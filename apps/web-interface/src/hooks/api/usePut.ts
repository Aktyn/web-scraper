import {
  api,
  type RouteParameters,
  type Routes,
  type RoutesWithMethod,
} from "@/lib/api"
import { useState } from "react"
import { toast } from "sonner"
import { handleSuccessResponse, type CommonResponseOptions } from "./helpers"

export function usePut<RoutePath extends RoutesWithMethod<"put">>(
  route: `/${RoutePath}`,
  options?: CommonResponseOptions,
) {
  const [isPutting, setIsPutting] = useState(false)

  const putItem = async (
    body: Routes[RoutePath]["put"]["body"],
    params?: RouteParameters<RoutePath>,
  ) => {
    setIsPutting(true)
    try {
      const result = await api.put<RoutePath>(route, body, params)
      handleSuccessResponse("Request successful", options)
      return result
    } catch (error) {
      console.error(error)
      toast.error("Request failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
      return null
    } finally {
      setIsPutting(false)
    }
  }

  return { putItem, isPutting }
}
