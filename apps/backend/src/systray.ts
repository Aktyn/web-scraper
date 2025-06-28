import type { SimpleLogger } from "@web-scraper/common"
import { SysTray } from "node-systray-v2"
import type { Logger } from "pino"
import { ICON_BASE_64 } from "./consts"

type SystrayContext = {
  logger: Logger | SimpleLogger
}

export function setupSystray(
  { logger }: SystrayContext,
  openWebInterface: () => void,
) {
  const systray = new SysTray({
    menu: {
      //TODO: use png for macOS/Linux and .ico for windows
      icon: ICON_BASE_64,
      title: "Web Scraper",
      tooltip: "Open Web Scraper menu",
      items: [
        {
          title: "Open web interface",
          tooltip: "Open interface in your default web browser",
          checked: false,
          enabled: true,
        },
        {
          title: "Exit",
          tooltip: "Terminate Web Scraper",
          checked: false,
          enabled: true,
        },
      ],
    },
    debug: false,
    copyDir: true,
  })

  systray.onClick((action) => {
    switch (action.seq_id) {
      case 0:
        logger.info("Opening web interface")
        openWebInterface()
        // systray.sendAction({
        //   type: "update-item",
        //   item: {
        //     ...action.item,
        //     checked: !action.item.checked,
        //   },
        //   seq_id: action.seq_id,
        // })
        break
      case 1:
        systray.kill()
        process.exit(0)
    }
  })
}
