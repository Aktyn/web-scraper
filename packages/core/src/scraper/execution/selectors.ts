import {
  ElementSelectorType,
  type ScraperElementSelectors,
  type SerializableRegex,
} from "@web-scraper/common"
import type { Locator, Page } from "playwright"
import { replaceSpecialStringsInSelectors } from "../data-helper"
import type { ScraperExecutionContext } from "./helpers"
import { readFileSync } from "fs"

let sizzleCode = ""
try {
  sizzleCode = readFileSync(
    require.resolve("sizzle/dist/sizzle.min.js"),
    "utf-8",
  )
} catch (error) {
  console.warn("Failed to load Sizzle source code:", error)
}

export async function evaluateHandle(
  page: Page,
  context: Partial<
    Pick<ScraperExecutionContext, "logger" | "pages" | "dataBridge">
  >,
  selectors: ScraperElementSelectors,
): Promise<Locator | null> {
  const replacedSelectors = await replaceSpecialStringsInSelectors(
    context,
    selectors,
  )

  // Pass the enum values as a plain object to avoid SSR serialization issues
  const selectorTypeValues = {
    Query: ElementSelectorType.Query,
    TagName: ElementSelectorType.TagName,
    TextContent: ElementSelectorType.TextContent,
    Attributes: ElementSelectorType.Attributes,
  }

  const handle = await page.evaluateHandle(
    ([selectorsStringified, selectorTypeValues, sizzleCodeRaw]: readonly [
      string,
      Record<string, ElementSelectorType>,
      string,
    ]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any
      if (!win.Sizzle && sizzleCodeRaw) {
        const script = document.createElement("script")
        script.textContent = sizzleCodeRaw
        document.head.appendChild(script)
      }
      const Sizzle = win.Sizzle

      function compareText(
        text: string | null,
        matcher: string | SerializableRegex,
      ) {
        if (typeof matcher === "string") {
          return text === matcher
        }
        const regex = new RegExp(matcher.source, matcher.flags)
        return regex.test(text ?? "")
      }

      function matchTextContent(
        element: Element,
        matcher: string | SerializableRegex,
      ) {
        return compareText(element.textContent, matcher)
      }

      function matchArguments(
        element: Element,
        args?: Record<string, string | SerializableRegex>,
      ) {
        if (!args || Object.keys(args).length === 0) {
          return true
        }
        return Object.entries(args).every(([key, matcher]) => {
          const attributeValue = element.getAttribute(key)
          return compareText(attributeValue, matcher)
        })
      }

      const typeOrder = [
        selectorTypeValues.Query,
        selectorTypeValues.TagName,
        selectorTypeValues.TextContent,
        selectorTypeValues.Attributes,
      ]

      const selectors: ScraperElementSelectors =
        JSON.parse(selectorsStringified)

      let elements: HTMLElement[] | null = null

      const sortedSelectors = [...selectors].sort(
        (a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type),
      )

      for (const selector of sortedSelectors) {
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        switch (selector.type) {
          case selectorTypeValues.Query: {
            const query = (
              selector as { type: ElementSelectorType.Query; query: string }
            ).query
            if (!elements) {
              if (Sizzle) {
                elements = Sizzle(query) as HTMLElement[]
              } else {
                elements = Array.from(document.querySelectorAll(query))
              }
            } else {
              if (Sizzle) {
                elements = Sizzle.matches(query, elements) as HTMLElement[]
              } else {
                elements = elements.filter((element) => element.matches(query))
              }
            }
            break
          }
          case selectorTypeValues.TagName: {
            const tagName = (
              selector as { type: ElementSelectorType.TagName; tagName: string }
            ).tagName
            if (!elements) {
              elements = Array.from(document.querySelectorAll(tagName))
            } else {
              elements = elements.filter(
                (element) =>
                  element.tagName.toLowerCase() === tagName.toLowerCase(),
              )
            }
            break
          }
          case selectorTypeValues.TextContent: {
            const text = (
              selector as {
                type: ElementSelectorType.TextContent
                text: string | SerializableRegex
              }
            ).text
            if (!elements) {
              elements = Array.from(document.querySelectorAll("*"))
            } else {
              elements = elements.filter((element) =>
                matchTextContent(element, text),
              )
            }
            break
          }
          case selectorTypeValues.Attributes: {
            const attributes = (
              selector as {
                type: ElementSelectorType.Attributes
                attributes: Record<string, string | SerializableRegex>
              }
            ).attributes
            if (!elements) {
              elements = Array.from(document.querySelectorAll("*"))
            } else {
              elements = elements.filter((element) =>
                matchArguments(element, attributes),
              )
            }
            break
          }
        }
      }

      elements = (elements ?? []).filter((element) => {
        const el = element as HTMLElement
        return el.offsetParent !== null || el.getClientRects().length > 0
      })

      if (elements.length > 1) {
        throw new Error(
          "Expected a single element to be found. Found multiple elements matching the conditions",
        )
      }
      return elements.at(0) ?? null
    },
    [
      JSON.stringify(replacedSelectors),
      selectorTypeValues,
      sizzleCode,
    ] as const,
  )

  const element = handle.asElement()
  if (!element) return null

  // Create a locator from the element using a unique data attribute
  await element.evaluate((el) => {
    el.setAttribute("data-web-scraper-handle", "true")
  })

  return page.locator('[data-web-scraper-handle="true"]').first()
}

export async function getElementHandle(
  context: ScraperExecutionContext,
  selectors: ScraperElementSelectors,
  pageIndex: number,
): Promise<Locator | null>
export async function getElementHandle(
  context: ScraperExecutionContext,
  selectors: ScraperElementSelectors,
  pageIndex: number,
  required: false,
): Promise<Locator | null>
export async function getElementHandle(
  context: ScraperExecutionContext,
  selectors: ScraperElementSelectors,
  pageIndex: number,
  required: true,
): Promise<Locator>

/** Expects a single element to be selected. */
export async function getElementHandle(
  context: ScraperExecutionContext,
  selectors: ScraperElementSelectors,
  pageIndex: number,
  required = false,
) {
  const page = await context.pages.getPage(pageIndex)

  const element = await evaluateHandle(page, context, selectors)

  if (required && !element) {
    throw new Error(
      "Expected a single element to be found. Found no element matching the condition",
    )
  }

  return element ?? null
}
