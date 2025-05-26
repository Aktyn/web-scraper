import { createContext, useContext, useState } from "react"

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
  const [view, setView] = useState(View.Dashboard)

  return <ViewContext value={{ view, setView }}>{children}</ViewContext>
}

export function useView() {
  return useContext(ViewContext)
}

useView.View = View
