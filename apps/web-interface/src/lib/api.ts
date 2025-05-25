import type {
  ApiPaginatedResponse,
  ApiPaginationQuery,
  ApiResponse,
  Preferences,
  UserDataStore,
} from "@web-scraper/common"

const baseUrl = import.meta.env.VITE_API_URL_BASE.replace(/\/$/, "")

export const api = {
  get: async <RoutePath extends keyof Routes>(
    route: `/${RoutePath}`,
    queryParams?: Routes[RoutePath]["get"] extends { querystring: infer Query } ? Query : undefined,
  ): Promise<Routes[RoutePath]["get"]["response"]> => {
    const queryString = queryParams ? `?${new URLSearchParams(queryParams).toString()}` : ""

    const response = await fetch(`${baseUrl}${route}${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    return response.json()
  },
}

export type Routes = {
  preferences: {
    get: {
      response: ApiResponse<Preferences>
    }
  }
  "user-data-stores": {
    get: {
      querystring: Partial<ApiPaginationQuery>
      response: ApiPaginatedResponse<UserDataStore>
    }
  }
}
