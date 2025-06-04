import {
  api,
  type RouteParameters,
  type Routes,
  type RoutesWithMethod,
} from "@/lib/api"
import { useState } from "react"
import { toast } from "sonner"

export function usePost<RoutePath extends RoutesWithMethod<"post">>(
  route: `/${RoutePath}`,
) {
  const [isPosting, setIsPosting] = useState(false)

  const postItem = async (
    body: Routes[RoutePath]["post"]["body"],
    params?: RouteParameters<RoutePath>,
    onSuccess?: (result: Routes[RoutePath]["post"]["response"]) => void,
    onError?: (error: unknown) => void,
  ) => {
    setIsPosting(true)
    try {
      const result = await api.post<RoutePath>(route, body, params)
      if (onSuccess) {
        onSuccess(result)
      } else {
        toast.success("Request successful")
      }
      return result
    } catch (error) {
      console.error(error)
      if (onError) {
        onError(error)
      } else {
        toast.error("Request failed", {
          description: error instanceof Error ? error.message : "Unknown error",
        })
      }
      return null
    } finally {
      setIsPosting(false)
    }
  }

  return { postItem, isPosting }
}
