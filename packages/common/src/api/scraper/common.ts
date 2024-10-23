type BaseElementProperties = {
  /**
   * Unique index of the element in simplified page structure\
   * AI will use this index to refer to the element in its response
   */
  id: number
  /**
   * Path to original element in the DOM tree
   */
  element: string
}

/**
 * JSON object containing only the elements and its attributes needed for scraping\
 * The purpose of simplifying the page structure is to reduce the amount of data sent to the AI
 * and to make the response easier to parse maximizing the chance of a correct answer
 */
export type SimplifiedPageStructure = {
  generatedTimestamp: number
  buttons: Array<
    BaseElementProperties & {
      text: string
    }
  >
  links: Array<
    BaseElementProperties & {
      href: URL['href']
      innerText: Array<string>
    }
  >
  inputs: Array<
    BaseElementProperties & {
      label: string
    }
  >
}
