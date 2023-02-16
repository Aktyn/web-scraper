import { afterAll, describe, expect, it, vi } from 'vitest'

import { debounce, safePromise, wait, waitFor } from './async'

describe('waitFor', () => {
  it('checks condition in given time intervals until the condition resolves to true', async () => {
    let counter = 0
    const fn = vi.fn()

    await waitFor(() => {
      fn()
      counter++
      return Promise.resolve(counter >= 5)
    }, 10)

    expect(fn).toBeCalledTimes(5)
  })

  it('throws Timeout if condition is not met after given time limit', async () => {
    const fn = vi.fn()

    const promise = waitFor(
      () => {
        fn()
        return Promise.resolve(false)
      },
      9,
      30,
    )

    await expect(promise).rejects.toThrowError('Timeout')
    expect(fn).toBeCalledTimes(4)
  })
})

describe('safePromise', () => {
  const workingAsyncFunction = async () => 1337

  const throwingAsyncFunction = async (): Promise<number> => {
    throw new Error('Mock error')
  }

  it('should return null when given function throws error', async () => {
    const res = await safePromise(throwingAsyncFunction())
    expect(res).toBeNull()
  })

  it('should return fallback data when given function throws error', async () => {
    const res = await safePromise(throwingAsyncFunction(), 7331)
    expect(res).toBe(7331)
  })

  it('should return promise result', async () => {
    const res = await safePromise(workingAsyncFunction())
    expect(res).toBe(1337)
  })
})

describe('debounce', () => {
  afterAll(async () => {
    await wait(200) // avoid jest open handle error
  })

  it('should execute once after given delay unless canceled before', async () => {
    let a = 0
    const [incrementValueDebounce, cancel] = debounce(() => a++, 1)
    incrementValueDebounce()
    incrementValueDebounce()

    expect(a).toBe(0)

    await wait(3) // anything greater that debounce delay x2
    expect(a).toBe(1)
    cancel()

    const [incrementValueDebounce2, cancel2] = debounce(() => a++)
    incrementValueDebounce2()
    cancel2()
    await wait(20)
    expect(a).toBe(1)
  }, 1000)
})
