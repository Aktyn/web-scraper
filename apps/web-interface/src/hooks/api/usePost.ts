import {
  api,
  type RouteParameters,
  type Routes,
  type RoutesWithMethod,
} from "@/lib/api"
import { useState } from "react"
import type { CommonResponseOptions } from "./helpers"
import { handleErrorResponse, handleSuccessResponse } from "./helpers"

export function usePost<RoutePath extends RoutesWithMethod<"post">>(
  route: `/${RoutePath}`,
  options?: CommonResponseOptions,
) {
  const [isPosting, setIsPosting] = useState(false)

  const postItem = async (
    body: Routes[RoutePath]["post"]["body"],
    params?: RouteParameters<RoutePath>,
  ) => {
    setIsPosting(true)
    try {
      const result = await api.post<RoutePath>(route, body, params)
      handleSuccessResponse("Request successful", options)
      return result
    } catch (error) {
      handleErrorResponse(error, "Request failed", options)
      return null
    } finally {
      setIsPosting(false)
    }
  }

  return { postItem, isPosting }
}
