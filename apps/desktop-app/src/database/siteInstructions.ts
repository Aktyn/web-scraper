import type { FlowStep as DatabaseFlowStep } from '@prisma/client'
import {
  ErrorCode,
  safePromise,
  upsertSiteInstructionsSchema,
  type Site,
  type UpsertSiteInstructionsSchema,
} from '@web-scraper/common'

import Database from './index'

export async function getSiteInstructions(siteId: Site['id']) {
  const instructions = await Database.prisma.siteInstructions.findUnique({
    where: {
      siteId,
    },
    include: {
      Actions: {
        include: {
          ActionSteps: {
            orderBy: {
              orderIndex: 'asc',
            },
          },
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

export async function getProcedureFlow(flowStep: DatabaseFlowStep): Promise<DatabaseFlow> {
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

function validateUpsertSchema(data: UpsertSiteInstructionsSchema) {
  try {
    upsertSiteInstructionsSchema.validateSync(data)
  } catch (error) {
    throw ErrorCode.INCORRECT_DATA
  }
}

async function deleteSiteInstructions(siteId: Site['id']) {
  const instructions = await getSiteInstructions(siteId)

  //Remove each flow step as it is not deleted cascade
  const deleteFlowStepTree = async (
    flowStep: (typeof instructions)['Procedures'][number]['FlowStep'],
  ) => {
    if (!flowStep) {
      return
    }
    await deleteFlowStepTree(flowStep.OnSuccessFlowStep)
    await deleteFlowStepTree(flowStep.OnFailureFlowStep)
    await Database.prisma.flowStep.delete({
      where: {
        id: flowStep.id,
      },
    })
  }
  for (const procedure of instructions.Procedures) {
    await deleteFlowStepTree(procedure.FlowStep)
  }

  await Database.prisma.siteInstructions.delete({
    where: {
      siteId,
    },
  })
}

export async function setSiteInstructions(
  siteId: Site['id'],
  instructionsSchema: UpsertSiteInstructionsSchema,
) {
  validateUpsertSchema(instructionsSchema)

  //TODO: backup current site instructions before deleting them in case of an error in next steps
  await safePromise(deleteSiteInstructions(siteId))

  if (!instructionsSchema.actions.length && !instructionsSchema.procedures.length) {
    return
  }

  type FlowSchemaType = NonNullable<UpsertSiteInstructionsSchema['procedures'][number]['flow']>
  type FlowCreateSchemaType = {
    actionName: string
    globalReturnValues: string
    onSuccessFlowStepId: number | null
    onFailureFlowStepId: number | null
  }

  const getFlowCreateSchema = async (flow: FlowSchemaType): Promise<FlowCreateSchemaType> => {
    return {
      actionName: flow.actionName,
      globalReturnValues: JSON.stringify(flow.globalReturnValues ?? []),
      onSuccessFlowStepId: flow.onSuccess
        ? await Database.prisma.flowStep
            .create({
              data: await getFlowCreateSchema(flow.onSuccess as FlowSchemaType),
              select: {
                id: true,
              },
            })
            .then((flowStep) => flowStep.id)
        : null,
      onFailureFlowStepId: flow.onFailure
        ? await Database.prisma.flowStep
            .create({
              data: await getFlowCreateSchema(flow.onFailure as FlowSchemaType),
              select: {
                id: true,
              },
            })
            .then((flowStep) => flowStep.id)
        : null,
    }
  }

  const instructions = await Database.prisma.siteInstructions.create({
    data: {
      siteId,
      Actions: {
        create: instructionsSchema.actions.map((action) => ({
          name: action.name,
          url: action.url,
          ActionSteps: {
            create: action.actionSteps.map((step, index) => ({
              type: step.type,
              data: JSON.stringify(step.data),
              orderIndex: index + 1,
            })),
          },
        })),
      },
      Procedures: {
        create: await Promise.all(
          instructionsSchema.procedures.map(async (procedure) => ({
            name: procedure.name,
            type: procedure.type,
            startUrl: procedure.startUrl,
            waitFor: procedure.waitFor,
            flowStepId: procedure.flow
              ? await Database.prisma.flowStep
                  .create({
                    data: await getFlowCreateSchema(procedure.flow),
                    select: {
                      id: true,
                    },
                  })
                  .then((flowStep) => flowStep.id)
              : null,
          })),
        ),
      },
    },
  })

  if (!instructions) {
    throw ErrorCode.DATABASE_ERROR
  }
}

export async function getProceduresGroupedBySite() {
  const results = await Database.prisma.siteInstructions.findMany({
    select: {
      Site: {
        include: {
          Tags: {
            include: {
              Tag: true,
            },
          },
        },
      },
      Procedures: {
        include: {
          FlowStep: true,
        },
      },
    },
    where: {
      Procedures: {
        some: {
          id: {
            gte: 0,
          },
        },
      },
    },
  })

  return Promise.all(
    results.map(async (result) => ({
      ...result,
      Procedures: await Promise.all(
        result.Procedures.map(async (procedure) => ({
          ...procedure,
          FlowStep: procedure.FlowStep ? await getProcedureFlow(procedure.FlowStep) : null,
        })),
      ),
    })),
  )
}
