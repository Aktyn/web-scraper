import {
  type ScraperElementSelector,
  ElementSelectorType,
  type SerializableRegex,
} from "@web-scraper/common"
import type { ElementHandle, Page } from "rebrowser-puppeteer"

export async function getElementHandle(
  page: Page,
  selector: ScraperElementSelector,
): Promise<ElementHandle<Element> | null>
export async function getElementHandle(
  page: Page,
  selector: ScraperElementSelector,
  required: false,
): Promise<ElementHandle<Element> | null>
export async function getElementHandle(
  page: Page,
  selector: ScraperElementSelector,
  required: true,
): Promise<ElementHandle<Element>>

/** Expects a single element to be selected. */
export async function getElementHandle(
  page: Page,
  selector: ScraperElementSelector,
  required = false,
) {
  let elementHandle: ElementHandle<Element> | null = null

  switch (selector.type) {
    case ElementSelectorType.Query: {
      const handle = await page.$(selector.query)
      if (handle) {
        elementHandle = handle.asElement() as ElementHandle<Element>
      }
      break
    }
    case ElementSelectorType.FindByTextContent: {
      const handle = await page.evaluateHandle(
        (tagName, text, args) => {
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

          const elements = Array.from(
            document.querySelectorAll(tagName),
          ).filter(
            (element) =>
              element.checkVisibility() &&
              matchTextContent(element, text) &&
              matchArguments(element, args),
          ) as HTMLElement[]

          if (elements.length > 1) {
            throw new Error(
              "Expected a single element to be found. Found multiple elements matching the condition",
            )
          }
          return elements.at(0) ?? null
        },
        selector.tagName ?? "*",
        selector.text,
        selector.args,
      )
      elementHandle = handle?.asElement() as ElementHandle<Element>
      break
    }
  }

  if (required && !elementHandle) {
    throw new Error(
      "Expected a single element to be found. Found no element matching the condition",
    )
  }

  return elementHandle ?? null
}
