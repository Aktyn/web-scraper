import {
  ElementSelectorType,
  PageActionType,
  ScraperConditionType,
  type ScraperInstructions,
  ScraperInstructionType,
  ScraperValueType,
  SqliteConditionType,
  SystemActionType,
} from "@web-scraper/common"
import type { DbModule } from "../db.module"
import { scraperDataSourcesTable, scrapersTable } from "../schema"
import { sanitizeTableName } from "../schema/helpers"

export async function seedScrapers(db: DbModule) {
  const personalCredentialsTableName = sanitizeTableName(
    "Personal credentials random string",
  )
  const exampleSiteContentTableName = sanitizeTableName(
    "Example test of saving page content",
  )
  const cryptoPricesTableName = sanitizeTableName("Crypto prices")
  const dataMarkersTableName = sanitizeTableName("Data markers")

  await db.transaction(async (tx) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [scraper1, scraper2, scraper3, scraper4, _captchaTesterScraper] =
      await tx
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
            createdAt: new Date(new Date().getTime() + 60_000),
            updatedAt: new Date(new Date().getTime() + 60_000),
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
            description:
              "Saves or updates crypto prices from coinmarketcap.com",
            instructions: scrapCryptoPricesInstructions,
          },
          {
            name: "Captcha tester",
            description:
              "Testing scraper bot detection and solving captchas capabilities",
            instructions: captchaTesterInstructions,
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
        scraperId: scraper2.id,
        sourceAlias: "marker",
        dataStoreTableName: dataMarkersTableName, //Note: it has to be already seeded
        whereSchema: {
          column: "Name",
          condition: SqliteConditionType.ILike,
          value: "Last pepper alert",
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

const checkNewPepperAlertsInstructions: ScraperInstructions = [
  {
    type: ScraperInstructionType.PageAction,
    action: { type: PageActionType.Navigate, url: "https://www.pepper.pl/" },
  },
  {
    type: ScraperInstructionType.Condition,
    if: {
      type: ScraperConditionType.IsVisible,
      selectors: [
        {
          type: ElementSelectorType.TextContent,
          text: { source: "akceptuj wszystkie", flags: "i" },
        },
        { type: ElementSelectorType.TagName, tagName: "button" },
      ],
    },
    then: [
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Click,
          selectors: [
            {
              type: ElementSelectorType.TextContent,
              text: { source: "akceptuj wszystkie", flags: "i" },
            },
            { type: ElementSelectorType.TagName, tagName: "button" },
          ],
        },
      },
    ],
    else: [],
  },
  {
    type: ScraperInstructionType.Condition,
    if: {
      type: ScraperConditionType.IsVisible,
      selectors: [
        {
          type: ElementSelectorType.TextContent,
          text: { source: "zaloguj się", flags: "i" },
        },
        { type: ElementSelectorType.TagName, tagName: "button" },
      ],
    },
    then: [
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Click,
          selectors: [
            {
              type: ElementSelectorType.TextContent,
              text: { source: "zaloguj się", flags: "i" },
            },
            { type: ElementSelectorType.TagName, tagName: "button" },
          ],
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
          value: { type: ScraperValueType.ExternalData, dataKey: "user.email" },
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
              attributes: { type: "submit" },
            },
          ],
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
          type: PageActionType.Click,
          selectors: [
            {
              type: ElementSelectorType.TextContent,
              text: { source: "Zaloguj się", flags: "i" },
            },
            { type: ElementSelectorType.TagName, tagName: "button" },
            {
              type: ElementSelectorType.Attributes,
              attributes: { type: "submit" },
            },
          ],
        },
      },
    ],
    else: [],
  },
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Navigate,
      url: "https://www.pepper.pl/alerts",
    },
  },
  {
    type: ScraperInstructionType.Condition,
    if: {
      type: ScraperConditionType.IsVisible,
      selectors: [
        {
          type: ElementSelectorType.Query,
          query: "#tab-feed > article:first-of-type .thread-title > a",
        },
        { type: ElementSelectorType.TextContent, text: "{{marker.Content}}" },
      ],
    },
    then: [],
    else: [
      {
        type: ScraperInstructionType.SaveData,
        dataKey: "marker.Content",
        value: {
          type: ScraperValueType.ElementTextContent,
          selectors: [
            {
              type: ElementSelectorType.Query,
              query: "#tab-feed > article:first-of-type .thread-title > a",
            },
          ],
        },
      },
      {
        type: ScraperInstructionType.SystemAction,
        systemAction: {
          type: SystemActionType.ShowNotification,
          message: "New pepper alert!",
        },
      },
    ],
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
      type: PageActionType.ScrollToBottom,
    },
  },
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.ScrollToTop,
    },
  },
  {
    type: ScraperInstructionType.Condition,
    if: {
      type: ScraperConditionType.IsVisible,
      selectors: [
        { type: ElementSelectorType.Query, query: "p.coin-item-name" },
        {
          type: ElementSelectorType.TextContent,
          text: "{{crypto.Cryptocurrency}}",
        },
      ],
    },
    then: [
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Click,
          selectors: [
            { type: ElementSelectorType.Query, query: "p.coin-item-name" },
            {
              type: ElementSelectorType.TextContent,
              text: "{{crypto.Cryptocurrency}}",
            },
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
    ],
    else: [
      {
        type: ScraperInstructionType.SaveDataBatch,
        dataSourceName: "crypto",
        items: [
          {
            columnName: "Price",
            value: { type: ScraperValueType.Null },
          },
          {
            columnName: "Last update",
            value: { type: ScraperValueType.CurrentTimestamp },
          },
        ],
      },
    ],
  },
]

const captchaTesterInstructions: ScraperInstructions = [
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Navigate,
      url: "https://www.scrapingcourse.com/cloudflare-challenge",
    },
  },
  {
    type: ScraperInstructionType.Condition,
    if: {
      type: ScraperConditionType.IsVisible,
      selectors: [
        {
          type: ElementSelectorType.TextContent,
          text: "Verify you are human by completing the action below.",
        },
        { type: ElementSelectorType.TagName, tagName: "p" },
      ],
    },
    then: [
      {
        type: ScraperInstructionType.SystemAction,
        systemAction: {
          type: SystemActionType.ShowNotification,
          message: "Captcha not solved :(",
        },
      },
    ],
    else: [
      {
        type: ScraperInstructionType.SystemAction,
        systemAction: {
          type: SystemActionType.ShowNotification,
          message: "Captcha has been solved!!!",
        },
      },
      {
        type: ScraperInstructionType.PageAction,
        action: {
          type: PageActionType.Wait,
          duration: 5000,
        },
      },
    ],
  },
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Navigate,
      url: "https://bot.sannysoft.com",
    },
  },
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Navigate,
      url: "https://fingerprint-scan.com",
    },
  },
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Navigate,
      url: "https://arh.antoinevastel.com/bots/areyouheadless",
    },
  },
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Navigate,
      url: "https://abrahamjuliot.github.io/creepjs",
    },
  },
]
