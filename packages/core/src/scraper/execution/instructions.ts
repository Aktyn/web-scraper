import {
  type SerializableRegex,
  type ScraperInstructionInfo,
  type ScraperInstructions,
  type ScraperInstructionsExecutionInfo,
  PageActionType,
  ScraperInstructionType,
  ScraperInstructionsExecutionInfoType,
  assert,
  runUnsafeAsync,
} from "@web-scraper/common"
import { performSystemAction } from "../../system-actions"
import { getScraperValue } from "../data-helper"
import { saveScreenshot } from "../helpers"
import { checkCondition } from "./conditions"
import { ExecutionPages } from "./execution-pages"
import type { ScraperExecutionContext } from "./helpers"
import { performPageAction } from "./page-actions"
import type { Cookie } from "rebrowser-puppeteer"

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
      instructions[0].type === ScraperInstructionType.DeleteCookies ||
      (instructions[0].type === ScraperInstructionType.PageAction &&
        instructions[0].action.type === PageActionType.Navigate),
    "First instruction must be a navigation action or delete cookies",
  )

  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i]
    onInstructionExecutionStart(instruction)

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

    if (context.abortController.signal.aborted) {
      break
    }
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
  const instructionStartTime = Date.now()
  let lastInstructionInfo: ScraperInstructionsExecutionInfo[number] | null =
    null

  switch (instruction.type) {
    case ScraperInstructionType.PageAction:
      {
        const pageIndex = instruction.pageIndex ?? 0
        const pageContext = await context.pages.get(pageIndex)
        const page = pageContext.page
        const startUrl = page.url()

        if (
          process.env.NODE_ENV === "development" &&
          startUrl !== ExecutionPages.emptyPageUrl
        ) {
          await runUnsafeAsync(
            () =>
              saveScreenshot(
                page,
                `${context.scraperIdentifier}-page-${pageIndex}-before-${instruction.type}`,
              ),
            context.logger.error,
          )
        }

        const info: ScraperInstructionInfo & {
          type: ScraperInstructionType.PageAction
        } = {
          type: instruction.type,
          action: instruction.action,
          pageUrl: startUrl,
          pageIndex,
        }
        lastInstructionInfo = pushInstructionInfo(info, context)
        await performPageAction(context, instruction.action, pageContext)

        if (typeof info.pageUrl === "string" && info.pageUrl !== page.url()) {
          info.pageUrl = {
            from: info.pageUrl,
            to: page.url(),
          }
        }

        if (process.env.NODE_ENV === "development") {
          await runUnsafeAsync(
            () =>
              saveScreenshot(
                page,
                `${context.scraperIdentifier}-page-${pageIndex}-after-${instruction.type}`,
              ),
            context.logger.error,
          )
        }
      }
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

    case ScraperInstructionType.DeleteCookies:
      {
        context.logger.info({
          msg: "Deleting cookies",
          domain: instruction.domain,
        })

        const cookies = await context.pages.browser.cookies()

        const domainCookies = filterCookiesByDomain(cookies, instruction.domain)

        await context.pages.browser.deleteCookie(...domainCookies)

        lastInstructionInfo = pushInstructionInfo(
          {
            type: instruction.type,
            domain: instruction.domain,
            deletedCookies: domainCookies.length,
          },
          context,
        )
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

  lastInstructionInfo.duration = Date.now() - instructionStartTime
}

function pushInstructionInfo<T extends ScraperInstructionInfo>(
  instructionInfo: T,
  context: ScraperExecutionContext,
) {
  const info = {
    type: ScraperInstructionsExecutionInfoType.Instruction,
    instructionInfo,
    duration: 0,
  } satisfies ScraperInstructionsExecutionInfo[number] & {
    instructionInfo: T
  }
  context.executionInfo.push(info)
  return info
}

function filterCookiesByDomain(
  cookies: Cookie[],
  domain: string | SerializableRegex,
) {
  if (typeof domain === "string") {
    const url = new URL(domain)
    const matchResult = url.hostname.match(
      /^(?:.*?\.)?([a-zA-Z0-9\-_]{3,}\.(?:\w{2,8}|\w{2,4}\.\w{2,4}))$/,
    )

    const cleanDomain =
      matchResult && matchResult.length >= 2 ? matchResult[1] : url.hostname

    return cookies.filter(
      (cookie) =>
        cookie.domain === cleanDomain || cookie.domain === `.${cleanDomain}`,
    )
  }

  const regex = new RegExp(domain.source, domain.flags)
  return cookies.filter((cookie) => regex.test(cookie.domain))
}
