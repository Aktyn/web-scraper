import { cn } from "@/lib/utils"
import { ScraperProvider } from "@/providers/scraper.provider"
import {
  scraperDataKeySchema,
  type ScraperDataKey,
  type ScraperDataSource,
} from "@web-scraper/common"
import { useContext, useMemo } from "react"

type DataKeyValueProps = {
  dataKey: ScraperDataKey
  className?: string
}

export function DataKeyValue({ dataKey, className }: DataKeyValueProps) {
  const scraperContext = useContext(ScraperProvider.Context)

  const dataSources = scraperContext?.scraper.dataSources
  const isValid = useMemo(
    () => (dataSources ? validateDataKey(dataKey, dataSources) : false),
    [dataKey, dataSources],
  )

  return (
    <pre
      className={cn(
        "break-all whitespace-normal",
        !isValid && "text-destructive",
        className,
      )}
    >
      {dataKey}
      {!isValid && " // Invalid alias"}
    </pre>
  )
}

function validateDataKey(
  dataKey: ScraperDataKey,
  dataSources: ScraperDataSource[],
) {
  const parsedKey = scraperDataKeySchema.safeParse(dataKey)
  if (!parsedKey.success) {
    return false
  }

  const [alias, column] = parsedKey.data.split(".")
  if (!alias || !column) {
    return false
  }

  return dataSources.some((source) => source.sourceAlias === alias)
}
