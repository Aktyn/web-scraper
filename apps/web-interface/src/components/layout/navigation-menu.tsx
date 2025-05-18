import { LayoutDashboard } from "lucide-react"

export function NavigationMenu() {
  return (
    <nav>
      <div className="flex flex-row items-center justify-center gap-2 p-4 text-primary">
        <LayoutDashboard />
        <span>Dashboard</span>
      </div>
    </nav>
  )
}
