import {
  ActionStepErrorType,
  ActionStepType,
  CaptchaSolverType,
  GlobalActionType,
  ProcedureType,
} from '@web-scraper/common'

export const actionStepTypeNames: { [key in ActionStepType]: string } = {
  [ActionStepType.WAIT]: 'Wait',
  [ActionStepType.WAIT_FOR_ELEMENT]: 'Wait for element',
  [ActionStepType.FILL_INPUT]: 'Fill input',
  [ActionStepType.UPLOAD_FILE]: 'Upload file',
  [ActionStepType.SELECT_OPTION]: 'Select option',
  [ActionStepType.PRESS_BUTTON]: 'Press button',
  [ActionStepType.SOLVE_CAPTCHA]: 'Solve captcha',
  [ActionStepType.CHECK_ERROR]: 'Check error',
  [ActionStepType.CHECK_SUCCESS]: 'Check success',
}

export const actionStepErrorTypeNames: { [key in ActionStepErrorType]: string } = {
  [ActionStepErrorType.NO_ERROR]: 'No error',
  [ActionStepErrorType.UNKNOWN]: 'Unknown',
  [ActionStepErrorType.INCORRECT_CAPTCHA]: 'Incorrect captcha',
  [ActionStepErrorType.INCORRECT_LOGIN_OR_PASSWORD]: 'Incorrect login or password',
  [ActionStepErrorType.INCORRECT_VERIFICATION_CODE]: 'Incorrect verification code',
  [ActionStepErrorType.CAPTCHA_RECOGNITION_FAILED]: 'Captcha recognition failed',
  [ActionStepErrorType.UNKNOWN_INTERNAL_ERROR]: 'Unknown internal error',
  [ActionStepErrorType.INCORRECT_DATA]: 'Incorrect data',
}

export const captchaSolverTypeNames: { [key in CaptchaSolverType]: string } = {
  [CaptchaSolverType.SIMPLE]: 'Simple captcha solver',
}

export const procedureTypeNames: { [key in ProcedureType]: string } = {
  [ProcedureType.LOGIN]: 'Login',
}

export const globalActionTypeNames: { [key in GlobalActionType]: string } = {
  [GlobalActionType.FINISH]: 'Finish',
  [GlobalActionType.FINISH_WITH_ERROR]: 'Finish with error',
}
