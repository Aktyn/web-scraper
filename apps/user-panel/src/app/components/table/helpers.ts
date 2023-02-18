import type { Path } from '@web-scrapper/common'

//TODO: move to @common
export function getDeepProperty<DataType extends object>(
  obj: DataType,
  path: string & Path<DataType>,
) {
  const properties = path.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = obj
  while (properties.length > 0) {
    value = value[properties[0] as keyof typeof value]
    properties.shift()
  }
  return value ?? null
}
