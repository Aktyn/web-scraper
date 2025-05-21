import {
  ConditionType,
  PageActionType,
  type ScraperInstructions,
  ScraperInstructionType,
  type ScraperSelector,
  SelectorType,
} from "@web-scraper/common"
import mockServer from "pptr-mock-server"
import type { ResponseOptions } from "pptr-mock-server/dist/handle-request"
import type { Page } from "rebrowser-puppeteer"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { Scraper } from "./scraper"

const mockBaseUrl = "http://127.0.0.1:1337"

describe(Scraper.name, () => {
  let scraper: Scraper

  beforeEach(() => {
    scraper = new Scraper({ headless: true })
  })

  afterEach(() => {
    try {
      scraper.destroy()
    } catch {
      //noop
    }
  })

  const setupInterceptor = async (page: Page) => {
    const mockRequest = await mockServer.init(page as never, {
      baseAppUrl: mockBaseUrl,
      baseApiUrl: mockBaseUrl + "/api",
    })

    const responseConfig: ResponseOptions = {
      body: (_request) => {
        return `<div>
          <button>accept cookies</button>
          <button>login</button>
        </div>`
      },
      contentType: "text/html",
    }
    mockRequest.on("get", `${mockBaseUrl}/api`, 200, responseConfig)
  }

  it("should execute given instructions", async () => {
    await expect(scraper.run(mockInstructions, setupInterceptor)).resolves.not.toThrow()

    //TODO: get report from scraper run and expect it to be correct
  })
})

const acceptCookiesButtonSelector: ScraperSelector = {
  type: SelectorType.FindByTextContent,
  text: /accept cookies/i,
  tagName: "button",
}

const loginButtonSelector: ScraperSelector = {
  type: SelectorType.FindByTextContent,
  text: /login/i,
  tagName: "button",
}

const mockInstructions: ScraperInstructions = [
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Navigate,
      url: `${mockBaseUrl}/api`,
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

  // Login if not already logged in
  {
    type: ScraperInstructionType.PageAction,
    action: {
      type: PageActionType.Click,
      selector: loginButtonSelector,
    },
  },

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
