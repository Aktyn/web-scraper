import { v4 as uuidv4 } from "uuid"

export function uuid() {
  return uuidv4()
}

function randomElement<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)]
}

const characters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("")
export function randomString(length: number) {
  let result = ""

  for (let i = 0; i < length; i++) {
    result += randomElement(characters)
  }
  return result
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
