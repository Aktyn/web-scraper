import "dotenv/config"

import {
  ConditionType,
  ScraperInstructionType,
  SelectorType,
  PageActionType,
  type ScraperInstructions,
  type ScraperSelector,
  uuid,
} from "@web-scraper/common"
import { Scraper } from "@web-scraper/core"
import { getApiModule } from "./api/api.module"
import { getConfig } from "./config/config"
import { getDbModule } from "./db/db.module"
import { getLogger } from "./logger"

async function main() {
  const logger = getLogger()

  logger.info(`Starting application at ${new Date().toUTCString()}`)

  const config = getConfig()

  const db = getDbModule(config)

  const api = await getApiModule(db, {
    logger: logger.child({
      api: true,
    }),
  })

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
    const id = uuid()
    const scraper = new Scraper({
      id,
      logger: modules.logger.child({
        scraper: id,
      }),
    })

    try {
      await scraper.run(exampleInstructions) //TODO: remove after testing
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

const acceptCookiesButtonSelector: ScraperSelector = {
  type: SelectorType.FindByTextContent,
  text: /akceptuj wszystkie/i,
  tagName: "button",
}

const loginButtonSelector: ScraperSelector = {
  type: SelectorType.FindByTextContent,
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
      type: ConditionType.IsVisible,
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
      type: ConditionType.IsVisible,
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
