import {
  ConditionType,
  PageActionType,
  type ScraperInstructions,
  type ScraperInstructionsExecutionInfo,
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  type ScraperSelector,
  ScraperValueType,
  SelectorType,
  type SimpleLogger,
} from "@web-scraper/common"
import mockServer from "pptr-mock-server"
import type { ResponseOptions } from "pptr-mock-server/dist/handle-request"
import type { Page } from "rebrowser-puppeteer"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { DataBridge } from "./data-helper"
import { Scraper } from "./scraper"

const mockBaseUrl = "http://127.0.0.1:1337"

describe(
  Scraper.name,
  () => {
    let scraper: Scraper

    const mockStore = new Map<string, string>([
      ["user.name", "mock-user-name"],
      ["user.password", "mock-user-password"],
    ])
    const mockDataBridge: DataBridge = {
      get: async (key) => {
        return mockStore.get(key) ?? null
      },
      set: async (_key, _value) => {
        mockStore.set(_key, _value)
      },
      delete: async (key) => {
        mockStore.delete(key)
      },
    }

    type ErrorResultType = Extract<
      ScraperInstructionsExecutionInfo[number],
      {
        type: ScraperInstructionsExecutionInfoType.Error
      }
    >

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

    describe("perform simple page interactions", () => {
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
          url: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
          duration: expect.any(Number),
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
          url: "http://127.0.0.1:1337/api",
          duration: expect.any(Number),
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
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
          url: "http://127.0.0.1:1337/api",
          duration: expect.any(Number),
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
          url: "http://127.0.0.1:1337/api",
          duration: expect.any(Number),
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
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
          url: "http://127.0.0.1:1337/api",
          duration: expect.any(Number),
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
          url: "http://127.0.0.1:1337/api",
          duration: expect.any(Number),
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
          url: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
          duration: expect.any(Number),
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
          url: "http://127.0.0.1:1337/api",
          duration: expect.any(Number),
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
          url: "http://127.0.0.1:1337/api",
          duration: expect.any(Number),
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
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
          url: "http://127.0.0.1:1337/api",
          duration: expect.any(Number),
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
          url: "http://127.0.0.1:1337/api",
          duration: expect.any(Number),
        },
        {
          type: ScraperInstructionsExecutionInfoType.Success,
          summary: {
            duration: expect.any(Number),
          },
        },
      ]

      it("should execute given instructions", async () => {
        await expect(
          scraper.run(mockInstructions, mockDataBridge, setupInterceptor),
        ).resolves.toEqual(mockExecutionInfo)
      }, 60_000)

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

        await expect(
          scraper.run(mockInstructions, mockDataBridge, setupInterceptor),
        ).resolves.toEqual(mockExecutionInfoWithoutCookiesBanner)
      }, 60_000)

      it("should return error result if no instructions are provided", async () => {
        await expect(scraper.run([], mockDataBridge)).resolves.toEqual([
          {
            type: ScraperInstructionsExecutionInfoType.Error,
            errorMessage: "Instructions are empty",
          },
        ] satisfies ErrorResultType[])
      }, 60_000)

      it("should return error result if first instruction is not a page navigation action", async () => {
        const instructions: ScraperInstructions = [
          { type: ScraperInstructionType.Marker, name: "start" },
        ]

        await expect(scraper.run(instructions, mockDataBridge)).resolves.toEqual([
          {
            type: ScraperInstructionsExecutionInfoType.Error,
            errorMessage: "First instruction must be a navigation action",
          },
        ] satisfies ErrorResultType[])
      }, 60_000)
    })

    describe("request data and use it to fill form fields", () => {
      const setupInterceptor = async (page: Page) => {
        const mockRequest = await mockServer.init(page as never, {
          baseAppUrl: mockBaseUrl,
          baseApiUrl: mockBaseUrl + "/api",
        })

        const responseConfig: ResponseOptions = {
          body: (_request) => {
            return `<div>
              <form id='login-form' action='${mockBaseUrl}/api/login' method='POST'>
                <input type='text' name='username' />
                <input type='password' name='password' />
                <button type='submit'>login</button>
              </form>
            </div>`
          },
          contentType: "text/html",
        }
        mockRequest.on("get", `${mockBaseUrl}/api`, 200, responseConfig)
      }

      const mockInstructions: ScraperInstructions = [
        {
          type: ScraperInstructionType.PageAction,
          action: { type: PageActionType.Navigate, url: `${mockBaseUrl}/api` },
        },
        {
          type: ScraperInstructionType.PageAction,
          action: {
            type: PageActionType.Type,
            selector: { type: SelectorType.Query, query: "input[name='username']" },
            value: {
              type: ScraperValueType.ExternalData,
              key: "user.name",
            },
          },
        },
        {
          type: ScraperInstructionType.PageAction,
          action: {
            type: PageActionType.Type,
            selector: { type: SelectorType.Query, query: "input[name='password']" },
            value: {
              type: ScraperValueType.ExternalData,
              key: "user.password",
            },
          },
        },
      ]

      const mockExecutionInfo: ScraperInstructionsExecutionInfo = [
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            action: { type: PageActionType.Navigate, url: "http://127.0.0.1:1337/api" },
            type: ScraperInstructionType.PageAction,
          },
          url: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
          duration: expect.any(Number),
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Type,
              selector: { type: SelectorType.Query, query: "input[name='username']" },
              value: {
                type: ScraperValueType.ExternalData,
                key: "user.name",
              },
            },
          },
          url: "http://127.0.0.1:1337/api",
          duration: expect.any(Number),
        },
        {
          type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
          operation: {
            type: "get",
            key: "user.name",
            returnedValue: "mock-user-name",
          },
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Type,
              selector: { type: SelectorType.Query, query: "input[name='password']" },
              value: {
                type: ScraperValueType.ExternalData,
                key: "user.password",
              },
            },
          },
          url: "http://127.0.0.1:1337/api",
          duration: expect.any(Number),
        },
        {
          type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
          operation: {
            type: "get",
            key: "user.password",
            returnedValue: "mock-user-password",
          },
        },
        {
          type: ScraperInstructionsExecutionInfoType.Success,
          summary: {
            duration: expect.any(Number),
          },
        },
      ]

      it("should perform login flow", async () => {
        await expect(
          scraper.run(mockInstructions, mockDataBridge, setupInterceptor),
        ).resolves.toEqual(mockExecutionInfo)
      }, 120_000)
    })
  },
  600_000,
)
