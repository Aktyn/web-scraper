import { ErrorCode } from '@web-scraper/common'

import Database from './index'
import { getProcedureFlow } from './siteInstructions'

export function getRoutines() {
  return Database.prisma.routine.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      id: 'desc',
    },
  })
}

export async function getRoutine(routineId: number) {
  const routine = await Database.prisma.routine.findUnique({
    where: {
      id: routineId,
    },
    include: {
      Procedures: {
        include: {
          Procedure: {
            include: {
              FlowStep: true,
            },
          },
        },
      },
    },
  })

  if (!routine) {
    throw ErrorCode.NOT_FOUND
  }

  return {
    ...routine,
    Procedures: await Promise.all(
      routine.Procedures.map(async (procedureRelation) => ({
        ...procedureRelation.Procedure,
        FlowStep: procedureRelation.Procedure.FlowStep
          ? await getProcedureFlow(procedureRelation.Procedure.FlowStep)
          : null,
      })),
    ),
  }
}
