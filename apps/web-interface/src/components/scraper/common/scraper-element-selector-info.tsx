import type { ScraperElementSelectors } from "@web-scraper/common"
import { ElementSelectorType } from "@web-scraper/common"

type ScraperElementSelectorInfoProps = {
  selector: ScraperElementSelectors[number]
}

export function ScraperElementSelectorInfo({
  selector,
}: ScraperElementSelectorInfoProps) {
  switch (selector.type) {
    case ElementSelectorType.Query:
      return (
        <pre className="text-sm break-all whitespace-normal">
          {selector.query}
        </pre>
      )

    case ElementSelectorType.TextContent:
      return (
        <pre className="text-sm break-all whitespace-normal">
          {typeof selector.text === "string"
            ? selector.text
            : `/${selector.text.source}/${selector.text.flags}`}
        </pre>
      )

    case ElementSelectorType.TagName:
      return (
        <pre className="text-sm break-all whitespace-normal">
          {selector.tagName}
        </pre>
      )

    case ElementSelectorType.Attributes:
      return (
        <div className="flex flex-col">
          {Object.entries(selector.attributes).map(([key, value]) => (
            <div
              key={key}
              className="inline-flex flex-row items-baseline gap-0.5 text-sm text-muted-foreground"
            >
              <span>{key}</span>
              <span>=</span>
              <pre className="break-all whitespace-normal text-foreground font-semibold">
                {typeof value === "string"
                  ? value
                  : `/${value.source}/${value.flags}`}
              </pre>
            </div>
          ))}
        </div>
      )
  }
}
