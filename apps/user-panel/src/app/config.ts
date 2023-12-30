const nanToNull = (value?: string) => {
  const num = Number(value)
  return isNaN(num) ? null : num
}

export const Config = {
  rootElementId: 'root',

  /** Milliseconds */
  VIEW_TRANSITION_DURATION: nanToNull(process.env.REACT_APP_VIEW_TRANSITION_DURATION) ?? 800,
  DEFAULT_BACKGROUND_SATURATION:
    nanToNull(process.env.REACT_APP_DEFAULT_BACKGROUND_SATURATION) ?? 0.4,
  PAGINATION_PAGE_SIZE: nanToNull(process.env.REACT_APP_PAGINATION_PAGE_SIZE) ?? 25,

  FORM_INPUT_DEBOUNCE_TIME: nanToNull(process.env.REACT_APP_FORM_INPUT_DEBOUNCE_TIME) ?? 500,
} as const
