import { v4 as uuidv4 } from "uuid"

export function uuid() {
  return uuidv4()
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
