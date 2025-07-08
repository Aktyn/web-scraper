import { TERMS } from "@/lib/terms"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"
import { Label } from "../shadcn/label"
import { ScrollArea } from "../shadcn/scroll-area"
import { Separator } from "../shadcn/separator"
import { Button } from "../shadcn/button"
import { ExternalLink } from "lucide-react"

export function Info() {
  return (
    <ScrollArea className="size-full max-h-full">
      <div className="w-auto inline-flex flex-col items-stretch justify-start gap-4 p-4 *:[h4]:sticky *:[h4]:top-0 *:[h4]:z-10 *:[h4]:bg-linear-180 *:[h4]:from-background *:[h4]:from-60% *:[h4]:to-transparent *:[h4]:py-2 *:[h4]:-my-2 *:[h4]:text-lg *:[h4]:font-bold *:[h4]:text-muted-foreground">
        <h4 data-transition-direction="left" className="view-transition">
          About this project
        </h4>
        <Container data-transition-direction="top" className="view-transition">
          <div>
            It's a highly customizable scraper with experimental AI features.
          </div>
          <div>
            The initial idea was to develop an advanced testing tool for web
            projects.
          </div>
        </Container>
        <Separator className="view-transition" />
        <h4
          data-transition-direction="left"
          className="view-transition delay-100"
        >
          Author
        </h4>
        <Container
          data-transition-direction="top"
          className="view-transition delay-100"
        >
          <div>
            Radosław Krajewski <span className="text-sm">(Aktyn)</span>
          </div>
          <div>
            <Button asChild variant="link" className="px-0! py-0 h-auto">
              <a href="https://github.com/Aktyn" target="_blank">
                Visit GitHub for more of my projects
                <ExternalLink />
              </a>
            </Button>
          </div>
        </Container>
        <Separator className="view-transition" />
        <h4
          data-transition-direction="left"
          className="view-transition delay-200"
        >
          Terms
        </h4>
        {Object.values(TERMS).map((term, index) => (
          <Container
            key={term.name}
            data-transition-direction="top"
            className="view-transition"
            style={{
              transitionDelay: `${(index + 2) * 100}ms`,
            }}
          >
            <Label className="text-base font-semibold">{term.name}</Label>
            <p>{term.description}</p>
          </Container>
        ))}
      </div>
    </ScrollArea>
  )
}

function Container(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "bg-card p-2 rounded-lg border shadow-lg whitespace-pre-wrap",
        props.className,
      )}
    />
  )
}
