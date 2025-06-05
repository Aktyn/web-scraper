import { LabeledValue } from "@/components/common/labeled-value"
import type { ScraperElementSelector } from "@web-scraper/common"
import { ElementSelectorType } from "@web-scraper/common"
import { Fragment } from "react/jsx-runtime"

type ScraperElementSelectorInfoProps = {
  selector: ScraperElementSelector
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

    case ElementSelectorType.FindByTextContent: {
      const textValue =
        typeof selector.text === "string"
          ? selector.text
          : `/${selector.text.source}/${selector.text.flags}`

      return (
        <div className="flex flex-row flex-wrap gap-2 gap-x-4">
          <LabeledValue
            label={typeof selector.text === "string" ? "Text:" : "RegExp:"}
          >
            {textValue}
          </LabeledValue>
          {selector.tagName && (
            <LabeledValue label="Tag:">
              <pre className="text-sm break-all whitespace-normal">
                {selector.tagName}
              </pre>
            </LabeledValue>
          )}
          {selector.args && Object.keys(selector.args).length > 0 && (
            <LabeledValue label="Arguments:">
              <div>
                {Object.entries(selector.args).map(([key, value], index) => (
                  <Fragment key={key}>
                    {index > 0 && (
                      <span className="text-xs text-muted-foreground">, </span>
                    )}
                    <div
                      key={key}
                      className="inline-flex flex-row items-baseline gap-1"
                    >
                      <span className="text-xs text-muted-foreground">
                        {key}:
                      </span>
                      <pre className="text-sm break-all whitespace-normal">
                        {typeof value === "string"
                          ? value
                          : `/${value.source}/${value.flags}`}
                      </pre>
                    </div>
                  </Fragment>
                ))}
              </div>
            </LabeledValue>
          )}
        </div>
      )
    }
  }
}
