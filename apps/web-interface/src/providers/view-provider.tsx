import { createContext, useContext, useEffect, useState } from "react"

enum View {
  Dashboard = "dashboard",
  Scrapers = "scrapers",
  DataStores = "data-stores",
  Preferences = "preferences",
}

const ViewContext = createContext({
  view: View.Dashboard,
  setView: (_view: View) => {},
})

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState(getViewFromQueryParams())

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("view", view)
    window.history.pushState(null, "", `?${searchParams.toString()}`)

    const onPopState = () => {
      setView(getViewFromQueryParams())
    }

    const onPushState = () => {
      setView(getViewFromQueryParams())
    }

    window.addEventListener("popstate", onPopState)
    window.addEventListener("pushstate", onPushState)

    return () => {
      window.removeEventListener("popstate", onPopState)
      window.removeEventListener("pushstate", onPushState)
    }
  }, [view])

  return <ViewContext value={{ view, setView }}>{children}</ViewContext>
}

export function useView() {
  return useContext(ViewContext)
}

useView.View = View

function getViewFromQueryParams() {
  const searchParams = new URLSearchParams(window.location.search)
  const view = searchParams.get("view")
  if (view) {
    return view as View
  }
  return View.Dashboard
}
