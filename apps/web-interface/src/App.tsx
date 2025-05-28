import { useEffect, useState } from "react"
import { Sidebar } from "./components/layout/sidebar"
import { Toaster } from "./components/shadcn/sonner"
import { TooltipProvider } from "./components/shadcn/tooltip"
import { Dashboard } from "./components/view/dashboard"
import { DataStores } from "./components/view/data-stores"
import { Preferences } from "./components/view/preferences"
import { Scrapers } from "./components/view/scrapers"
import { cn } from "./lib/utils"
import { useView, ViewProvider } from "./providers/view-provider"
import { PinnedDataStoresProvider } from "./providers/pinned-data-stores-provider"

export default function App() {
  return (
    <ViewProvider>
      <PinnedDataStoresProvider>
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Sidebar />
          <Main />
          <Toaster
            position="top-center"
            duration={10_000}
            visibleToasts={16}
            expand
            richColors
            style={{}}
            swipeDirections={["top", "bottom"]}
            toastOptions={{
              className: "backdrop-blur-sm shadow-md!",
              classNames: {
                title: "font-semibold! text-sm!",
                description: "font-normal text-sm",
                success: "border-success! text-success-foreground! bg-success/40!",
                error: "border-destructive! text-destructive-foreground! bg-destructive/40!",
                warning: "border-warning! text-warning-foreground! bg-warning/40!",
                info: "border-info! text-info-foreground! bg-info/40!",
              },
            }}
          />
        </TooltipProvider>
      </PinnedDataStoresProvider>
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
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center",
              view !== currentView && "pointer-events-none overflow-hidden",
            )}
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
  [useView.View.Scrapers]: Scrapers,
  [useView.View.DataStores]: DataStores,
  [useView.View.Preferences]: Preferences,
}
