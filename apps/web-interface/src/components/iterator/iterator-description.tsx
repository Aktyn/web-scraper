import type { ExecutionIterator } from "@web-scraper/common"
import { ExecutionIteratorType, whereSchemaToSql } from "@web-scraper/common"
import type { PropsWithChildren } from "react"
import { Code } from "@/components/common/code"
import { cn } from "@/lib/utils"

type IteratorDescriptionProps = PropsWithChildren<{
  iterator: ExecutionIterator | null
  className?: string
}>

export function IteratorDescription({
  iterator,
  children,
  className,
}: IteratorDescriptionProps) {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between gap-3",
        className,
      )}
    >
      <Description iterator={iterator} />
      {children}
    </div>
  )
}

function Description({ iterator }: { iterator: ExecutionIterator | null }) {
  if (!iterator) {
    return (
      <span className="font-semibold text-muted-foreground text-pretty">
        No iterator configured. Scraper will run once.
        <br />
        Data will be fetched from the last row from data source.
        <br />
        Data save instructions will try to insert new row.
      </span>
    )
  }

  switch (iterator.type) {
    case ExecutionIteratorType.EntireSet:
      return (
        <div>
          For each record of <b>{iterator.dataSourceName}</b>
        </div>
      )
    case ExecutionIteratorType.FilteredSet: {
      const sql = whereSchemaToSql(iterator.where)
      return (
        <div>
          For each record of <b>{iterator.dataSourceName}</b> where:
          <Code className="text-sm whitespace-normal break-after-all">
            {sql}
          </Code>
        </div>
      )
    }
    case ExecutionIteratorType.Range: {
      if (typeof iterator.range === "number") {
        return (
          <div>
            For single record of <b>{iterator.dataSourceName}</b> where{" "}
            <pre className="inline whitespace-normal break-words">
              <b>{iterator.identifier}</b> = <b>{iterator.range}</b>
            </pre>
          </div>
        )
      }

      const { start, end, step } = iterator.range
      const stepText =
        !step || step === 1 ? "each" : `every ${getOrdinalSuffix(step)}`

      if (iterator.identifier) {
        return (
          <div>
            For {stepText} record of <b>{iterator.dataSourceName}</b> where{" "}
            <b>{iterator.identifier}</b> is between <b>{start}</b> and{" "}
            <b>{end}</b>
          </div>
        )
      }

      const startText = getOrdinalSuffix(start)
      const endText = getOrdinalSuffix(end)
      return (
        <div>
          For {stepText} record of <b>{iterator.dataSourceName}</b> between{" "}
          {startText} and {endText} index
        </div>
      )
    }
  }
  return null
}

function getOrdinalSuffix(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) {
    return `${n}th`
  }
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}
