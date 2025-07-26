import {
  ElementSelectorType,
  type ScraperElementSelectors,
  type SerializableRegex,
} from "@web-scraper/common"
import type { ElementHandle } from "rebrowser-puppeteer"
import type { ScraperExecutionContext } from "./helpers"
import { replaceSpecialStringsInSelectors } from "../data-helper"

export async function getElementHandle(
  context: ScraperExecutionContext,
  selector: ScraperElementSelectors,
  pageIndex: number,
): Promise<ElementHandle<Element> | null>
export async function getElementHandle(
  context: ScraperExecutionContext,
  selector: ScraperElementSelectors,
  pageIndex: number,
  required: false,
): Promise<ElementHandle<Element> | null>
export async function getElementHandle(
  context: ScraperExecutionContext,
  selector: ScraperElementSelectors,
  pageIndex: number,
  required: true,
): Promise<ElementHandle<Element>>

/** Expects a single element to be selected. */
export async function getElementHandle(
  context: ScraperExecutionContext,
  selectors: ScraperElementSelectors,
  pageIndex: number,
  required = false,
) {
  const page = await context.pages.getPage(pageIndex)

  const elementHandle = (
    await page.evaluateHandle(
      (
        selectorsStringified: string,
        elementSelectorType: typeof ElementSelectorType,
      ) => {
        // -- [START] Helper functions and variables --

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
          elementSelectorType.Query,
          elementSelectorType.TagName,
          elementSelectorType.TextContent,
          elementSelectorType.Attributes,
        ]

        // -- [END] Helper functions and variables --

        const selectors: ScraperElementSelectors =
          JSON.parse(selectorsStringified)

        let elements: HTMLElement[] | null = null

        const sortedSelectors = [...selectors].sort(
          (a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type),
        )

        for (const selector of sortedSelectors) {
          switch (selector.type) {
            case elementSelectorType.Query:
              if (!elements) {
                elements = Array.from(document.querySelectorAll(selector.query))
              } else {
                elements = elements.filter((element) =>
                  element.matches(selector.query),
                )
              }
              break
            case elementSelectorType.TagName: {
              if (!elements) {
                elements = Array.from(
                  document.querySelectorAll(selector.tagName),
                )
              } else {
                elements = elements.filter(
                  (element) => element.tagName === selector.tagName,
                )
              }
              break
            }
            case elementSelectorType.TextContent: {
              if (!elements) {
                elements = Array.from(document.querySelectorAll("*"))
              } else {
                elements = elements.filter((element) =>
                  matchTextContent(element, selector.text),
                )
              }
              break
            }
            case elementSelectorType.Attributes: {
              if (!elements) {
                elements = Array.from(document.querySelectorAll("*"))
              } else {
                elements = elements.filter((element) =>
                  matchArguments(element, selector.attributes),
                )
              }
              break
            }
          }
        }

        elements = (elements ?? []).filter((element) =>
          element.checkVisibility(),
        )

        if (elements.length > 1) {
          throw new Error(
            "Expected a single element to be found. Found multiple elements matching the conditions",
          )
        }
        return elements.at(0) ?? null
      },
      JSON.stringify(
        await replaceSpecialStringsInSelectors(context, selectors),
      ),
      ElementSelectorType,
    )
  )?.asElement() as ElementHandle<Element> | null

  if (required && !elementHandle) {
    throw new Error(
      "Expected a single element to be found. Found no element matching the condition",
    )
  }

  return elementHandle ?? null
}
