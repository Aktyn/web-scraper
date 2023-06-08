export function mix(value1: number, value2: number, factor: number) {
  return value1 * (1 - factor) + value2 * factor
}

export function random(min: number, max: number, randomFunc = Math.random) {
  return randomFunc() * (max - min) + min
}

export function randomInt(min: number, max: number, randomFunc = Math.random) {
  return Math.floor(randomFunc() * (max - min + 1)) + min
}

export function gaussianRandom(iterations = 6) {
  let rand = 0
  for (let i = 0; i < iterations; i += 1) {
    rand += Math.random()
  }
  return rand / iterations
}

export function gaussianRandomRange(min: number, max: number, iterations = 6) {
  return gaussianRandom(iterations) * (max - min) + min
}
