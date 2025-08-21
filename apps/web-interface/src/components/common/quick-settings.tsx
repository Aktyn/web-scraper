import { useQuickSettings } from "@/providers/quick-settings.provider"
import { Label } from "../shadcn/label"
import { Switch } from "../shadcn/switch"

export function QuickSettings() {
  const { settings, setSettings } = useQuickSettings()

  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-2 p-2">
      <Switch
        id="toggle-toasts"
        checked={settings.enableToasts}
        onCheckedChange={(checked) => setSettings("enableToasts", checked)}
      />
      <Label htmlFor="toggle-toasts" className="cursor-pointer">
        Show toasts
      </Label>
    </div>
  )
}
