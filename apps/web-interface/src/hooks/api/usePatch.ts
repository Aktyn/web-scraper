import {
  api,
  type RouteParameters,
  type Routes,
  type RoutesWithMethod,
} from "@/lib/api"
import { useState } from "react"
import { toast } from "sonner"

type PatchOptions = {
  successMessage?: string | null
}

export function usePatch<RoutePath extends RoutesWithMethod<"patch">>(
  route: `/${RoutePath}`,
  options?: PatchOptions,
) {
  const [isPatching, setIsPatching] = useState(false)

  const patchItem = async (
    body: Routes[RoutePath]["patch"]["body"],
    params?: RouteParameters<RoutePath>,
  ) => {
    setIsPatching(true)
    try {
      const result = await api.patch<RoutePath>(route, body, params)
      if (options?.successMessage !== "" && options?.successMessage !== null) {
        toast.success(options?.successMessage ?? "Successfully updated")
      }
      return result
    } catch (error: unknown) {
      console.error(error)
      toast.error("Request failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
      return null
    } finally {
      setIsPatching(false)
    }
  }

  return { patchItem, isPatching }
}
