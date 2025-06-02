import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"
import { Button } from "../shadcn/button"
import { Separator } from "../shadcn/separator"

export function Footer({ isOpen }: { isOpen: boolean }) {
  return (
    <footer
      className={cn(
        "p-2 text-sm text-muted-foreground flex flex-row flex-nowrap items-center justify-start gap-2 *:not-first:transition-opacity overflow-hidden whitespace-nowrap",
        isOpen ? "*:not-first:opacity-100" : "*:not-first:opacity-0",
      )}
    >
      <img
        src="/aktyn-icon.png"
        className={cn(
          "h-8 transition-[margin] duration-400 ease-in-out",
          isOpen ? "ml-[0%]" : "ml-[calc(100%-var(--spacing)*10)]",
        )}
      />
      <span className="font-semibold">Aktyn</span>
      <Button
        asChild
        variant="link"
        size="sm"
        className="px-0! h-auto text-muted-foreground"
      >
        <a href="https://github.com/Aktyn" target="_blank">
          GitHub
          <ExternalLink />
        </a>
      </Button>
      <Separator orientation="vertical" className="ml-auto" />
      <span className="font-light">v{getAppVersion()}</span>
    </footer>
  )
}

declare const __APP_VERSION__: string
function getAppVersion() {
  try {
    return __APP_VERSION__
  } catch {
    return "unknown"
  }
}
