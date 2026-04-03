import { ElementSelectorType, type SimpleLogger } from "@web-scraper/common"
import puppeteer, { type Browser, type Page } from "rebrowser-puppeteer"
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest"
import type { DataBridge } from "../data-helper"
import type { ExecutionPages } from "./execution-pages"
import type { ScraperExecutionContext } from "./helpers"
import { evaluateHandle, getElementHandle } from "./selectors"

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

const mockDataBridge: DataBridge = {
  getSchema: async () => ({}),
  get: async () => null,
  set: async () => {},
  setMany: async () => {},
  delete: async () => {},
}

describe("selectors", () => {
  let browser: Browser
  let page: Page
  let mockContext: ScraperExecutionContext

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
  })

  afterAll(async () => {
    await browser.close()
  })

  beforeEach(async () => {
    page = await browser.newPage()
    mockContext = {
      logger: voidLogger,
      dataBridge: mockDataBridge,
      pages: {
        getPage: async () => page,
      } as unknown as ExecutionPages,
    } as ScraperExecutionContext
  })

  afterEach(async () => {
    await page.close()
  })

  describe(evaluateHandle.name, () => {
    it("should select an element by Query selector", async () => {
      await page.setContent(`<div id='test-div'>Testing query</div>`)
      const handle = await evaluateHandle(page, mockContext, [
        { type: ElementSelectorType.Query, query: "#test-div" },
      ])
      expect(handle).not.toBeNull()
      const text = await page.evaluate(
        (el) => (el ? el.textContent : null),
        handle,
      )
      expect(text).toBe("Testing query")
    })

    it("should select an element using Sizzle advanced query selector (:contains)", async () => {
      await page.setContent(`
        <button>First Button</button>
        <button id="target">Content Button</button>
      `)
      const handle = await evaluateHandle(page, mockContext, [
        {
          type: ElementSelectorType.Query,
          query: "button:contains('Content')",
        },
      ])
      expect(handle).not.toBeNull()
      const id = await page.evaluate((el) => (el ? el.id : null), handle)
      expect(id).toBe("target")
    })

    it("should select an element by TagName", async () => {
      await page.setContent(`<section>Section content</section>`)
      const handle = await evaluateHandle(page, mockContext, [
        { type: ElementSelectorType.TagName, tagName: "section" },
      ])
      expect(handle).not.toBeNull()
      const text = await page.evaluate(
        (el) => (el ? el.textContent : null),
        handle,
      )
      expect(text).toBe("Section content")
    })

    it("should select an element by TextContent", async () => {
      await page.setContent(`<span>Unique text here</span>`)
      const handle = await evaluateHandle(page, mockContext, [
        { type: ElementSelectorType.TagName, tagName: "span" },
        { type: ElementSelectorType.TextContent, text: "Unique text here" },
      ])
      expect(handle.asElement()).not.toBeNull()
    })

    it("should select an element by Attributes", async () => {
      await page.setContent(`<input data-custom="value123" />`)
      const handle = await evaluateHandle(page, mockContext, [
        { type: ElementSelectorType.TagName, tagName: "input" },
        {
          type: ElementSelectorType.Attributes,
          attributes: { "data-custom": "value123" },
        },
      ])
      expect(handle.asElement()).not.toBeNull()
      const tag = await page.evaluate((el) => (el ? el.tagName : null), handle)
      expect(tag).toBe("INPUT")
    })

    it("should narrow down selection using multiple selectors", async () => {
      await page.setContent(`
        <div class="item">Item 1</div>
        <div class="item target">Item 2</div>
        <span class="item">Item 3</span>
      `)
      const handle = await evaluateHandle(page, mockContext, [
        { type: ElementSelectorType.Query, query: ".item" },
        { type: ElementSelectorType.TagName, tagName: "div" },
        { type: ElementSelectorType.TextContent, text: "Item 2" },
      ])
      expect(handle).not.toBeNull()
      const className = await page.evaluate(
        (el) => (el ? el.className : null),
        handle,
      )
      expect(className).toBe("item target")
    })

    it("should throw an error if multiple elements match", async () => {
      await page.setContent(`
        <button>Btn</button>
        <button>Btn</button>
      `)
      await expect(
        evaluateHandle(page, mockContext, [
          { type: ElementSelectorType.TagName, tagName: "button" },
        ]),
      ).rejects.toThrow("Expected a single element to be found")
    })

    it("should return null if no elements match", async () => {
      await page.setContent(`<div>Hello</div>`)
      const handle = await evaluateHandle(page, mockContext, [
        { type: ElementSelectorType.Query, query: ".does-not-exist" },
      ])
      expect(handle.asElement()).toBeNull()
    })

    it("should filter out invisible elements", async () => {
      await page.setContent(`
        <div id="hidden" style="display:none;">Hidden</div>
        <div id="visible">Visible</div>
      `)
      const handle = await evaluateHandle(page, mockContext, [
        { type: ElementSelectorType.TagName, tagName: "div" },
      ])
      expect(handle).not.toBeNull()
      const id = await page.evaluate((el) => (el ? el.id : null), handle)
      expect(id).toBe("visible")
    })
  })

  describe(getElementHandle.name, () => {
    it("should return an element handle", async () => {
      await page.setContent(`<div class="get-element-target"></div>`)
      const handle = await getElementHandle(
        mockContext,
        [{ type: ElementSelectorType.Query, query: ".get-element-target" }],
        0,
      )
      expect(handle).not.toBeNull()
    })

    it("should return null if not required and no element matches", async () => {
      await page.setContent(`<div></div>`)
      const handle = await getElementHandle(
        mockContext,
        [{ type: ElementSelectorType.Query, query: ".missing" }],
        0,
        false,
      )
      expect(handle).toBeNull()
    })

    it("should throw an error if required but no element matches", async () => {
      await page.setContent(`<div></div>`)
      await expect(
        getElementHandle(
          mockContext,
          [{ type: ElementSelectorType.Query, query: ".missing" }],
          0,
          true,
        ),
      ).rejects.toThrow("Expected a single element to be found")
    })
  })
})
