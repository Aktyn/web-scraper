import { useEffect, useState } from "react"
import { Sidebar } from "./components/layout/sidebar"
import { Toaster } from "./components/shadcn/sonner"
import { TooltipProvider } from "./components/shadcn/tooltip"
import { Dashboard } from "./components/view/dashboard"
import { DataStores } from "./components/view/data-stores"
import { Info } from "./components/view/info"
import { Notifications } from "./components/view/notifications"
import { Preferences } from "./components/view/preferences"
import { Routines } from "./components/view/routines"
import { Scrapers } from "./components/view/scrapers"
import { cn } from "./lib/utils"
import { PinnedDataStoresProvider } from "./providers/pinned-data-stores.provider"
import { ServerEventsProvider } from "./providers/server-events.provider"
import { useView, ViewProvider } from "./providers/view.provider"

export default function App() {
  return (
    <ServerEventsProvider>
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
              style={{ zIndex: 99 }}
              swipeDirections={["top", "bottom"]}
              className="pointer-events-auto z-99"
              toastOptions={{
                className: "backdrop-blur-sm shadow-md!",
                classNames: {
                  title: "font-semibold! text-sm!",
                  description: "font-normal text-sm",
                  success:
                    "border-success! text-success-foreground-light! bg-success/40!",
                  error:
                    "border-destructive! text-destructive-foreground! bg-destructive/40!",
                  warning:
                    "border-warning! text-warning-foreground! bg-warning/40!",
                  info: "border-info! text-info-foreground! bg-info/40!",
                },
              }}
            />
          </TooltipProvider>
        </PinnedDataStoresProvider>
      </ViewProvider>
    </ServerEventsProvider>
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
  [useView.View.Routines]: Routines,
  [useView.View.Notifications]: Notifications,
  [useView.View.Preferences]: Preferences,
  [useView.View.Info]: Info,
}
