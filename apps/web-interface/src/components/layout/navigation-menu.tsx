import { cn } from "@/lib/utils"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"
import { type ComponentType, type SVGProps } from "react"
import { useView } from "../../providers/view-provider"
import { ScraperIcon } from "../icons/scraper-icon"
import { Button } from "../shadcn/button"

type View = (typeof useView.View)[keyof typeof useView.View]

export function NavigationMenu({ compact }: { compact: boolean }) {
  return (
    <nav data-compact={compact} className="flex flex-col items-stretch gap-2 p-2">
      <Item view={useView.View.Dashboard} icon="layout-dashboard" label="Dashboard" />
      <Item view={useView.View.Scrapers} icon={ScraperIcon} label="Scrapers" />
      <Item view={useView.View.DataStores} icon="database" label="Data Stores" />
      <Item view={useView.View.Preferences} icon="settings-2" label="Preferences" />
    </nav>
  )
}

type ItemProps = {
  view: View
  icon: IconName | ComponentType<SVGProps<SVGSVGElement>>
  label: string
}

export function Item({ view, icon: Icon, label }: ItemProps) {
  const { view: currentView, setView } = useView()

  return (
    <Button
      variant="outline"
      size="lg"
      className={cn(
        "gap-x-0 text-md *:[svg]:size-6! transition-colors [[data-compact=true]>*]:*:[span]:grid-cols-[0fr] [[data-compact=true]>*]:*:[span]:opacity-0 [[data-compact=true]>*]:*:[svg]:ml-[calc(100%-var(--spacing)*4)]",
        currentView === view
          ? "pointer-events-none border-primary! text-primary bg-primary/20!"
          : "",
      )}
      onClick={() => setView(view)}
    >
      {typeof Icon === "string" ? (
        <DynamicIcon name={Icon} className="ml-[0%] transition-[margin] duration-400" />
      ) : (
        <Icon className="ml-[0%] transition-[margin] duration-400" />
      )}
      <span className="whitespace-nowrap grid grid-cols-[1fr] justify-end transition-[grid-template-columns,opacity] duration-400">
        <span className="overflow-hidden px-2">{label}</span>
      </span>
    </Button>
  )
}
