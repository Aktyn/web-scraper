const expectedEnvironmentVariables = ['VITE_PAGINATION_PAGE_SIZE'] as const
for (const variable of expectedEnvironmentVariables) {
  if (!import.meta.env[variable]) {
    console.warn(`Missing environment variable: ${variable}`)
  }
}

const getNumericEnv = (
  variable: (typeof expectedEnvironmentVariables)[number],
  defaultValue: number,
) => {
  const num = Number(import.meta.env[variable])

  return isNaN(num) ? defaultValue : num
}

export const Config = {
  rootElementId: 'root',

  /** Milliseconds */
  PAGINATION_PAGE_SIZE: getNumericEnv('VITE_PAGINATION_PAGE_SIZE', 25),
} as const
