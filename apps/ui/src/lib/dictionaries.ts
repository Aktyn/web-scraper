import { ExecutionItemType, FlowActionType, ScraperStepType } from '@web-scraper/common'
import type { dynamicIconImports } from 'lucide-react/dynamic'

// export const actionStepTypeNames: { [key in ActionStepType]: string } = {
//   [ActionStepType.WAIT]: 'Wait',
//   [ActionStepType.WAIT_FOR_ELEMENT]: 'Wait for element',
//   [ActionStepType.FILL_INPUT]: 'Fill input',
//   [ActionStepType.SELECT_OPTION]: 'Select option',
//   [ActionStepType.PRESS_BUTTON]: 'Press button',
//   [ActionStepType.SAVE_TO_DATA_SOURCE]: 'Save to data source',
//   [ActionStepType.CHECK_ERROR]: 'Check error',
//   [ActionStepType.CHECK_SUCCESS]: 'Check success',
// }

// export const actionStepErrorTypeNames: { [key in ActionStepErrorType]: string } = {
//   [ActionStepErrorType.NO_ERROR]: 'No error',
//   [ActionStepErrorType.UNKNOWN]: 'Unknown error',
//   [ActionStepErrorType.UNKNOWN_STEP_TYPE]: 'Unknown step type',
//   [ActionStepErrorType.ELEMENT_NOT_FOUND]: 'Element not found',
//   [ActionStepErrorType.WAIT_FOR_NAVIGATION_ERROR]: 'Wait for navigation error',
//   [ActionStepErrorType.INCORRECT_CAPTCHA]: 'Incorrect captcha',
//   [ActionStepErrorType.INCORRECT_LOGIN_OR_PASSWORD]: 'Incorrect login or password',
//   [ActionStepErrorType.INCORRECT_VERIFICATION_CODE]: 'Incorrect verification code',
//   [ActionStepErrorType.CAPTCHA_RECOGNITION_FAILED]: 'Captcha recognition failed',
//   [ActionStepErrorType.UNKNOWN_INTERNAL_ERROR]: 'Unknown internal error',
//   [ActionStepErrorType.INCORRECT_DATA]: 'Incorrect data',
//   [ActionStepErrorType.OPTION_NOT_SELECTED]: 'Option not selected',
//   [ActionStepErrorType.DATA_SOURCE_NOT_FOUND]: 'Data source not found',
//   [ActionStepErrorType.DATA_SOURCE_COLUMN_NOT_FOUND]: 'Data source column not found',
// }

// export const captchaSolverTypeNames: { [key in CaptchaSolverType]: string } = {
//   [CaptchaSolverType.SIMPLE]: 'Simple captcha solver',
// }

// export const procedureTypeNames: { [key in ProcedureType]: string } = {
//   [ProcedureType.ACCOUNT_CHECK]: 'Account check',
//   [ProcedureType.DATA_RETRIEVAL]: 'Data retrieval',
//   [ProcedureType.MONITORING]: 'Monitoring',
//   [ProcedureType.CUSTOM]: 'Custom',
// }

// export const globalActionTypeNames: { [key in GlobalActionType]: string } = {
//   [GlobalActionType.FINISH]: 'Finish',
//   [GlobalActionType.FINISH_WITH_ERROR]: 'Finish with error',
//   [GlobalActionType.FINISH_WITH_NOTIFICATION]: 'Finish with notification',
// }

// export function parseActionName(actionName: FlowStep['actionName']) {
//   const [, actionNameValue] = actionName.split('.') ?? ['', '']

//   if (isRegularAction(actionName)) {
//     return `Action.${actionNameValue}`
//   }
//   if (isGlobalAction(actionName)) {
//     return `Global.${globalActionTypeNames[actionNameValue as GlobalActionType]}`
//   }
//   return actionName
// }

// export const scraperExecutionScopeNames: { [key in ScraperExecutionScope]: string } = {
//   [ScraperExecutionScope.ACTION_STEP]: 'Action step',
//   [ScraperExecutionScope.ACTION]: 'Action',
//   [ScraperExecutionScope.FLOW]: 'Flow',
//   [ScraperExecutionScope.PROCEDURE]: 'Procedure',
//   [ScraperExecutionScope.ROUTINE]: 'Routine',
// }

// export const dataSourceColumnTypeNames: { [key in DataSourceColumnType]: string } = {
//   [DataSourceColumnType.TEXT]: 'Text',
//   [DataSourceColumnType.INTEGER]: 'Integer',
//   [DataSourceColumnType.REAL]: 'Real',
// }

// export const saveDataTypeNames: { [key in SaveDataType]: string } = {
//   [SaveDataType.CURRENT_TIMESTAMP]: 'Current timestamp',
//   [SaveDataType.CUSTOM]: 'Custom',
//   [SaveDataType.ELEMENT_CONTENT]: 'Element content',
//   [SaveDataType.SET_NULL]: 'Set null',
// }

// export const routineExecutionTypeNames: { [key in RoutineExecutionType]: string } = {
//   [RoutineExecutionType.MATCH_SEQUENTIALLY]: 'Match sequentially',
//   [RoutineExecutionType.SPECIFIC_IDS]: 'Specific ids',
//   [RoutineExecutionType.EXCEPT_SPECIFIC_IDS]: 'Except specific ids',
//   [RoutineExecutionType.STANDALONE]: 'Standalone',
// }

// TODO: check above dictionaries for deprecations

export const executionItemTypeNames: {
  [key in ExecutionItemType]: { label: string; iconName: keyof typeof dynamicIconImports }
} = {
  [ExecutionItemType.CONDITION]: { label: 'Condition', iconName: 'git-branch' },
  [ExecutionItemType.STEP]: { label: 'Scraper step', iconName: 'mouse-pointer-click' },
  // [ExecutionItemType.AI_ACTION]: { label: 'AI action', iconName: 'wand-2' },
}

export const flowActionTypeNames: { [key in FlowActionType]: string } = {
  [FlowActionType.JUMP]: 'Jump',
}

export const scraperStepTypeNames: { [key in ScraperStepType]: string } = {
  [ScraperStepType.FILL_INPUT]: 'Fill input',
  [ScraperStepType.SELECT_OPTION]: 'Select option',
  [ScraperStepType.PRESS_BUTTON]: 'Press button',
  [ScraperStepType.REDIRECT]: 'Redirect',
}
