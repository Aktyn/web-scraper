import {
  replaceSpecialStrings,
  type SystemAction,
  SystemActionType,
} from "@web-scraper/common"
import { notify } from "node-notifier"
import { execSync } from "node:child_process"
import type { ScraperExecutionContext } from "./scraper/execution/helpers"
import { buildSpecialStringContext } from "./scraper/helpers"

export async function performSystemAction(
  context: ScraperExecutionContext,
  action: SystemAction,
) {
  switch (action.type) {
    case SystemActionType.ShowNotification:
      systemActions.showNotification(
        await replaceSpecialStrings(
          action.message,
          buildSpecialStringContext(context),
        ),
      )
      break

    case SystemActionType.ExecuteSystemCommand:
      systemActions.executeSystemCommand(
        await replaceSpecialStrings(
          action.command,
          buildSpecialStringContext(context),
        ),
      )
      break
  }
}

export const systemActions = {
  showNotification: (message: string) =>
    notify({
      title: "Web Scraper",
      message,
      wait: false,
      sound: false,
    }),
  executeSystemCommand: (command: string) =>
    execSync(command, { stdio: "inherit" }),
}
