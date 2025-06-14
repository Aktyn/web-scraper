import { type ScraperDataSource, whereSchemaToSql } from "@web-scraper/common"
import { useMemo } from "react"
import { Code } from "../common/code"
import { LabeledValue } from "../common/label/labeled-value"
import { DataSourceLabel } from "../common/data-source-label"
import { InstructionBlockContainer } from "./instruction-block"

type ScraperDataSourceProps = {
  dataSource: ScraperDataSource
}

export function ScraperDataSource({ dataSource }: ScraperDataSourceProps) {
  const sql = useMemo(() => {
    if (!dataSource.whereSchema) {
      return null
    }
    return whereSchemaToSql(dataSource.whereSchema)
  }, [dataSource.whereSchema])

  return (
    <InstructionBlockContainer className="flex-row flex-wrap gap-x-4">
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
    </InstructionBlockContainer>
  )
}
