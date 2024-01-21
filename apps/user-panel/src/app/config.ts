const expectedEnvironmentVariables = [
  'REACT_APP_VIEW_TRANSITION_DURATION',
  'REACT_APP_DEFAULT_BACKGROUND_SATURATION',
  'REACT_APP_PAGINATION_PAGE_SIZE',
  'REACT_APP_FORM_INPUT_DEBOUNCE_TIME',
] as const
for (const variable of expectedEnvironmentVariables) {
  if (!process.env[variable]) {
    console.warn(`Missing environment variable: ${variable}`)
  }
}

const getNumericEnv = (
  variable: (typeof expectedEnvironmentVariables)[number],
  defaultValue: number,
) => {
  const num = Number(process.env[variable])

  return isNaN(num) ? defaultValue : num
}

export const Config = {
  rootElementId: 'root',

  /** Milliseconds */
  VIEW_TRANSITION_DURATION: getNumericEnv('REACT_APP_VIEW_TRANSITION_DURATION', 800),
  DEFAULT_BACKGROUND_SATURATION: getNumericEnv('REACT_APP_DEFAULT_BACKGROUND_SATURATION', 0.3),
  PAGINATION_PAGE_SIZE: getNumericEnv('REACT_APP_PAGINATION_PAGE_SIZE', 25),

  FORM_INPUT_DEBOUNCE_TIME: getNumericEnv('REACT_APP_FORM_INPUT_DEBOUNCE_TIME', 500),
} as const
