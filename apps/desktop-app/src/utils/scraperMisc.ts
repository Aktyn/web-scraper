import { safePromise, wait } from '@web-scraper/common'
import { launch } from 'puppeteer'

export async function getPagePreview(url: string) {
  //TODO: keep the browser open to speed up consecutive requests or use await ScraperBrowser.instance.waitUntilReady()
  const browser = await launch({
    args: ['--disable-infobars', '--no-default-browser-check'],
    ignoreDefaultArgs: ['--enable-automation', '--enable-blink-features=IdleDetection'],
    headless: 'new', //TODO: verify if this works
    devtools: false,
    handleSIGINT: true,
    ignoreHTTPSErrors: true,
    timeout: 30_000,
    product: 'chrome',
    userDataDir: '',
    defaultViewport: {
      width: 1280,
      height: 720,
      isMobile: false,
      hasTouch: false,
      deviceScaleFactor: 1,
    },
  })
  const page = (await browser.pages())[0] ?? (await browser.newPage())
  await page.goto(url, { timeout: 30_000, waitUntil: 'networkidle0' })

  await wait(200)

  const imageData = await page.screenshot({
    type: 'webp',
    quality: 90,
    encoding: 'base64',
    fullPage: true,
  })

  await safePromise(page.close())
  await safePromise(browser.close())

  return imageData
}
