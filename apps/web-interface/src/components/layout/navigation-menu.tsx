import { DynamicIcon, type IconName } from "lucide-react/dynamic"
import { Button } from "../shadcn/button"
import { useView } from "../../providers/view-provider"
import { cn } from "@/lib/utils"

type View = (typeof useView.View)[keyof typeof useView.View]

export function NavigationMenu() {
  return (
    <nav className="flex flex-col items-stretch gap-2 p-2">
      <Item view={useView.View.Dashboard} icon="layout-dashboard" label="Dashboard" />
      <Item view={useView.View.Preferences} icon="settings-2" label="Preferences" />
    </nav>
  )
}

type ItemProps = {
  view: View
  icon: IconName
  label: string
}

export function Item({ view, icon, label }: ItemProps) {
  const { view: currentView, setView } = useView()

  return (
    <Button
      variant="outline"
      size="lg"
      className={cn(
        "text-md *:[svg]:size-6! transition-colors",
        currentView === view
          ? "pointer-events-none border-primary! text-primary bg-primary/20!"
          : "",
      )}
      onClick={() => setView(view)}
    >
      <DynamicIcon name={icon} />
      <span>{label}</span>
    </Button>
  )
}
