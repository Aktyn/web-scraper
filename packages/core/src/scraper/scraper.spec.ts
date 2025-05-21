import {
  ConditionType,
  PageActionType,
  type ScraperInstructions,
  type ScraperInstructionsExecutionInfo,
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  type ScraperSelector,
  SelectorType,
  type SimpleLogger,
} from "@web-scraper/common"
import mockServer from "pptr-mock-server"
import type { ResponseOptions } from "pptr-mock-server/dist/handle-request"
import type { Page } from "rebrowser-puppeteer"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { Scraper } from "./scraper"

const mockBaseUrl = "http://127.0.0.1:1337"

describe(
  Scraper.name,
  () => {
    let scraper: Scraper

    const voidLogger = Object.entries(console).reduce((acc, [key, value]) => {
      if (typeof value === "function") {
        acc[key as keyof SimpleLogger] = () => {}
      } else {
        acc[key as keyof SimpleLogger] = value as never
      }
      return acc
    }, {} as SimpleLogger)

    beforeEach(() => {
      scraper = new Scraper({ headless: true, logger: voidLogger })
    })

    afterEach(() => {
      try {
        scraper.destroy()
      } catch {
        //noop
      }
    })

    it("should execute given instructions", async () => {
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

      await expect(scraper.run(mockInstructions, setupInterceptor)).resolves.toEqual(
        mockExecutionInfo,
      )
    }, 120_000)

    it("should execute given instructions and result depending on page state", async () => {
      const setupInterceptor = async (page: Page) => {
        const mockRequest = await mockServer.init(page as never, {
          baseAppUrl: mockBaseUrl,
          baseApiUrl: mockBaseUrl + "/api",
        })

        const responseConfig: ResponseOptions = {
          body: (_request) => {
            return `<div>
            <!-- <button>accept cookies</button> -->
            <button>login</button>
          </div>`
          },
          contentType: "text/html",
        }
        mockRequest.on("get", `${mockBaseUrl}/api`, 200, responseConfig)
      }

      await expect(scraper.run(mockInstructions, setupInterceptor)).resolves.toEqual(
        mockExecutionInfoWithoutCookiesBanner,
      )
    }, 120_000)
  },
  600_000,
)

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

const mockExecutionInfo: ScraperInstructionsExecutionInfo = [
  {
    type: ScraperInstructionsExecutionInfoType.Instruction,
    instructionInfo: {
      action: {
        type: PageActionType.Navigate,
        url: "http://127.0.0.1:1337/api",
      },
      type: ScraperInstructionType.PageAction,
    },
  },
  {
    type: ScraperInstructionsExecutionInfoType.Instruction,
    instructionInfo: {
      condition: {
        selector: {
          tagName: "button",
          text: /accept cookies/i,
          type: SelectorType.FindByTextContent,
        },
        type: ConditionType.IsVisible,
      },
      isMet: true,
      type: ScraperInstructionType.Condition,
    },
  },
  {
    instructionInfo: {
      action: {
        selector: {
          tagName: "button",
          text: /accept cookies/i,
          type: SelectorType.FindByTextContent,
        },
        type: PageActionType.Click,
      },
      type: ScraperInstructionType.PageAction,
    },
    type: ScraperInstructionsExecutionInfoType.Instruction,
  },
  {
    instructionInfo: {
      action: {
        selector: {
          tagName: "button",
          text: /login/i,
          type: SelectorType.FindByTextContent,
        },
        type: PageActionType.Click,
      },
      type: ScraperInstructionType.PageAction,
    },
    type: ScraperInstructionsExecutionInfoType.Instruction,
  },
  {
    instructionInfo: {
      condition: {
        selector: {
          tagName: "button",
          text: /login/i,
          type: SelectorType.FindByTextContent,
        },
        type: ConditionType.IsVisible,
      },
      isMet: true,
      type: ScraperInstructionType.Condition,
    },
    type: ScraperInstructionsExecutionInfoType.Instruction,
  },
  {
    type: ScraperInstructionsExecutionInfoType.Instruction,
    instructionInfo: {
      action: {
        selector: {
          tagName: "button",
          text: /login/i,
          type: SelectorType.FindByTextContent,
        },
        type: PageActionType.Click,
      },
      type: ScraperInstructionType.PageAction,
    },
  },
  {
    type: ScraperInstructionsExecutionInfoType.Success,
    summary: {
      duration: expect.any(Number),
    },
  },
]

const mockExecutionInfoWithoutCookiesBanner: ScraperInstructionsExecutionInfo = [
  {
    type: ScraperInstructionsExecutionInfoType.Instruction,
    instructionInfo: {
      action: {
        type: PageActionType.Navigate,
        url: "http://127.0.0.1:1337/api",
      },
      type: ScraperInstructionType.PageAction,
    },
  },
  {
    type: ScraperInstructionsExecutionInfoType.Instruction,
    instructionInfo: {
      condition: {
        selector: {
          tagName: "button",
          text: /accept cookies/i,
          type: SelectorType.FindByTextContent,
        },
        type: ConditionType.IsVisible,
      },
      isMet: false,
      type: ScraperInstructionType.Condition,
    },
  },
  {
    instructionInfo: {
      action: {
        selector: {
          tagName: "button",
          text: /login/i,
          type: SelectorType.FindByTextContent,
        },
        type: PageActionType.Click,
      },
      type: ScraperInstructionType.PageAction,
    },
    type: ScraperInstructionsExecutionInfoType.Instruction,
  },
  {
    instructionInfo: {
      condition: {
        selector: {
          tagName: "button",
          text: /login/i,
          type: SelectorType.FindByTextContent,
        },
        type: ConditionType.IsVisible,
      },
      isMet: true,
      type: ScraperInstructionType.Condition,
    },
    type: ScraperInstructionsExecutionInfoType.Instruction,
  },
  {
    type: ScraperInstructionsExecutionInfoType.Instruction,
    instructionInfo: {
      action: {
        selector: {
          tagName: "button",
          text: /login/i,
          type: SelectorType.FindByTextContent,
        },
        type: PageActionType.Click,
      },
      type: ScraperInstructionType.PageAction,
    },
  },
  {
    type: ScraperInstructionsExecutionInfoType.Success,
    summary: {
      duration: expect.any(Number),
    },
  },
]
