import { cacheable } from './cache'

describe(cacheable.name, () => {
  it('should cache the result of the function', () => {
    const func = jest.fn()
    func.mockReturnValue(1337)

    const cachedFunction = cacheable(func)
    expect(cachedFunction()).toBe(1337)
    expect(cachedFunction()).toBe(1337)

    expect(func).toHaveBeenCalledTimes(1)
  })
})
