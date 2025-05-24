import type { Preferences, UserDataStore } from "@web-scraper/common"

const baseUrl = import.meta.env.VITE_API_URL_BASE.replace(/\/$/, "")

export const api = {
  get: async <RoutePath extends keyof Routes>(
    route: `/${RoutePath}`,
  ): Promise<Routes[RoutePath]["get"]["response"]> => {
    const response = await fetch(`${baseUrl}${route}`, {
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
      response: Preferences
    }
  }
  userDataStores: {
    get: {
      response: UserDataStore[]
    }
  }
}
