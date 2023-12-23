export type ExtendArray<T> = T | T[]

/* eslint-disable @typescript-eslint/no-explicit-any */
type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ?
        | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}`
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never
type PathImpl2<T> = PathImpl<T, keyof T> | keyof T
export type Path<T> = PathImpl2<T> extends string | keyof T ? PathImpl2<T> : keyof T

export type ExtractTypeByPath<
  DataType extends object,
  PathType extends string & Path<DataType>,
> = PathType extends `${infer Key}.${infer Rest}`
  ? Key extends keyof DataType
    ? DataType[Key] extends object
      ? Rest extends string & Path<DataType[Key]>
        ? ExtractTypeByPath<DataType[Key], Rest>
        : never
      : never
    : never
  : PathType extends keyof DataType
    ? DataType[PathType]
    : never

export type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never
}[keyof T]

export type AwaitedFunction<T extends (...args: never[]) => Promise<unknown>> = T extends (
  ...args: never[]
) => Promise<infer R>
  ? (...args: Parameters<T>) => R
  : never
