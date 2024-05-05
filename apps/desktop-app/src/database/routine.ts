import {
  ErrorCode,
  type PaginatedRequest,
  type RoutineExecutionHistory,
  upsertRoutineSchema,
  type Routine,
  type RoutineExecutionResult,
  type UpsertRoutineSchema,
} from '@web-scraper/common'

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

function validateUpsertSchema(data: UpsertRoutineSchema) {
  try {
    upsertRoutineSchema.validateSync(data)
  } catch (error) {
    throw ErrorCode.INCORRECT_DATA
  }
}

async function throwIfNameExists(name: string, omitId?: Routine['id']) {
  if (omitId) {
    if (
      await Database.prisma.routine.findFirst({
        where: {
          AND: [{ id: { not: omitId } }, { name }],
        },
      })
    ) {
      throw ErrorCode.ENTRY_ALREADY_EXISTS
    }
  } else if (
    await Database.prisma.routine.findUnique({
      where: { name },
    })
  ) {
    throw ErrorCode.ENTRY_ALREADY_EXISTS
  }
}

export async function createRoutine(data: UpsertRoutineSchema) {
  validateUpsertSchema(data)
  await throwIfNameExists(data.name)

  const newRoutine = await Database.prisma.routine.create({
    data: {
      name: data.name,
      description: data.description,
      stopOnError: data.stopOnError,
      executionPlan: JSON.stringify(data.executionPlan),
      Procedures: {
        create: data.procedureIds.map((id) => ({
          procedureId: id,
        })),
      },
    },
    include: {
      Procedures: {
        include: {
          Procedure: true,
        },
      },
    },
  })

  return getRoutine(newRoutine.id)
}

export async function updateRoutine(id: Routine['id'], data: UpsertRoutineSchema) {
  validateUpsertSchema(data)
  await throwIfNameExists(data.name, id)

  await Database.prisma.routineProcedureRelation.deleteMany({
    where: {
      routineId: id,
    },
  })

  const updatedRoutine = await Database.prisma.routine.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      stopOnError: data.stopOnError,
      executionPlan: JSON.stringify(data.executionPlan),
      Procedures: {
        create: data.procedureIds.map((id) => ({
          procedureId: id,
        })),
      },
    },
    include: {
      Procedures: {
        include: {
          Procedure: true,
        },
      },
    },
  })

  return getRoutine(updatedRoutine.id)
}

export function deleteRoutine(id: Routine['id']) {
  return Database.prisma.routine.delete({
    where: { id },
  })
}

export function createRoutineExecutionResult(
  result: RoutineExecutionResult,
  iterationIndex: number,
) {
  return Database.prisma.routineExecutionResult.create({
    data: {
      routineId: result.routine.id,
      createdAt: new Date(),
      iterationIndex,
      results: JSON.stringify(result),
    },
  })
}

export function getRoutineExecutionHistory(
  request: PaginatedRequest<RoutineExecutionHistory[number], 'id'>,
) {
  return Database.prisma.routineExecutionResult.findMany({
    take: request.count,
    skip: request.cursor ? 1 : 0,
    cursor: request.cursor,
    where:
      Array.isArray(request.filters) && request.filters?.length
        ? {
            AND: request.filters as never,
          }
        : undefined,
    orderBy: {
      createdAt: 'desc',
    },
    include: { Routine: true },
  })
}
