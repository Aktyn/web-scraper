import {
  ElementSelectorType,
  PageActionType,
  ScraperConditionType,
  type ScraperElementSelectors,
  type ScraperInstructions,
  type ScraperInstructionsExecutionInfo,
  ScraperInstructionsExecutionInfoType,
  ScraperInstructionType,
  ScraperValueType,
  type SimpleLogger,
} from "@web-scraper/common"
import mockServer from "pptr-mock-server"
import type { ResponseOptions } from "pptr-mock-server/dist/handle-request"
import type { Page } from "rebrowser-puppeteer"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { DataBridge, DataBridgeValue } from "./data-helper"
import { Scraper } from "./scraper"

const mockBaseUrl = "http://127.0.0.1:1337"

describe(
  Scraper.name,
  () => {
    let scraper: Scraper

    const mockStore = new Map<string, DataBridgeValue>([
      ["user.name", "mock-user-name"],
      ["user.password", "mock-user-password"],
      ["button.next", "second"],
    ])
    const mockDataBridge: DataBridge = {
      get: async (key) => {
        return mockStore.get(key) ?? null
      },
      set: async (key: string, value) => {
        mockStore.set(key, value)
      },
      setMany: async (dataSourceName: string, items) => {
        for (const item of items) {
          mockStore.set(`${dataSourceName}.${item.columnName}`, item.value)
        }
      },
      delete: async (key: string) => {
        for (const existingKey of mockStore.keys()) {
          if (existingKey.startsWith(key)) {
            mockStore.delete(existingKey)
          }
        }
      },
    }

    type ErrorResultType = Extract<
      ScraperInstructionsExecutionInfo[number],
      {
        type: ScraperInstructionsExecutionInfoType.Error
      }
    >

    const voidLogger = Object.entries(console).reduce(
      (acc, [key, value]) => {
        if (typeof value === "function") {
          acc[key as keyof SimpleLogger] = () => {}
        } else {
          acc[key as keyof SimpleLogger] = value as never
        }
        return acc
      },
      {
        fatal: console.error,
      } as SimpleLogger,
    )

    beforeEach(async () => {
      scraper = new Scraper({
        id: 1,
        name: "test",
        headless: true,
        logger: voidLogger,
      })
    })

    afterEach(async () => {
      try {
        await scraper.destroy()
      } catch {
        //noop
      }
    })

    describe("performs simple page interactions", () => {
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

      const acceptCookiesButtonSelector: ScraperElementSelectors = [
        {
          type: ElementSelectorType.TextContent,
          text: { source: "accept cookies", flags: "i" },
        },
        { type: ElementSelectorType.TagName, tagName: "button" },
      ]

      const loginButtonSelector: ScraperElementSelectors = [
        {
          type: ElementSelectorType.TextContent,
          text: { source: "login", flags: "i" },
        },
        { type: ElementSelectorType.TagName, tagName: "button" },
      ]

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

        // Login if not already logged in
        {
          type: ScraperInstructionType.PageAction,
          action: {
            type: PageActionType.Click,
            selectors: loginButtonSelector,
          },
        },

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
            //TODO: fill login form and finish login process
          ],
        },
      ]

      const mockExecutionInfo: ScraperInstructionsExecutionInfo = [
        {
          type: ScraperInstructionsExecutionInfoType.PageOpened,
          pageIndex: 0,
          portalUrl: undefined,
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            type: ScraperInstructionType.PageAction,
            pageIndex: 0,
            pageUrl: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
            action: {
              type: PageActionType.Navigate,
              url: "http://127.0.0.1:1337/api",
            },
          },
          duration: expect.any(Number) as never,
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            type: ScraperInstructionType.Condition,
            condition: {
              type: ScraperConditionType.IsVisible,
              selectors: [
                {
                  type: ElementSelectorType.TextContent,
                  text: { source: "accept cookies", flags: "i" },
                },
                { type: ElementSelectorType.TagName, tagName: "button" },
              ],
            },
            isMet: true,
          },
          duration: expect.any(Number) as never,
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            type: ScraperInstructionType.PageAction,
            pageIndex: 0,
            pageUrl: "http://127.0.0.1:1337/api",
            action: {
              type: PageActionType.Click,
              selectors: [
                {
                  type: ElementSelectorType.TextContent,
                  text: { source: "accept cookies", flags: "i" },
                },
                { type: ElementSelectorType.TagName, tagName: "button" },
              ],
            },
          },
          duration: expect.any(Number) as never,
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            pageIndex: 0,
            pageUrl: "http://127.0.0.1:1337/api",
            action: {
              type: PageActionType.Click,
              selectors: [
                {
                  type: ElementSelectorType.TextContent,
                  text: { source: "login", flags: "i" },
                },
                { type: ElementSelectorType.TagName, tagName: "button" },
              ],
            },
            type: ScraperInstructionType.PageAction,
          },
          duration: expect.any(Number) as never,
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            type: ScraperInstructionType.Condition,
            condition: {
              type: ScraperConditionType.IsVisible,
              selectors: [
                {
                  type: ElementSelectorType.TextContent,
                  text: { source: "login", flags: "i" },
                },
                { type: ElementSelectorType.TagName, tagName: "button" },
              ],
            },
            isMet: true,
          },
          duration: expect.any(Number) as never,
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            type: ScraperInstructionType.PageAction,
            pageIndex: 0,
            pageUrl: "http://127.0.0.1:1337/api",
            action: {
              type: PageActionType.Click,
              selectors: [
                {
                  type: ElementSelectorType.TextContent,
                  text: { source: "login", flags: "i" },
                },
                { type: ElementSelectorType.TagName, tagName: "button" },
              ],
            },
          },
          duration: expect.any(Number) as never,
        },
        {
          type: ScraperInstructionsExecutionInfoType.Success,
          summary: {
            duration: expect.any(Number) as never,
          },
        },
      ]

      const mockExecutionInfoWithoutCookiesBanner: ScraperInstructionsExecutionInfo =
        [
          {
            type: ScraperInstructionsExecutionInfoType.PageOpened,
            pageIndex: 0,
            portalUrl: undefined,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              pageIndex: 0,
              pageUrl: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
              action: {
                type: PageActionType.Navigate,
                url: "http://127.0.0.1:1337/api",
              },
              type: ScraperInstructionType.PageAction,
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              condition: {
                selectors: [
                  {
                    type: ElementSelectorType.TextContent,
                    text: { source: "accept cookies", flags: "i" },
                  },
                  { type: ElementSelectorType.TagName, tagName: "button" },
                ],
                type: ScraperConditionType.IsVisible,
              },
              isMet: false,
              type: ScraperInstructionType.Condition,
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.PageAction,
              pageIndex: 0,
              pageUrl: "http://127.0.0.1:1337/api",
              action: {
                selectors: [
                  {
                    type: ElementSelectorType.TextContent,
                    text: { source: "login", flags: "i" },
                  },
                  { type: ElementSelectorType.TagName, tagName: "button" },
                ],
                type: PageActionType.Click,
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              condition: {
                selectors: [
                  {
                    type: ElementSelectorType.TextContent,
                    text: { source: "login", flags: "i" },
                  },
                  { type: ElementSelectorType.TagName, tagName: "button" },
                ],
                type: ScraperConditionType.IsVisible,
              },
              isMet: true,
              type: ScraperInstructionType.Condition,
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.PageAction,
              pageIndex: 0,
              pageUrl: "http://127.0.0.1:1337/api",
              action: {
                selectors: [
                  {
                    type: ElementSelectorType.TextContent,
                    text: { source: "login", flags: "i" },
                  },
                  { type: ElementSelectorType.TagName, tagName: "button" },
                ],
                type: PageActionType.Click,
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Success,
            summary: {
              duration: expect.any(Number) as never,
            },
          },
        ]

      it("should execute given instructions", async () => {
        const executionInfo = await scraper
          .execute(mockInstructions, mockDataBridge, {
            pageMiddleware: setupInterceptor,
          })
          .then((res) => res.get())
        expect(executionInfo).toEqual(mockExecutionInfo)
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
          scraper
            .execute(mockInstructions, mockDataBridge, {
              pageMiddleware: setupInterceptor,
            })
            .then((res) => res.get()),
        ).resolves.toEqual(mockExecutionInfoWithoutCookiesBanner)
      }, 60_000)

      it("should return error result if no instructions are provided", async () => {
        await expect(
          scraper.execute([], mockDataBridge).then((res) => res.get()),
        ).resolves.toEqual([
          {
            type: ScraperInstructionsExecutionInfoType.Error,
            errorMessage: "Instructions are empty",
            summary: {
              duration: expect.any(Number) as never,
            },
          },
        ] satisfies ErrorResultType[])
      }, 60_000)

      it("should return error result if first instruction is not a page navigation action", async () => {
        const instructions: ScraperInstructions = [
          { type: ScraperInstructionType.Marker, name: "start" },
        ]

        await expect(
          scraper
            .execute(instructions, mockDataBridge)
            .then((res) => res.get()),
        ).resolves.toEqual([
          {
            type: ScraperInstructionsExecutionInfoType.Error,
            errorMessage: "First instruction must be a navigation action",
            summary: {
              duration: expect.any(Number) as never,
            },
          },
        ] satisfies ErrorResultType[])
      }, 60_000)
    })

    describe("requests data and use it to fill form fields", () => {
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
            selectors: [
              {
                type: ElementSelectorType.Query,
                query: "input[name='username']",
              },
            ],
            value: {
              type: ScraperValueType.ExternalData,
              dataKey: "user.name",
            },
          },
        },
        {
          type: ScraperInstructionType.PageAction,
          action: {
            type: PageActionType.Type,
            selectors: [
              {
                type: ElementSelectorType.Query,
                query: "input[name='password']",
              },
            ],
            value: {
              type: ScraperValueType.ExternalData,
              dataKey: "user.password",
            },
          },
        },
      ]

      const mockExecutionInfo: ScraperInstructionsExecutionInfo = [
        {
          type: ScraperInstructionsExecutionInfoType.PageOpened,
          pageIndex: 0,
          portalUrl: undefined,
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            type: ScraperInstructionType.PageAction,
            pageIndex: 0,
            pageUrl: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
            action: {
              type: PageActionType.Navigate,
              url: "http://127.0.0.1:1337/api",
            },
          },
          duration: expect.any(Number) as never,
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            type: ScraperInstructionType.PageAction,
            pageIndex: 0,
            pageUrl: "http://127.0.0.1:1337/api",
            action: {
              type: PageActionType.Type,
              selectors: [
                {
                  type: ElementSelectorType.Query,
                  query: "input[name='username']",
                },
              ],
              value: {
                type: ScraperValueType.ExternalData,
                dataKey: "user.name",
              },
            },
          },
          duration: expect.any(Number) as never,
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
            pageIndex: 0,
            pageUrl: "http://127.0.0.1:1337/api",
            action: {
              type: PageActionType.Type,
              selectors: [
                {
                  type: ElementSelectorType.Query,
                  query: "input[name='password']",
                },
              ],
              value: {
                type: ScraperValueType.ExternalData,
                dataKey: "user.password",
              },
            },
          },
          duration: expect.any(Number) as never,
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
            duration: expect.any(Number) as never,
          },
        },
      ]

      it("should fill form fields with external data", async () => {
        await expect(
          scraper
            .execute(mockInstructions, mockDataBridge, {
              pageMiddleware: setupInterceptor,
            })
            .then((res) => res.get()),
        ).resolves.toEqual(mockExecutionInfo)
      }, 120_000)
    })

    describe("requests data to check complex conditions", () => {
      const setupInterceptor = async (page: Page) => {
        const mockRequest = await mockServer.init(page as never, {
          baseAppUrl: mockBaseUrl,
          baseApiUrl: mockBaseUrl + "/api",
        })

        const responseConfig: ResponseOptions = {
          body: (_request) => {
            return `<div>
              <button id='first-button'>First button</button>
              <button id='second-button'>Second button</button>
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
          type: ScraperInstructionType.Condition,
          if: {
            type: ScraperConditionType.TextEquals,
            valueSelector: {
              type: ScraperValueType.ExternalData,
              dataKey: "button.next",
            },
            text: "first",
          },
          then: [
            {
              type: ScraperInstructionType.PageAction,
              action: {
                type: PageActionType.Click,
                selectors: [
                  {
                    type: ElementSelectorType.Query,
                    query: "button#first-button",
                  },
                ],
              },
            },
          ],
          else: [
            {
              type: ScraperInstructionType.PageAction,
              action: {
                type: PageActionType.Click,
                selectors: [
                  {
                    type: ElementSelectorType.Query,
                    query: "button#second-button",
                  },
                ],
              },
            },
          ],
        },
      ]

      const mockExecutionInfo: ScraperInstructionsExecutionInfo = [
        {
          type: ScraperInstructionsExecutionInfoType.PageOpened,
          pageIndex: 0,
          portalUrl: undefined,
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            type: ScraperInstructionType.PageAction,
            pageIndex: 0,
            pageUrl: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
            action: {
              type: PageActionType.Navigate,
              url: "http://127.0.0.1:1337/api",
            },
          },
          duration: expect.any(Number) as never,
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            type: ScraperInstructionType.Condition,
            condition: {
              type: ScraperConditionType.TextEquals,
              valueSelector: {
                type: ScraperValueType.ExternalData,
                dataKey: "button.next",
              },
              text: "first",
            },
            isMet: false,
          },
          duration: expect.any(Number) as never,
        },
        {
          type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
          operation: {
            type: "get",
            key: "button.next",
            returnedValue: "second",
          },
        },
        {
          type: ScraperInstructionsExecutionInfoType.Instruction,
          instructionInfo: {
            type: ScraperInstructionType.PageAction,
            pageIndex: 0,
            pageUrl: "http://127.0.0.1:1337/api",
            action: {
              type: PageActionType.Click,
              selectors: [
                {
                  type: ElementSelectorType.Query,
                  query: "button#second-button",
                },
              ],
            },
          },
          duration: expect.any(Number) as never,
        },
        {
          type: ScraperInstructionsExecutionInfoType.Success,
          summary: {
            duration: expect.any(Number) as never,
          },
        },
      ]

      it("should decide which button to click based on external data", async () => {
        await expect(
          scraper
            .execute(mockInstructions, mockDataBridge, {
              pageMiddleware: setupInterceptor,
            })
            .then((res) => res.get()),
        ).resolves.toEqual(mockExecutionInfo)
      }, 120_000)
    })

    describe("saves and deletes data", () => {
      const setupInterceptor = async (page: Page) => {
        const mockRequest = await mockServer.init(page as never, {
          baseAppUrl: mockBaseUrl,
          baseApiUrl: mockBaseUrl + "/api",
        })

        const responseConfig: ResponseOptions = {
          body: (_request) => {
            return `<div>
              <span id='test-text'>Sample Text</span>
              <div data-value='test-attribute'>Element with attribute</div>
            </div>`
          },
          contentType: "text/html",
        }
        mockRequest.on("get", `${mockBaseUrl}/api`, 200, responseConfig)
      }

      it("should save literal data", async () => {
        const mockInstructions: ScraperInstructions = [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: `${mockBaseUrl}/api`,
            },
          },
          {
            type: ScraperInstructionType.SaveData,
            dataKey: "test.literal",
            value: {
              type: ScraperValueType.Literal,
              value: "test-literal-value",
            },
          },
        ]

        const result = await scraper
          .execute(mockInstructions, mockDataBridge, {
            pageMiddleware: setupInterceptor,
          })
          .then((res) => res.get())

        expect(result).toEqual([
          {
            type: ScraperInstructionsExecutionInfoType.PageOpened,
            pageIndex: 0,
            portalUrl: undefined,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.PageAction,
              pageIndex: 0,
              pageUrl: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
              action: {
                type: PageActionType.Navigate,
                url: "http://127.0.0.1:1337/api",
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.SaveData,
              dataKey: "test.literal",
              value: {
                type: ScraperValueType.Literal,
                value: "test-literal-value",
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
            operation: {
              type: "set",
              key: "test.literal",
              value: "test-literal-value",
            },
          },
          {
            type: ScraperInstructionsExecutionInfoType.Success,
            summary: {
              duration: expect.any(Number) as never,
            },
          },
        ] satisfies ScraperInstructionsExecutionInfo)

        expect(await mockDataBridge.get("test.literal")).toBe(
          "test-literal-value",
        )
      }, 60_000)

      it("should save data from external data", async () => {
        const mockInstructions: ScraperInstructions = [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: `${mockBaseUrl}/api`,
            },
          },
          {
            type: ScraperInstructionType.SaveData,
            dataKey: "test.external",
            value: {
              type: ScraperValueType.ExternalData,
              dataKey: "user.name",
            },
          },
        ]

        const result = await scraper
          .execute(mockInstructions, mockDataBridge, {
            pageMiddleware: setupInterceptor,
          })
          .then((res) => res.get())

        expect(result).toEqual([
          {
            type: ScraperInstructionsExecutionInfoType.PageOpened,
            pageIndex: 0,
            portalUrl: undefined,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.PageAction,
              pageIndex: 0,
              pageUrl: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
              action: {
                type: PageActionType.Navigate,
                url: "http://127.0.0.1:1337/api",
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.SaveData,
              dataKey: "test.external",
              value: {
                type: ScraperValueType.ExternalData,
                dataKey: "user.name",
              },
            },
            duration: expect.any(Number) as never,
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
            type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
            operation: {
              type: "set",
              key: "test.external",
              value: "mock-user-name",
            },
          },
          {
            type: ScraperInstructionsExecutionInfoType.Success,
            summary: {
              duration: expect.any(Number) as never,
            },
          },
        ] satisfies ScraperInstructionsExecutionInfo)

        expect(await mockDataBridge.get("test.external")).toBe("mock-user-name")
      }, 60_000)

      it("should save current timestamp", async () => {
        const timestampBefore = Date.now()

        const mockInstructions: ScraperInstructions = [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: `${mockBaseUrl}/api`,
            },
          },
          {
            type: ScraperInstructionType.SaveData,
            dataKey: "test.timestamp",
            value: {
              type: ScraperValueType.CurrentTimestamp,
            },
          },
        ]

        const result = await scraper
          .execute(mockInstructions, mockDataBridge, {
            pageMiddleware: setupInterceptor,
          })
          .then((res) => res.get())

        const timestampAfter = Date.now()

        expect(result).toEqual([
          {
            type: ScraperInstructionsExecutionInfoType.PageOpened,
            pageIndex: 0,
            portalUrl: undefined,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.PageAction,
              pageIndex: 0,
              pageUrl: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
              action: {
                type: PageActionType.Navigate,
                url: "http://127.0.0.1:1337/api",
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.SaveData,
              dataKey: "test.timestamp",
              value: {
                type: ScraperValueType.CurrentTimestamp,
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
            operation: {
              type: "set",
              key: "test.timestamp",
              value: expect.any(String) as never,
            },
          },
          {
            type: ScraperInstructionsExecutionInfoType.Success,
            summary: {
              duration: expect.any(Number) as never,
            },
          },
        ] satisfies ScraperInstructionsExecutionInfo)

        const savedTimestamp = await mockDataBridge.get("test.timestamp")
        expect(savedTimestamp).toBeTruthy()
        const timestamp = parseInt(savedTimestamp?.toString() || "0", 10)
        expect(timestamp).toBeGreaterThanOrEqual(timestampBefore)
        expect(timestamp).toBeLessThanOrEqual(timestampAfter)
      }, 60_000)

      it("should save element text content", async () => {
        const mockInstructions: ScraperInstructions = [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: `${mockBaseUrl}/api`,
            },
          },
          {
            type: ScraperInstructionType.SaveData,
            dataKey: "test.text",
            value: {
              type: ScraperValueType.ElementTextContent,
              selectors: [
                {
                  type: ElementSelectorType.Query,
                  query: "#test-text",
                },
              ],
            },
          },
        ]

        const result = await scraper
          .execute(mockInstructions, mockDataBridge, {
            pageMiddleware: setupInterceptor,
          })
          .then((res) => res.get())

        expect(result).toEqual([
          {
            type: ScraperInstructionsExecutionInfoType.PageOpened,
            pageIndex: 0,
            portalUrl: undefined,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.PageAction,
              pageIndex: 0,
              pageUrl: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
              action: {
                type: PageActionType.Navigate,
                url: "http://127.0.0.1:1337/api",
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.SaveData,
              dataKey: "test.text",
              value: {
                type: ScraperValueType.ElementTextContent,
                selectors: [
                  {
                    type: ElementSelectorType.Query,
                    query: "#test-text",
                  },
                ],
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
            operation: {
              type: "set",
              key: "test.text",
              value: "Sample Text",
            },
          },
          {
            type: ScraperInstructionsExecutionInfoType.Success,
            summary: {
              duration: expect.any(Number) as never,
            },
          },
        ] satisfies ScraperInstructionsExecutionInfo)

        const savedValue = await mockDataBridge.get("test.text")
        expect(savedValue).toBe("Sample Text")
      }, 60_000)

      it("should save element attribute", async () => {
        const mockInstructions: ScraperInstructions = [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: `${mockBaseUrl}/api`,
            },
          },
          {
            type: ScraperInstructionType.SaveData,
            dataKey: "test.attribute",
            value: {
              type: ScraperValueType.ElementAttribute,
              selectors: [
                {
                  type: ElementSelectorType.TextContent,
                  text: "Element with attribute",
                },
                { type: ElementSelectorType.TagName, tagName: "div" },
              ],
              attributeName: "data-value",
            },
          },
        ]

        const result = await scraper
          .execute(mockInstructions, mockDataBridge, {
            pageMiddleware: setupInterceptor,
          })
          .then((res) => res.get())

        expect(result).toEqual([
          {
            type: ScraperInstructionsExecutionInfoType.PageOpened,
            pageIndex: 0,
            portalUrl: undefined,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.PageAction,
              pageIndex: 0,
              pageUrl: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
              action: {
                type: PageActionType.Navigate,
                url: "http://127.0.0.1:1337/api",
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.SaveData,
              dataKey: "test.attribute",
              value: {
                type: ScraperValueType.ElementAttribute,
                selectors: [
                  {
                    type: ElementSelectorType.TextContent,
                    text: "Element with attribute",
                  },
                  { type: ElementSelectorType.TagName, tagName: "div" },
                ],
                attributeName: "data-value",
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
            operation: {
              type: "set",
              key: "test.attribute",
              value: "test-attribute",
            },
          },
          {
            type: ScraperInstructionsExecutionInfoType.Success,
            summary: {
              duration: expect.any(Number) as never,
            },
          },
        ] satisfies ScraperInstructionsExecutionInfo)

        const savedValue = await mockDataBridge.get("test.attribute")
        expect(savedValue).toBe("test-attribute")
      }, 60_000)

      it("should delete existing data", async () => {
        await mockDataBridge.set("test.delete", "value-to-delete")
        expect(await mockDataBridge.get("test.delete")).toBe("value-to-delete")

        const mockInstructions: ScraperInstructions = [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: `${mockBaseUrl}/api`,
            },
          },
          {
            type: ScraperInstructionType.DeleteData,
            dataSourceName: "test",
          },
        ]

        const result = await scraper
          .execute(mockInstructions, mockDataBridge, {
            pageMiddleware: setupInterceptor,
          })
          .then((res) => res.get())

        expect(result).toEqual([
          {
            type: ScraperInstructionsExecutionInfoType.PageOpened,
            pageIndex: 0,
            portalUrl: undefined,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.PageAction,
              pageIndex: 0,
              pageUrl: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
              action: {
                type: PageActionType.Navigate,
                url: "http://127.0.0.1:1337/api",
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.DeleteData,
              dataSourceName: "test",
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
            operation: {
              type: "delete",
              dataSourceName: "test",
            },
          },
          {
            type: ScraperInstructionsExecutionInfoType.Success,
            summary: {
              duration: expect.any(Number) as never,
            },
          },
        ] satisfies ScraperInstructionsExecutionInfo)

        expect(await mockDataBridge.get("test.delete")).toBeNull()
      }, 60_000)

      it("should delete non-existing data without error", async () => {
        // Ensure the key doesn't exist
        expect(await mockDataBridge.get("test.nonexistent")).toBeNull()

        const mockInstructions: ScraperInstructions = [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: `${mockBaseUrl}/api`,
            },
          },
          {
            type: ScraperInstructionType.DeleteData,
            dataSourceName: "nonexistent",
          },
        ]

        const result = await scraper
          .execute(mockInstructions, mockDataBridge, {
            pageMiddleware: setupInterceptor,
          })
          .then((res) => res.get())

        expect(result).toEqual([
          {
            type: ScraperInstructionsExecutionInfoType.PageOpened,
            pageIndex: 0,
            portalUrl: undefined,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.PageAction,
              pageIndex: 0,
              pageUrl: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
              action: {
                type: PageActionType.Navigate,
                url: "http://127.0.0.1:1337/api",
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.DeleteData,
              dataSourceName: "nonexistent",
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
            operation: {
              type: "delete",
              dataSourceName: "nonexistent",
            },
          },
          {
            type: ScraperInstructionsExecutionInfoType.Success,
            summary: {
              duration: expect.any(Number) as never,
            },
          },
        ] satisfies ScraperInstructionsExecutionInfo)

        // Verify key still doesn't exist
        expect(await mockDataBridge.get("test.nonexistent")).toBeNull()
      }, 60_000)

      it("should combine save and delete operations", async () => {
        const mockInstructions: ScraperInstructions = [
          {
            type: ScraperInstructionType.PageAction,
            action: {
              type: PageActionType.Navigate,
              url: `${mockBaseUrl}/api`,
            },
          },
          {
            type: ScraperInstructionType.SaveData,
            dataKey: "test.combined",
            value: {
              type: ScraperValueType.Literal,
              value: "temp-value",
            },
          },
          {
            type: ScraperInstructionType.DeleteData,
            dataSourceName: "test",
          },
        ]

        const result = await scraper
          .execute(mockInstructions, mockDataBridge, {
            pageMiddleware: setupInterceptor,
          })
          .then((res) => res.get())

        expect(result).toEqual([
          {
            type: ScraperInstructionsExecutionInfoType.PageOpened,
            pageIndex: 0,
            portalUrl: undefined,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.PageAction,
              pageIndex: 0,
              pageUrl: { from: "about:blank", to: "http://127.0.0.1:1337/api" },
              action: {
                type: PageActionType.Navigate,
                url: "http://127.0.0.1:1337/api",
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.SaveData,
              dataKey: "test.combined",
              value: {
                type: ScraperValueType.Literal,
                value: "temp-value",
              },
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
            operation: {
              type: "set",
              key: "test.combined",
              value: "temp-value",
            },
          },
          {
            type: ScraperInstructionsExecutionInfoType.Instruction,
            instructionInfo: {
              type: ScraperInstructionType.DeleteData,
              dataSourceName: "test",
            },
            duration: expect.any(Number) as never,
          },
          {
            type: ScraperInstructionsExecutionInfoType.ExternalDataOperation,
            operation: {
              type: "delete",
              dataSourceName: "test",
            },
          },
          {
            type: ScraperInstructionsExecutionInfoType.Success,
            summary: {
              duration: expect.any(Number) as never,
            },
          },
        ] satisfies ScraperInstructionsExecutionInfo)

        // Verify data was saved then deleted
        expect(await mockDataBridge.get("test.combined")).toBeNull()
      }, 60_000)
    })
  },
  600_000,
)
