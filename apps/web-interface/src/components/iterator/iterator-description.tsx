import type { ExecutionIterator } from "@web-scraper/common"

type IteratorDescriptionProps = {
  iterator: ExecutionIterator | null
}

export function IteratorDescription({ iterator }: IteratorDescriptionProps) {
  //TODO: human readable description of iterator schema
  return <div>IteratorDescription {JSON.stringify(iterator)}</div>
}
