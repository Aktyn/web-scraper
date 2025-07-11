export const IS_TEST_ENV =
  process.env.TEST === "true" ||
  process.env.VITEST === "true" ||
  process.env.CI === "true"
