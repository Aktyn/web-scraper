import "dotenv/config"

import {
  ScraperConditionType,
  PageActionType,
  type ScraperInstructions,
  ScraperInstructionType,
  type ScraperElementSelector,
  ElementSelectorType,
  uuid,
} from "@web-scraper/common"
import { Scraper } from "@web-scraper/core"
import { getApiModule } from "./api/api.module"
import { getConfig } from "./config/config"
import { DataBridge } from "./db/data-bridge"
import { getDbModule } from "./db/db.module"
import { getLogger } from "./logger"

async function main() {
  const logger = getLogger()

  logger.info(`Starting application at ${new Date().toUTCString()}`)

  const config = getConfig()

  const db = getDbModule(config)

  const api = await getApiModule(db)

  api.listen({ port: config.apiPort }, (err, address) => {
    if (err) {
      api.log.error(err)
      process.exit(1)
    }
    logger.info(`Server is now listening on ${address}`)
  })

  logger.info("Setup complete")

  return { config, db, api, logger }
}

const cleanup = async () => {
  Scraper.destroyAll()
  process.exit(0)
}

process.addListener("SIGINT", cleanup)
process.addListener("SIGTERM", cleanup)
process.addListener("SIGQUIT", cleanup)

main()
  .then(async (modules) => {
    const dataBridge = new DataBridge(modules.db)

    const id = uuid()
    const scraper = new Scraper({
      id,
      logger: modules.logger.child({
        scraper: id,
      }),
    })

    try {
      await scraper.run(exampleInstructions, dataBridge) //TODO: remove after testing
    } catch (error) {
      modules.logger.error(error)
    } finally {
      // await scraper.destroy()
    }
  })
  .catch((error) => {
    void cleanup()

    console.error(error)
    process.exit(1)
  })

const acceptCookiesButtonSelector: ScraperElementSelector = {
  type: ElementSelectorType.FindByTextContent,
  text: /akceptuj wszystkie/i,
  tagName: "button",
}

const loginButtonSelector: ScraperElementSelector = {
  type: ElementSelectorType.FindByTextContent,
  text: /zaloguj się/i,
  tagName: "button",
}

const exampleInstructions: ScraperInstructions = [
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Navigate,
      url: "https://www.pepper.pl/",
    },
  },
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Wait,
      duration: 1_000,
    },
  },

  //Accept cookies if banner is visible
  {
    type: ScraperInstructionType.Condition,
    if: {
      type: ScraperConditionType.IsVisible,
      selector: acceptCookiesButtonSelector,
    },
    then: [
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Click,
          selector: acceptCookiesButtonSelector,
        },
      },
    ],
  },

  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Wait,
      duration: 1_000,
    },
  },

  //Login if not already logged in
  {
    type: ScraperInstructionType.Condition,
    if: {
      type: ScraperConditionType.IsVisible,
      selector: loginButtonSelector,
    },
    then: [
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Click,
          selector: loginButtonSelector,
        },
      },
      //TODO: fill login form and finish login process
    ],
  },
]
