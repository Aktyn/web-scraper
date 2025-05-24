import "dotenv/config"

import {
  ElementSelectorType,
  PageActionType,
  ScraperConditionType,
  ScraperInstructionType,
  ScraperValueType,
  SqliteConditionType,
  uuid,
  type ScraperElementSelector,
  type ScraperInstructions,
} from "@web-scraper/common"
import { Scraper } from "@web-scraper/core"
import { getApiModule } from "./api/api.module"
import { getConfig } from "./config/config"
import { DataBridge, DataBridgeSourceType } from "./db/data-bridge"
import { getDbModule } from "./db/db.module"
import { createTemporaryView, removeTemporaryView, whereSchemaToSql } from "./db/view-helpers"
import { getLogger } from "./logger"
import path from "path"

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
  .then(async ({ db, logger }) => {
    //TODO: if scraper will run iteratively (for example for each row in some subset of data) then DataBridge should keep track of the current row index

    const dataBridge = new DataBridge(db, {
      user: {
        type: DataBridgeSourceType.TemporaryView,
        name: await createTemporaryView(
          db,
          "personal_credentials_random_string",
          whereSchemaToSql({
            column: "origin",
            condition: SqliteConditionType.ILike,
            value: "%pepper.pl%",
          }),
        ),
      },
    })

    const id = uuid()
    const scraper = new Scraper({
      id,
      logger: logger.child({
        scraper: id,
      }),
      userDataDir: path.join(__dirname, "..", "userData"),
    })

    try {
      //TODO: remove after testing
      await scraper.run(exampleInstructions, dataBridge, {
        leavePageOpen: true,
      })
      logger.info("Scraper run finished")
    } catch (error) {
      logger.error(error)
    } finally {
      // await scraper.destroy()

      for (const source of Object.values(dataBridge.dataSources)) {
        if (source.type === DataBridgeSourceType.TemporaryView) {
          await removeTemporaryView(db, source.name)
        }
      }
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
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Type,
          selector: {
            type: ElementSelectorType.Query,
            query: "input[type='email'][name='identity']",
          },
          value: {
            type: ScraperValueType.ExternalData,
            dataKey: "user.email",
          },
        },
      },
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Wait,
          duration: 500,
        },
      },
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Click,
          selector: {
            type: ElementSelectorType.FindByTextContent,
            text: /Kontynuuj/i,
            tagName: "button",
            args: {
              type: "submit",
            },
          },
        },
      },
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Wait,
          duration: 500,
        },
      },
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Type,
          selector: {
            type: ElementSelectorType.Query,
            query: "input[type='password'][name='password']",
          },
          value: {
            type: ScraperValueType.ExternalData,
            dataKey: "user.password",
          },
        },
      },
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Wait,
          duration: 500,
        },
      },
      //Click show password button
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Click,
          selector: {
            type: ElementSelectorType.Query,
            query: "input[type='password'][name='password'] + span>button",
          },
        },
      },
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Wait,
          duration: 500,
        },
      },

      //Click login button
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Click,
          selector: {
            type: ElementSelectorType.FindByTextContent,
            text: /Zaloguj się/i,
            tagName: "button",
            args: {
              type: "submit",
            },
          },
        },
      },
    ],
  },

  //Navigate to alerts list
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Navigate,
      url: "https://www.pepper.pl/alerts",
    },
  },
]
