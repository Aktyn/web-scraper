import { describe, expect, it, vi } from 'vitest'

import { waitFor } from './common'

describe(waitFor.name, () => {
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
