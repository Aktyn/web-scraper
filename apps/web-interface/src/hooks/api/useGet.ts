import { api, type Routes } from "@/lib/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function useGet<RoutePath extends keyof Routes>(route: `/${RoutePath}`) {
  type ResponseType = Routes[RoutePath]["get"]["response"]

  const [data, setData] = useState<ResponseType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    api
      .get<RoutePath>(route)
      .then((data) => setData(data))
      .catch((error) => {
        console.error(error)
        toast.error("Failed to fetch data", {
          description: error.message,
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
  }, [route])

  return { data, isLoading }
}
