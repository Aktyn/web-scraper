import {
  type ScraperInstructionInfo,
  type ScraperInstructions,
  type ScraperInstructionsExecutionInfo,
  PageActionType,
  ScraperInstructionType,
  ScraperInstructionsExecutionInfoType,
  assert,
} from "@web-scraper/common"
import { performSystemAction } from "../../system-actions"
import { getScraperValue } from "../data-helper"
import { saveScreenshot } from "../helpers"
import { checkCondition } from "./conditions"
import type { ScraperExecutionContext } from "./helpers"
import { performPageAction } from "./page-actions"

/**
 * Executes instructions in a scraper execution context.
 * This is recursive function.
 */
export async function executeInstructions(
  context: ScraperExecutionContext,
  instructions: ScraperInstructions,
  onInstructionExecutionStart: (
    instruction: ScraperInstructions[number],
  ) => void,
  level = 0,
): Promise<ScraperInstructions[number] | null> {
  assert(instructions.length > 0 || level > 0, "Instructions are empty")
  assert(
    level > 0 ||
      (instructions[0].type === ScraperInstructionType.PageAction &&
        instructions[0].action.type === PageActionType.Navigate),
    "First instruction must be a navigation action",
  )

  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i]
    onInstructionExecutionStart(instruction)

    if (process.env.NODE_ENV === "development" && i > 0) {
      await saveScreenshot(
        context.page,
        `${context.scraperIdentifier}-before-${instruction.type}`,
      )
    }

    await executeInstructionByType(
      instruction,
      context,
      onInstructionExecutionStart,
      level,
    )

    if (instruction.type === ScraperInstructionType.Jump) {
      i = instructions.findIndex(
        (marker) =>
          marker.type === ScraperInstructionType.Marker &&
          marker.name === instruction.markerName,
      )
      assert(
        level > 0 || i !== -1,
        `Marker "${instruction.markerName}" not found`,
      )

      if (i === -1) {
        context.logger.warn("Marker not found, returning to previous level")
        return instruction
      }
    }
  }

  if (process.env.NODE_ENV === "development") {
    await saveScreenshot(context.page, context.scraperIdentifier)
  }

  return null
}

async function executeInstructionByType(
  instruction: ScraperInstructions[number],
  context: ScraperExecutionContext,
  onInstructionExecutionStart: (
    instruction: ScraperInstructions[number],
  ) => void,
  level: number,
) {
  const instructionStartUrl = context.page.url()
  const instructionStartTime = performance.now()
  let lastInstructionInfo: ScraperInstructionsExecutionInfo[number] | null =
    null

  switch (instruction.type) {
    case ScraperInstructionType.PageAction:
      lastInstructionInfo = pushInstructionInfo(
        {
          type: instruction.type,
          action: instruction.action,
        },
        context,
      )
      await performPageAction(context, instruction.action)
      break

    case ScraperInstructionType.Condition:
      {
        context.logger.info({
          msg: "Checking condition",
          condition: instruction.if,
        })

        const info = pushInstructionInfo(
          {
            type: instruction.type,
            condition: instruction.if,
            isMet: false as boolean,
          },
          context,
        )
        const isMet = await checkCondition(context, instruction.if)
        info.instructionInfo.isMet = isMet
        lastInstructionInfo = info

        const conditionalInstructionsResult = isMet
          ? await executeInstructions(
              context,
              instruction.then,
              onInstructionExecutionStart,
              level + 1,
            )
          : instruction.else
            ? await executeInstructions(
                context,
                instruction.else,
                onInstructionExecutionStart,
                level + 1,
              )
            : null

        if (
          conditionalInstructionsResult?.type === ScraperInstructionType.Jump
        ) {
          instruction = conditionalInstructionsResult
          break
        }
      }
      break

    case ScraperInstructionType.SaveData:
      {
        context.logger.info("Saving data to data bridge", {
          dataKey: instruction.dataKey,
          value: instruction.value,
        })

        lastInstructionInfo = pushInstructionInfo(
          {
            type: instruction.type,
            dataKey: instruction.dataKey,
            value: instruction.value,
          },
          context,
        )
        const scraperValue = await getScraperValue(context, instruction.value)
        await context.dataBridge.set(instruction.dataKey, scraperValue)
        context.executionInfo.push(
          {
            type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
            operation: {
              type: "set",
              key: instruction.dataKey,
              value: scraperValue,
            },
          },
          false,
        )
      }
      break
    case ScraperInstructionType.SaveDataBatch:
      {
        context.logger.info("Saving batch data to data bridge", {
          dataSourceName: instruction.dataSourceName,
          items: instruction.items,
        })

        lastInstructionInfo = pushInstructionInfo(
          {
            type: instruction.type,
            dataSourceName: instruction.dataSourceName,
            items: instruction.items,
          },
          context,
        )

        const items = await Promise.all(
          instruction.items.map(async (item) => ({
            columnName: item.columnName,
            value: await getScraperValue(context, item.value),
          })),
        )

        await context.dataBridge.setMany(instruction.dataSourceName, items)
        context.executionInfo.push(
          {
            type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
            operation: {
              type: "setMany",
              dataSourceName: instruction.dataSourceName,
              items: items,
            },
          },
          false,
        )
      }
      break
    case ScraperInstructionType.DeleteData:
      context.logger.info("Deleting data from data bridge", {
        dataSourceName: instruction.dataSourceName,
      })

      lastInstructionInfo = pushInstructionInfo(
        {
          type: instruction.type,
          dataSourceName: instruction.dataSourceName,
        },
        context,
      )
      await context.dataBridge.delete(instruction.dataSourceName)
      context.executionInfo.push(
        {
          type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
          operation: {
            type: "delete",
            dataSourceName: instruction.dataSourceName,
          },
        },
        false,
      )
      break

    case ScraperInstructionType.Marker:
      context.logger.info("Marking position in scraper execution", {
        markerName: instruction.name,
      })

      lastInstructionInfo = pushInstructionInfo(
        {
          type: instruction.type,
          name: instruction.name,
        },
        context,
      )
      context.executionInfo.flush()
      break
    case ScraperInstructionType.Jump:
      context.logger.info("Jumping to marker", {
        markerName: instruction.markerName,
      })

      lastInstructionInfo = pushInstructionInfo(
        {
          type: instruction.type,
          markerName: instruction.markerName,
        },
        context,
      )
      break

    case ScraperInstructionType.SystemAction:
      context.logger.info("Performing system action", {
        action: instruction.systemAction,
      })

      lastInstructionInfo = pushInstructionInfo(
        {
          type: instruction.type,
          systemAction: instruction.systemAction,
        },
        context,
      )

      await performSystemAction(instruction.systemAction)
      break
  }

  lastInstructionInfo.duration = performance.now() - instructionStartTime
  if (lastInstructionInfo.url !== context.page.url()) {
    lastInstructionInfo.url = {
      from: instructionStartUrl,
      to: context.page.url(),
    }
  }
}

function pushInstructionInfo<T extends ScraperInstructionInfo>(
  instructionInfo: T,
  context: ScraperExecutionContext,
) {
  const info = {
    type: ScraperInstructionsExecutionInfoType.Instruction,
    instructionInfo,
    url: context.page.url(),
    duration: 0,
  } satisfies ScraperInstructionsExecutionInfo[number] & {
    instructionInfo: T
  }
  context.executionInfo.push(info)
  return info
}
