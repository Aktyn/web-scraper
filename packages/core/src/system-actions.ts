import { type SystemAction, SystemActionType } from "@web-scraper/common"
import { notify } from "node-notifier"
import { execSync } from "node:child_process"

export function performSystemAction(action: SystemAction) {
  switch (action.type) {
    case SystemActionType.ShowNotification:
      notify({
        title: "Web Scraper",
        message: action.message,
        wait: false,
        sound: false,
      })
      break

    case SystemActionType.ExecuteSystemCommand:
      execSync(action.command, { stdio: "inherit" })
      break
  }
}
