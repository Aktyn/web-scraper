import type { ActionStep, ActionStepType } from '@web-scraper/common'

export type PerformableActionStep<Type extends ActionStepType = ActionStepType> = Omit<
  ActionStep & { type: Type },
  'id' | 'orderIndex' | 'actionId'
>

export type RequestDataCallback = (valueQuery: string) => Promise<string>
