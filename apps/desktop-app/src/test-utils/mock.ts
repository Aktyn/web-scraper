jest.mock('uuid', () => {
  return { v4: () => Math.random().toString(32).substring(2) }
})
