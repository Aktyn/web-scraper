import { useEffect, useState } from "react"
import { Sidebar } from "./components/layout/sidebar"
import { Toaster } from "./components/shadcn/sonner"
import { TooltipProvider } from "./components/shadcn/tooltip"
import { Dashboard } from "./components/view/dashboard"
import { Preferences } from "./components/view/preferences"
import { useView, ViewProvider } from "./providers/view-provider"

export default function App() {
  return (
    <ViewProvider>
      <TooltipProvider>
        <Sidebar />
        <Main />
        <Toaster theme="dark" invert expand richColors />
      </TooltipProvider>
    </ViewProvider>
  )
}

type View = (typeof useView.View)[keyof typeof useView.View]

function Main() {
  const { view: currentView } = useView()

  const [mountedViews, setMountedViews] = useState(new Set<View>())

  useEffect(() => {
    setMountedViews((prev) => {
      if (prev.has(currentView)) {
        return prev
      }
      return new Set(prev).add(currentView)
    })

    const cleanupTimeout = setTimeout(() => {
      setMountedViews(new Set([currentView]))
    }, 2_000)

    return () => clearTimeout(cleanupTimeout)
  }, [currentView])

  return (
    <div className="relative grow">
      {Array.from(mountedViews).map((view) => {
        const View = viewsMap[view]
        return (
          <main
            key={view}
            data-view-open={view === currentView}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <View />
          </main>
        )
      })}
    </div>
  )
}

const viewsMap = {
  [useView.View.Dashboard]: Dashboard,
  [useView.View.Preferences]: Preferences,
}
