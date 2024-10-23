export type TermKey = (typeof TERMS_DETAILS)[number]['key']

export const TERMS_DETAILS = [
  {
    key: 'job',
    title: 'Job',
    content:
      'List of steps to be executed iteratively by the scraper.\nSteps in a job can be grouped into named actions for better readability.\nThere may be a condition between steps that controls the execution flow (ability to loop, skip N steps, etc.).',
  },
  {
    key: 'step',
    title: 'Step',
    content:
      'The simplest operation performed on the page, such as pressing a button, filling in an input, reading the content of an element, etc.',
  },
] as const
