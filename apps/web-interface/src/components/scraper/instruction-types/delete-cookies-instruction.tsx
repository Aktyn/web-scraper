import { LabeledValue } from "@/components/common/label/labeled-value"
import type { SerializableRegex } from "@web-scraper/common"
import { Cookie, Regex } from "lucide-react"
import type { ComponentProps } from "react"

type DeleteCookiesInstructionProps = {
  domain: string | SerializableRegex
  deletedCookies?: number
} & ComponentProps<"div">

export function DeleteCookiesInstruction({
  domain,
  deletedCookies,
  ...divProps
}: DeleteCookiesInstructionProps) {
  const stringDomain =
    typeof domain === "string" || !domain
      ? domain
      : `/${domain.source}/${domain.flags}`

  return (
    <div {...divProps}>
      <div className="flex items-center gap-2">
        <Cookie className="size-4" />
        <span className="font-medium leading-none">Delete cookies</span>
      </div>

      <LabeledValue label="Domain:">
        {stringDomain}
        {typeof domain !== "string" && (
          <Regex className="size-3.5 inline text-muted-foreground" />
        )}
      </LabeledValue>

      {typeof deletedCookies === "number" && (
        <LabeledValue label="Deleted cookies:">{deletedCookies}</LabeledValue>
      )}
    </div>
  )
}
