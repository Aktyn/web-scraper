import { api, type RouteParameters, type Routes, type RoutesWithMethod } from "@/lib/api"
import { useState } from "react"
import { toast } from "sonner"

export function usePost<RoutePath extends RoutesWithMethod<"post">>(route: `/${RoutePath}`) {
  const [isPosting, setIsPosting] = useState(false)

  const postItem = async (
    body: Routes[RoutePath]["post"]["body"],
    params?: RouteParameters<RoutePath>,
  ) => {
    setIsPosting(true)
    try {
      const result = await api.post<RoutePath>(route, body, params)
      toast.success("Item created successfully")
      return result
    } catch (error) {
      console.error(error)
      toast.error("Failed to create item", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
      return null
    } finally {
      setIsPosting(false)
    }
  }

  return { postItem, isPosting }
}
