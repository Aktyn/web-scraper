import { type SystemAction, SystemActionType } from "@web-scraper/common"
import { notify } from "node-notifier"

export function performSystemAction(action: SystemAction) {
  switch (action.type) {
    case SystemActionType.ShowNotification:
      notify({
        title: "Web Scraper",
        message: action.message,
        wait: false,
        sound: true,
      })
      break
  }
}
