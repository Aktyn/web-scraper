import { type ScraperSelector, SelectorType } from "@web-scraper/common"
import type { ElementHandle, Page } from "rebrowser-puppeteer"

export async function getElementHandle(
  page: Page,
  selector: ScraperSelector,
): Promise<ElementHandle<Element> | null>
export async function getElementHandle(
  page: Page,
  selector: ScraperSelector,
  required: false,
): Promise<ElementHandle<Element> | null>
export async function getElementHandle(
  page: Page,
  selector: ScraperSelector,
  required: true,
): Promise<ElementHandle<Element>>

/** Expects a single element to be selected. */
export async function getElementHandle(page: Page, selector: ScraperSelector, required = false) {
  let elementHandle: ElementHandle<Element> | null = null

  switch (selector.type) {
    case SelectorType.Query: {
      const handle = await page.$(selector.query)
      if (handle) {
        elementHandle = handle.asElement() as ElementHandle<Element>
      }
      break
    }
    case SelectorType.FindByTextContent: {
      const handle = await page.evaluateHandle(
        (tagName, text) => {
          const matcher = typeof text === "string" ? text : new RegExp(text.source, text.flags)

          function matchTextContent(element: Element, matcher: string | RegExp) {
            if (matcher instanceof RegExp) {
              return matcher.test(element.textContent ?? "")
            }
            return element.textContent === matcher
          }

          const elements = Array.from(document.querySelectorAll(tagName)).filter(
            (element) => element.checkVisibility() && matchTextContent(element, matcher),
          ) as HTMLElement[]

          if (elements.length > 1) {
            throw new Error(
              "Expected a single element to be selected. Found multiple elements matching the condition",
            )
          }
          return elements.at(0) ?? null
        },
        selector.tagName ?? "*",
        selector.text instanceof RegExp
          ? { source: selector.text.source, flags: selector.text.flags }
          : selector.text,
      )
      elementHandle = handle?.asElement() as ElementHandle<Element>
      break
    }
  }

  if (required && !elementHandle) {
    throw new Error(
      "Expected a single element to be selected. Found no elements matching the condition",
    )
  }

  return elementHandle ?? null
}
