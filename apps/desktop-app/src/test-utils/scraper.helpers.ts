import { type ScraperMode } from '@web-scraper/common'
import { Scraper } from 'scraper'

export class ExposedScraper<ModeType extends ScraperMode> extends Scraper<ModeType> {
  private getElementValue(selector: `${string} ${'input' | 'select'}`) {
    return this.mainPage
      ?.waitForSelector(selector)
      ?.then((element) => element?.evaluate((input) => input.value))
  }

  public getInputElementValue(selector: `${string} input`) {
    return this.getElementValue(selector)
  }
  public getSelectElementValue(selector: `${string} select`) {
    return this.getElementValue(selector)
  }
}
