import { api, type RouteParameters, type RoutesWithMethod } from "@/lib/api"
import { useState } from "react"
import { toast } from "sonner"

export function useDelete<RoutePath extends RoutesWithMethod<"delete">>(
  route: `/${RoutePath}`,
) {
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteItem = async (params?: RouteParameters<RoutePath>) => {
    setIsDeleting(true)
    try {
      await api.delete<RoutePath>(route, params)
      toast.success("Item deleted successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete item", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
      return false
    } finally {
      setIsDeleting(false)
    }
    return true
  }

  return { deleteItem, isDeleting }
}
