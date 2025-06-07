import {
  ElementSelectorType,
  PageActionType,
  ScraperConditionType,
  type ScraperElementSelectors,
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
  const exampleSiteContentTableName = sanitizeTableName(
    "Example test of saving page content",
  )
  const cryptoPricesTableName = sanitizeTableName("Crypto prices")

  await db.transaction(async (tx) => {
    const [scraper1, scraper2, scraper3, scraper4] = await tx
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
        {
          name: "Site content scraper",
          description: "Saves site content to the database",
          instructions: scrapExampleSiteInstructions,
        },
        {
          name: "Update crypto prices",
          description: "Saves or updates crypto prices from coinmarketcap.com",
          instructions: scrapCryptoPricesInstructions,
        },
      ])
      .returning()

    await tx.insert(scraperDataSourcesTable).values([
      {
        scraperId: scraper1.id,
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
        scraperId: scraper2.id,
        sourceAlias: "user",
        dataStoreTableName: personalCredentialsTableName, //Note: it has to be already seeded
        whereSchema: {
          column: "origin",
          condition: SqliteConditionType.ILike,
          value: "%pepper.pl%",
        },
      },
      {
        scraperId: scraper3.id,
        sourceAlias: "Store",
        dataStoreTableName: exampleSiteContentTableName, //Note: it has to be already seeded
      },
      {
        scraperId: scraper4.id,
        sourceAlias: "crypto",
        dataStoreTableName: cryptoPricesTableName, //Note: it has to be already seeded
      },
    ])
  })
}

const acceptCookiesButtonSelector: ScraperElementSelectors = [
  {
    type: ElementSelectorType.TextContent,
    text: { source: "akceptuj wszystkie", flags: "i" },
  },
  { type: ElementSelectorType.TagName, tagName: "button" },
]

const loginButtonSelector: ScraperElementSelectors = [
  {
    type: ElementSelectorType.TextContent,
    text: { source: "zaloguj się", flags: "i" },
  },
  { type: ElementSelectorType.TagName, tagName: "button" },
]

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
      selectors: acceptCookiesButtonSelector,
    },
    then: [
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Click,
          selectors: acceptCookiesButtonSelector,
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
      selectors: loginButtonSelector,
    },
    then: [
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Click,
          selectors: loginButtonSelector,
        },
      },
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Type,
          selectors: [
            {
              type: ElementSelectorType.Query,
              query: "input[type='email'][name='identity']",
            },
          ],
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
          selectors: [
            {
              type: ElementSelectorType.TextContent,
              text: { source: "Kontynuuj", flags: "i" },
            },
            { type: ElementSelectorType.TagName, tagName: "button" },
            {
              type: ElementSelectorType.Attributes,
              attributes: {
                type: "submit",
              },
            },
          ],
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
          selectors: [
            {
              type: ElementSelectorType.Query,
              query: "input[type='password'][name='password']",
            },
          ],
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
          selectors: [
            {
              type: ElementSelectorType.Query,
              query: "input[type='password'][name='password'] + span>button",
            },
          ],
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
          selectors: [
            {
              type: ElementSelectorType.TextContent,
              text: { source: "Zaloguj się", flags: "i" },
            },
            { type: ElementSelectorType.TagName, tagName: "button" },
            {
              type: ElementSelectorType.Attributes,
              attributes: {
                type: "submit",
              },
            },
          ],
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

const scrapExampleSiteInstructions: ScraperInstructions = [
  {
    type: ScraperInstructionType.PageAction,
    action: { type: PageActionType.Navigate, url: "https://example.com" },
  },
  {
    type: ScraperInstructionType.SaveDataBatch,
    dataSourceName: "Store",
    items: [
      {
        columnName: "Scraper text",
        value: {
          type: ScraperValueType.ElementTextContent,
          selectors: [
            {
              type: ElementSelectorType.Query,
              query: "body > div:nth-child(1) > p:nth-child(2)",
            },
          ],
        },
      },
      {
        columnName: "Update time",
        value: { type: ScraperValueType.CurrentTimestamp },
      },
    ],
  },
  {
    type: ScraperInstructionType.PageAction,
    action: { type: PageActionType.Wait, duration: 10_000 },
  },
]

const scrapCryptoPricesInstructions: ScraperInstructions = [
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Navigate,
      url: "https://coinmarketcap.com/",
    },
  },
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Click,
      selectors: [
        {
          type: ElementSelectorType.TextContent,
          text: "{{crypto.Cryptocurrency}}",
        },
        { type: ElementSelectorType.TagName, tagName: "p" },
      ],
    },
  },
  {
    type: ScraperInstructionType.SaveDataBatch,
    dataSourceName: "crypto",
    items: [
      {
        columnName: "Price",
        value: {
          type: ScraperValueType.ElementTextContent,
          selectors: [
            {
              type: ElementSelectorType.Query,
              query: "#section-coin-overview > div:nth-child(2) > span",
            },
          ],
        },
      },
      {
        columnName: "Last update",
        value: { type: ScraperValueType.CurrentTimestamp },
      },
    ],
  },
]
