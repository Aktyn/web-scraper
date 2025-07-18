import type {
  ApiResponse,
  UserPreferences,
  ApiPaginationQuery,
  ApiPaginatedResponse,
  UserDataStore,
  CreateUserDataStore,
  UpdateUserDataStore,
  UpsertUserDataStoreRecord,
  ScraperType,
  UpsertScraper,
  ScraperExecutionStatus,
  ScraperExecutionInfo,
  ApiErrorResponse,
  ExecutingScraperInfo,
  ExecutionIterator,
  Notification,
  ListScraperExecutionsQuery,
  NotificationQuery,
  Status,
  Routine,
  UpsertRoutine,
  ScraperQuery,
  ScheduledScraperExecution,
  ExportUserDataStore,
  ImportUserDataStore,
} from "@web-scraper/common"
import { apiErrorResponseSchema } from "@web-scraper/common"

const baseUrl = import.meta.env.VITE_API_URL_BASE.replace(/\/$/, "")

type Method = "get" | "post" | "put" | "delete" | "patch"

export type RoutesWithMethod<MethodType extends Method> = {
  [key in keyof Routes]: Routes[key] extends { [method in MethodType]: object }
    ? key
    : never
}[keyof Routes]

export type RouteParameters<RoutePath extends keyof Routes> =
  RoutePath extends `${string}/:${infer Param}/${infer Rest}`
    ? {
        [key in Param]: string | number
        //@ts-expect-error Hacky type enforcement
      } & (RouteParameters<Rest> extends object
        ? //@ts-expect-error Hacky type enforcement
          RouteParameters<Rest>
        : unknown)
    : RoutePath extends `${string}/:${infer Param}`
      ? {
          [key in Param]: string | number
        }
      : undefined

function parametrizeRoute<ParamsType extends Record<string, string | number>>(
  route: string,
  params?: ParamsType,
) {
  return route.replace(/:(\w+)/g, (_, param: keyof ParamsType) => {
    return params?.[param as keyof typeof params]?.toString() ?? ""
  })
}

