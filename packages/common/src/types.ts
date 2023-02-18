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

export type ExtendArray<T> = T | T[]
