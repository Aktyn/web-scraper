import type { PrismaClient } from '@prisma/client'
import {
  ActionStep,
  ActionStepType,
  GLOBAL_ACTION_PREFIX,
  GlobalActionType,
  ProcedureType,
  REGULAR_ACTION_PREFIX,
  SaveDataType,
  ValueQueryType,
} from '@web-scraper/common'

export async function seedSiteInstructions(prisma: PrismaClient) {
  const instructions1 = await prisma.siteInstructions.create({ data: { siteId: 1 } })
  const getTitleAction = await prisma.action.create({
    data: { name: 'Get title', siteInstructionsId: instructions1.id, url: '{{URL.ORIGIN}}' },
  })
  await prisma.actionStep.create({
    data: {
      type: ActionStepType.SAVE_TO_DATA_SOURCE,
      data: JSON.stringify({
        dataSourceQuery: `${ValueQueryType.DATA_SOURCE}.Example.Title`,
        saveDataType: SaveDataType.ELEMENT_CONTENT,
        saveToDataSourceValue: 'body > div:nth-child(1) > h1',
      } satisfies ActionStep['data']),
      orderIndex: 1,
      actionId: getTitleAction.id,
    },
  })
  await prisma.actionStep.create({
    data: {
      type: ActionStepType.WAIT,
      data: JSON.stringify({ duration: 5000 } satisfies ActionStep['data']),
      orderIndex: 2,
      actionId: getTitleAction.id,
    },
  })
  await prisma.actionStep.create({
    data: {
      type: ActionStepType.SAVE_TO_DATA_SOURCE,
      data: JSON.stringify({
        dataSourceQuery: `${ValueQueryType.DATA_SOURCE}.Example.Timestamp`,
        saveDataType: SaveDataType.CURRENT_TIMESTAMP,
      } satisfies ActionStep['data']),
      orderIndex: 3,
      actionId: getTitleAction.id,
    },
  })
  await prisma.actionStep.create({
    data: {
      type: ActionStepType.WAIT,
      data: JSON.stringify({ duration: 5000 } satisfies ActionStep['data']),
      orderIndex: 4,
      actionId: getTitleAction.id,
    },
  })
  await prisma.actionStep.create({
    data: {
      type: ActionStepType.SAVE_TO_DATA_SOURCE,
      data: JSON.stringify({
        dataSourceQuery: `${ValueQueryType.DATA_SOURCE}.Example.Custom`,
        saveDataType: SaveDataType.CUSTOM,
        saveToDataSourceValue: 'Custom value from siteInstructions seed',
      } satisfies ActionStep['data']),
      orderIndex: 5,
      actionId: getTitleAction.id,
    },
  })
  await prisma.actionStep.create({
    data: {
      type: ActionStepType.WAIT,
      data: JSON.stringify({ duration: 5000 } satisfies ActionStep['data']),
      orderIndex: 6,
      actionId: getTitleAction.id,
    },
  })

  const successFlowStep = await prisma.flowStep.create({
    data: {
      actionName: `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH}`,
    },
  })

  const failureFlowStep = await prisma.flowStep.create({
    data: {
      actionName: `${GLOBAL_ACTION_PREFIX}.${GlobalActionType.FINISH_WITH_ERROR}`,
    },
  })

  const flowStart = await prisma.flowStep.create({
    data: {
      actionName: `${REGULAR_ACTION_PREFIX}.${getTitleAction.name}`,
      globalReturnValues: JSON.stringify([]),
      onSuccessFlowStepId: successFlowStep.id,
      onFailureFlowStepId: failureFlowStep.id,
    },
  })

  await prisma.procedure.create({
    data: {
      name: 'Get title from example site',
      type: ProcedureType.DATA_RETRIEVAL,
      startUrl: `{{URL.ORIGIN}}`,
      waitFor: 'body > div:nth-child(1) > h1',
      siteInstructionsId: instructions1.id,
      flowStepId: flowStart.id,
    },
  })
}
