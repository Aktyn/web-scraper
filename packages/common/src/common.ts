import type { ExtractTypeByPath, Path } from './types'

export function pick<ObjectType, Key extends Extract<keyof ObjectType, string>>(
  object: ObjectType,
  ...keys: Key[]
) {
  const picked = {} as Pick<ObjectType, Key>
  for (const key of keys) {
    picked[key] = object[key]
  }
  return picked
}

export function omit<ObjectType, Key extends Extract<keyof ObjectType, string>>(
  object: ObjectType,
  ...keys: Key[]
) {
  const omitted = {} as Omit<ObjectType, Key>
  const keysSet = new Set<Extract<keyof ObjectType, string>>(keys)
  for (const objectKey in object) {
    if (!keysSet.has(objectKey)) {
      omitted[objectKey as unknown as Exclude<keyof ObjectType, Key>] =
        object[objectKey as unknown as Exclude<keyof ObjectType, Key>]
    }
  }
  return omitted
}

export function getDeepProperty<DataType extends object, PathType extends string & Path<DataType>>(
  obj: DataType,
  path: PathType,
  fallback: unknown = null,
) {
  const properties = path.split('.')
  let value: object = obj
  while (properties.length > 0) {
    value = value[properties[0] as keyof typeof value]
    properties.shift()
  }
  return (value ?? fallback) as ExtractTypeByPath<DataType, PathType>
}
