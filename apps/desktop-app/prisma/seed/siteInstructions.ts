import type { PrismaClient } from '@prisma/client'
import {
  ActionStepErrorType,
  ActionStepType,
  GLOBAL_ACTION_PREFIX,
  GlobalActionType,
  ProcedureType,
  REGULAR_ACTION_PREFIX,
} from '@web-scraper/common'

export async function seedSiteInstructions(prisma: PrismaClient) {
  const instructions1 = await prisma.siteInstructions.create({ data: { siteId: 1 } })
  const loginAction = await prisma.action.create({
    data: { name: 'login', siteInstructionsId: instructions1.id, url: '{{URL.ORIGIN}}/login' },
  })
  await prisma.actionStep.create({
    data: {
      type: ActionStepType.FILL_INPUT,
      data: JSON.stringify({ element: 'body > input[type=text]', value: 'test' }),
      orderIndex: 1,
      actionId: loginAction.id,
    },
  })
  await prisma.actionStep.create({
    data: {
      type: ActionStepType.PRESS_BUTTON,
      data: JSON.stringify({ element: 'body > button', waitForNavigation: false }),
      orderIndex: 2,
      actionId: loginAction.id,
    },
  })
  await prisma.actionStep.create({
    data: {
      type: ActionStepType.CHECK_SUCCESS,
      data: JSON.stringify({
        element: 'body > div',
        mapSuccess: [{ content: 'success', errorType: ActionStepErrorType.NO_ERROR }],
      }),
      orderIndex: 3,
      actionId: loginAction.id,
    },
  })

  const successFlowStep2 = await prisma.flowStep.create({
    data: {
      actionName: `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH}`,
    },
  })

  const failureFlowStep2 = await prisma.flowStep.create({
    data: {
      actionName: `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH_WITH_ERROR}`,
    },
  })

  const flowStart = await prisma.flowStep.create({
    data: {
      actionName: `${REGULAR_ACTION_PREFIX}.${loginAction.name}`,
      globalReturnValues: JSON.stringify([]),
      onSuccessFlowStepId: successFlowStep2.id,
      onFailureFlowStepId: failureFlowStep2.id,
    },
  })

  await prisma.procedure.create({
    data: {
      name: 'Login',
      type: ProcedureType.ACCOUNT_CHECK,
      startUrl: `{{URL.ORIGIN}}/login`,
      waitFor: 'body > h1',
      siteInstructionsId: instructions1.id,
      flowStepId: flowStart.id,
    },
  })
}