export const api = {
  baseUrl,

  get: async <RoutePath extends RoutesWithMethod<"get">>(
    route: `/${RoutePath}`,
    params?: RouteParameters<RoutePath>,
    queryParams?: Routes[RoutePath] extends {
      get: { querystring: infer Query }
    }
      ? Query
      : undefined,
  ): Promise<Routes[RoutePath]["get"]["response"]> => {
    const queryString = queryParams
      ? `?${new URLSearchParams(clearUndefinedValues(queryParams)).toString()}`
      : ""

    const response = await fetch(
      `${baseUrl}${parametrizeRoute(route, params)}${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    return await assertResponseOk(response)
  },

  post: async <RoutePath extends RoutesWithMethod<"post">>(
    route: `/${RoutePath}`,
    body: Routes[RoutePath]["post"]["body"],
    params?: RouteParameters<RoutePath>,
  ): Promise<Routes[RoutePath]["post"]["response"]> => {
    const response = await fetch(
      `${baseUrl}${parametrizeRoute(route, params)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : "{}",
      },
    )
    return await assertResponseOk(response)
  },

  put: async <RoutePath extends RoutesWithMethod<"put">>(
    route: `/${RoutePath}`,
    body: Routes[RoutePath]["put"]["body"],
    params?: RouteParameters<RoutePath>,
  ): Promise<Routes[RoutePath]["put"]["response"]> => {
    const response = await fetch(
      `${baseUrl}${parametrizeRoute(route, params)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    )
    return await assertResponseOk(response)
  },

  patch: async <RoutePath extends RoutesWithMethod<"patch">>(
    route: `/${RoutePath}`,
    body: Routes[RoutePath]["patch"]["body"],
    params?: RouteParameters<RoutePath>,
  ): Promise<Routes[RoutePath]["patch"]["response"]> => {
    const response = await fetch(
      `${baseUrl}${parametrizeRoute(route, params)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    )
    return await assertResponseOk(response)
  },

  delete: async <RoutePath extends RoutesWithMethod<"delete">>(
    route: `/${RoutePath}`,
    params?: RouteParameters<RoutePath>,
  ) => {
    const response = await fetch(
      `${baseUrl}${parametrizeRoute(route, params)}`,
      {
        method: "DELETE",
      },
    )
    return response.ok ? null : await assertResponseOk(response)
  },
}

export type Routes = {
  preferences: {
    get: {
      response: ApiResponse<UserPreferences>
    }
  }
  "preferences/reset": {
    post: {
      body: null
      response: ApiResponse<UserPreferences>
    }
  }
  "preferences/:key": {
    put: {
      body: Pick<UserPreferences[number], "value">
      response: ApiResponse<UserPreferences[number]>
    }
  }

  "reset-database": {
    post: {
      body: null
      response: ApiResponse<null>
    }
  }
  "seed-database": {
    post: {
      body: null
      response: ApiResponse<null>
    }
  }

  status: {
    get: {
      response: ApiResponse<Status>
    }
  }

  "user-data-stores": {
    get: {
      querystring: Partial<ApiPaginationQuery>
      response: ApiPaginatedResponse<UserDataStore>
    }
    post: {
      body: CreateUserDataStore
      response: ApiResponse<UserDataStore>
    }
  }
  "user-data-stores/:tableName": {
    get: {
      response: ApiResponse<UserDataStore>
    }
    put: {
      body: UpdateUserDataStore
      response: ApiResponse<UserDataStore>
    }
    delete: {
      response: void
    }
  }

  "user-data-stores/:tableName/import": {
    post: {
      body: ImportUserDataStore
      response: ApiResponse<null>
    }
  }

  "user-data-stores/:tableName/export": {
    post: {
      body: ExportUserDataStore
      response: ApiResponse<null>
    }
  }

  "user-data-stores/:tableName/records": {
    get: {
      querystring: Partial<ApiPaginationQuery>
      response: ApiPaginatedResponse<Record<string, unknown>>
    }
    post: {
      body: UpsertUserDataStoreRecord
      response: ApiResponse<Record<string, unknown>>
    }
    delete: {
      response: void
    }
  }
  "user-data-stores/:tableName/records/:id": {
    put: {
      body: UpsertUserDataStoreRecord
      response: ApiResponse<Record<string, unknown>>
    }
    delete: {
      response: void
    }
  }

  scrapers: {
    get: {
      querystring: Partial<ScraperQuery>
      response: ApiPaginatedResponse<ScraperType>
    }
    post: {
      body: UpsertScraper
      response: ApiResponse<ScraperType>
    }
  }
  "scrapers/currently-executing": {
    get: {
      querystring: Partial<ApiPaginationQuery>
      response: ApiPaginatedResponse<ExecutingScraperInfo>
    }
  }
  "scrapers/:id": {
    get: {
      response: ApiResponse<ScraperType>
    }
    put: {
      body: UpsertScraper
      response: ApiResponse<ScraperType>
    }
    delete: {
      response: void
    }
  }
  "scrapers/:id/execute": {
    post: {
      body: {
        iterator: ExecutionIterator | null
      }
      response: ApiResponse<null>
    }
  }
  "scrapers/:id/execution-status": {
    get: {
      response: ApiResponse<ScraperExecutionStatus>
    }
  }
  "scrapers/:id/terminate": {
    post: {
      body: null
      response: ApiResponse<null>
    }
  }
  "scrapers/executions": {
    get: {
      querystring: Partial<ListScraperExecutionsQuery>
      response: ApiPaginatedResponse<ScraperExecutionInfo>
    }
  }
  "scrapers/import": {
    post: {
      body: null
      response: ApiResponse<ScraperType>
    }
  }
  "scrapers/:id/export": {
    post: {
      body: null
      response: ApiResponse<null>
    }
  }

  routines: {
    get: {
      querystring: Partial<ApiPaginationQuery>
      response: ApiPaginatedResponse<Routine>
    }
    post: {
      body: UpsertRoutine
      response: ApiResponse<Routine>
    }
  }
  "routines/:id": {
    get: {
      response: ApiResponse<Routine>
    }
    put: {
      body: UpsertRoutine
      response: ApiResponse<Routine>
    }
    delete: {
      response: void
    }
  }
  "routines/:id/execute": {
    post: {
      body: null
      response: ApiResponse<Routine>
    }
  }
  "routines/:id/pause": {
    post: {
      body: null
      response: ApiResponse<Routine>
    }
  }
  "routines/:id/resume": {
    post: {
      body: null
      response: ApiResponse<Routine>
    }
  }
  "routines/scheduled-executions": {
    get: {
      querystring: Partial<ApiPaginationQuery>
      response: ApiPaginatedResponse<ScheduledScraperExecution>
    }
  }

  notifications: {
    get: {
      querystring: Partial<NotificationQuery>
      response: ApiPaginatedResponse<Notification>
    }
  }
  "notifications/read-all": {
    patch: {
      body: Record<string, never>
      response: ApiResponse<null>
    }
  }
  "notifications/:id/read": {
    patch: {
      body: Record<string, never>
      response: ApiResponse<Notification>
    }
  }
  "notifications/:id": {
    delete: {
      response: void
    }
  }
}

async function assertResponseOk(response: Response) {
  if (!response.ok) {
    try {
      const error = await response.json()
      const result = apiErrorResponseSchema.safeParse(error)
      if (result.success) {
        throw new ApiError(result.data)
      } else {
        throw error
      }
    } catch {
      throw new Error(response.statusText)
    }
  }
  return response.json()
}

export class ApiError extends Error {
  public readonly code: string | undefined
  public readonly statusCode: number | undefined

  constructor(error: ApiErrorResponse) {
    super(error.message ?? error.error, { cause: error.code })
    this.code = error.code
    this.statusCode = error.statusCode
  }
}

function clearUndefinedValues<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined),
  ) as T
}
