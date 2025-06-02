import {
  ElementSelectorType,
  PageActionType,
  ScraperConditionType,
  type ScraperElementSelector,
  type ScraperInstructions,
  ScraperInstructionType,
  ScraperValueType,
  SqliteConditionType,
} from "@web-scraper/common"
import type { DbModule } from "../db.module"
import { scraperDataSourcesTable, scrapersTable } from "../schema"
import { sanitizeTableName } from "../schema/helpers"

export async function seedScrapersStores(db: DbModule) {
  const personalCredentialsTableName = sanitizeTableName(
    "Personal credentials random string",
  )

  await db.transaction(async (tx) => {
    const [smallScraper, bigScraper] = await tx
      .insert(scrapersTable)
      .values([
        {
          name: "Small example scraper",
          instructions: [
            {
              type: ScraperInstructionType.PageAction,
              action: {
                type: PageActionType.Navigate,
                url: "https://example.com",
              },
            },
          ],
          userDataDirectory: "/tmp/user-data-dir",
        },
        {
          name: "New pepper alerts",
          description:
            "See if there are new pepper alerts and notify user if so",
          instructions: checkNewPepperAlertsInstructions,
        },
      ])
      .returning()

    await tx.insert(scraperDataSourcesTable).values([
      {
        scraperId: smallScraper.id,
        sourceAlias: "foo",
        dataStoreTableName: personalCredentialsTableName, //Note: it has to be already seeded
        whereSchema: {
          and: [
            {
              column: "username",
              condition: SqliteConditionType.NotEquals,
              value: "any value that is not noop",
            },
            {
              column: "email",
              condition: SqliteConditionType.Equals,
              value: "noop@gmail.com",
            },
          ],
        },
      },
      {
        scraperId: bigScraper.id,
        sourceAlias: "user",
        dataStoreTableName: personalCredentialsTableName, //Note: it has to be already seeded
        whereSchema: {
          column: "origin",
          condition: SqliteConditionType.ILike,
          value: "%pepper.pl%",
        },
      },
    ])
  })
}

const acceptCookiesButtonSelector: ScraperElementSelector = {
  type: ElementSelectorType.FindByTextContent,
  text: { source: "akceptuj wszystkie", flags: "i" },
  tagName: "button",
}

const loginButtonSelector: ScraperElementSelector = {
  type: ElementSelectorType.FindByTextContent,
  text: { source: "zaloguj się", flags: "i" },
  tagName: "button",
}

const checkNewPepperAlertsInstructions: ScraperInstructions = [
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
            text: { source: "Kontynuuj", flags: "i" },
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
            text: { source: "Zaloguj się", flags: "i" },
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
