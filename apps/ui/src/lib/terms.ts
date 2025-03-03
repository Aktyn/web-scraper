import { ExecutionItemType } from '@web-scraper/common'

export type TermKey = (typeof TERMS_DETAILS)[number]['key']

export const TERMS_DETAILS = [
  {
    key: 'job',
    title: 'Job',
    content:
      'Named list of steps to be executed iteratively by the scraper.\nExecution items can be grouped into named actions for better readability.\nThere may be a condition between steps that controls the execution flow (ability to loop, skip N steps, etc.).',
  },
  {
    key: ExecutionItemType.CONDITION,
    title: 'Condition',
    content:
      'Part of job execution. Controls the execution flow (ability to loop, skip N steps, etc.).',
  },
  {
    key: ExecutionItemType.STEP,
    title: 'Scraper step',
    content:
      'Part of job execution. The simplest operation performed on the page, such as pressing a button, filling in an input, reading the content of an element, etc.',
  },
  // {
  //   key: ExecutionItemType.AI_ACTION,
  //   title: 'AI action',
  //   content: 'Part of job execution. AI action.', //TODO: add more details
  // },
] as const
