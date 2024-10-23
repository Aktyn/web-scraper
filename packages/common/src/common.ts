import { v4 as uuidv4 } from 'uuid'
import type { ExtractTypeByPath, NumericKeys, Path } from './types'

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
    if (value === undefined || value === null) {
      return (value ?? fallback) as ExtractTypeByPath<DataType, PathType>
    }
    value = value[properties[0] as keyof typeof value]
    properties.shift()
  }
  return (value ?? fallback) as ExtractTypeByPath<DataType, PathType>
}

export function forceArray<DataType>(value: DataType | DataType[]) {
  return Array.isArray(value) ? value : [value]
}

export function sortNumbers<DataType extends object>(
  key: NumericKeys<DataType>,
  direction: 'asc' | 'desc' = 'asc',
) {
  return (a: DataType, b: DataType) => {
    const aValue = a[key] as number
    const bValue = b[key] as number
    return direction === 'asc' ? aValue - bValue : bValue - aValue
  }
}

export function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function generateUUID() {
  return uuidv4()
}
