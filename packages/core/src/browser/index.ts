import puppeteer from "rebrowser-puppeteer"

export async function launchBrowser() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto("https://developer.chrome.com/")

  await page.setViewport({ width: 1280, height: 720 })

  await page.locator("aria/Search").fill("automate beyond recorder")

  await page.locator(".devsite-result-item-link").click()

  const textSelector = await page.locator("text/Customize and automate").waitHandle()
  const fullTitle = await textSelector?.evaluate((el) => el.textContent)

  console.info('The title of this blog post is "%s".', fullTitle)

  await browser.close()
}
