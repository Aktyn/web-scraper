import type { FlowStep as DatabaseFlowStep } from '@prisma/client'
import { ErrorCode, type Site } from '@web-scraper/common'

import Database from './index'

export async function getSiteInstructions(siteId: Site['id']) {
  const instructions = await Database.prisma.siteInstructions.findUnique({
    where: {
      siteId,
    },
    include: {
      Actions: {
        include: {
          ActionSteps: true,
        },
      },
      Procedures: {
        include: {
          FlowStep: true,
        },
      },
    },
  })

  if (!instructions) {
    throw ErrorCode.NOT_FOUND
  }

  return {
    ...instructions,
    Procedures: await Promise.all(
      instructions.Procedures.map(async (procedure) => ({
        ...procedure,
        FlowStep: procedure.FlowStep ? await getProcedureFlow(procedure.FlowStep) : null,
      })),
    ),
  }
}

async function getFlowStep(id: DatabaseFlowStep['id']) {
  const flowStep = await Database.prisma.flowStep.findUnique({
    where: { id },
  })

  //TODO: consider returning null instead of throwing an error
  if (!flowStep) {
    throw ErrorCode.NOT_FOUND
  }

  return flowStep
}

type DatabaseFlow = DatabaseFlowStep & {
  OnSuccessFlowStep: DatabaseFlow | null
  OnFailureFlowStep: DatabaseFlow | null
}

async function getProcedureFlow(flowStep: DatabaseFlowStep): Promise<DatabaseFlow> {
  return {
    ...flowStep,
    OnSuccessFlowStep: flowStep.onSuccessFlowStepId
      ? await getProcedureFlow(await getFlowStep(flowStep.onSuccessFlowStepId))
      : null,
    OnFailureFlowStep: flowStep.onFailureFlowStepId
      ? await getProcedureFlow(await getFlowStep(flowStep.onFailureFlowStepId))
      : null,
  }
}
