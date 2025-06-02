import { type ScraperDataSource, whereSchemaToSql } from "@web-scraper/common"
import { useMemo } from "react"
import { Code } from "../common/code"
import { LabeledValue } from "../common/labeled-value"
import { DataSourceLabel } from "../common/data-source-label"

type ScraperDataSourceProps = {
  dataSource: ScraperDataSource
}

export function ScraperDataSource({ dataSource }: ScraperDataSourceProps) {
  const sql = useMemo(() => {
    if (!dataSource.whereSchema) return null
    return whereSchemaToSql(dataSource.whereSchema)
  }, [dataSource.whereSchema])

  return (
    <div className="border rounded-lg bg-card flex flex-row flex-wrap justify-between gap-2 p-3">
      <LabeledValue label="Alias">{dataSource.sourceAlias}</LabeledValue>
      <LabeledValue label="Table">
        <DataSourceLabel tableName={dataSource.dataStoreTableName} />
      </LabeledValue>
      {sql && (
        <LabeledValue label="Filter">
          <Code className="max-w-full text-pretty whitespace-pre-wrap">
            {sql}
          </Code>
        </LabeledValue>
      )}
    </div>
  )
}
