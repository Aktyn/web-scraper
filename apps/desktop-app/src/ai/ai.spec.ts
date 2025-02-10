import { unquote } from '@web-scraper/common'
import fs from 'fs'
import { type GenerateResponse } from 'ollama'
import path from 'path'
import puppeteer from 'puppeteer'
import { simplifyPageSource } from '../scraper/utils/source.helpers'
import { type AbortableAsyncIterator, AI } from './ai'

const joinStream = (stream: AbortableAsyncIterator<GenerateResponse>) => {
  return AI.awaitStream(stream).then((results) => results.map((chunk) => chunk.response).join(''))
}

describe('AI within its basic functionality', () => {
  const ai = new AI()

  it('should return a list of models', async () => {
    const models = await ai.listModels()
    expect(models.length).toBeGreaterThan(0)
  })

  it('should have phi4 model', async () => {
    const models = await ai.listModels()
    expect(models.some((model) => model.name === 'phi4' || model.name === 'phi4:latest')).toBe(true)
  })

  it('should have deepseek-r1:32b model', async () => {
    const models = await ai.listModels()
    expect(models.some((model) => model.name === 'deepseek-r1:32b')).toBe(true)
  })

  it('should return a response', async () => {
    const response1 = await ai
      .quickPrompt("What is the capital of France? Don't reply with anything else but the answer.")
      .then((res) => res.response.trim())
    expect(response1).toBe('Paris')

    const response2 = await ai
      .quickPrompt('What is the square root of 256? Reply only with the answer.')
      .then((res) => res.response.trim())
    expect(response2.split(/[\s\n]/)[0]).toBe('16')
  }, 120_000)
})

describe('AI given a simplified html', () => {
  const ai = new AI()

  const pageSourcePath = path.join(__dirname, '..', 'test-utils', 'zen-browser-release-notes.html')
  const examplePageSource = fs.readFileSync(pageSourcePath, 'utf-8')
  const simplifiedSource = simplifyPageSource(
    examplePageSource,
    'https://zen-browser.app/release-notes/',
  )
  const systemMessage =
    "You are web assistant that can return only raw data from provided HTML code using the user's query. Don't provide any additional information. Return only requested data. If data is unavailable return: {{N/A}}."

  it(
    'should return an answer about the page',
    async () => {
      const response = await ai
        .quickPrompt(
          `${simplifiedSource}\n\n\nFind and return the latest/highest version number. It should be the first occurrence in the provided HTML code. Return only the exact version string. Output examples: 1.4.17a, 1.2.5b, 1.3.0, 1.6b, 1.5`,
          {
            // model: 'deepseek-r1-scraper',
            system: systemMessage,
            stream: true,
          },
        )
        .then(joinStream)

      console.info('Raw AI response:', response)

      expect(
        unquote(
          response
            .split('\n')
            .filter((line) => line.trim() !== '' && line.trim() !== '```')
            .at(-1) ?? '',
        ),
      ).toBe('1.7.5b')
    },
    1000 * 60 * 20,
  )

  it(
    'should write a javascript code performing requested action',
    async () => {
      const maxAttempts = 10

      let versions: string[] = []
      const browser = await puppeteer.launch({ headless: true })
      for (let attempt = 0; attempt < maxAttempts && !versions.length; attempt++) {
        const response = await ai
          .quickPrompt(
            `${simplifiedSource}\n\n\nCreate a JavaScript function named 'findVersionStrings' that searches the DOM to identify and return a list of all version strings. The function should run in browser and don't receive any arguments. Provided html is as an simplified example. Each version string immediately follows the text 'Release notes for'. Remove any text that comes after version string. Version cannot contain any spaces. Version string can have complex format and contain letters, numbers, dots, dashes, etc. Don't rely on regex but only on the "Release notes for" text preceding the version string. There should be no duplicates in the output list. Write only the function code without providing any examples. Return only the function code.`,
            {
              // model: 'deepseek-r1:32b',
              stream: true,
            },
          )
          .then(joinStream)

        console.info(`Raw AI response [attempt ${attempt + 1}]:`, response)

        const jsCode = response.match(/```(javascript|js)\n([\s\S]*?)\n```/)?.[2] ?? ''

        console.info(`Generated JS code [attempt ${attempt + 1}]:`, jsCode)

        const page = await browser.newPage()
        await page.goto(`file://${pageSourcePath}`)

        try {
          versions = (await page.evaluate(`
            (${jsCode})(\`${escapeBackticks(examplePageSource)}\`)
            `)) as string[]
        } catch (error) {
          console.error(`Error in attempt ${attempt + 1}:`, error)
        }

        await page.close()
      }

      await browser.close()

      console.info('Extracted versions:', versions)
      expect(Array.isArray(versions)).toBe(true)
      expect(versions).toEqual([
        '1.7.5b',
        '1.7.4b',
        '1.7.3b',
        '1.7.2b',
        '1.7.1b',
        '1.7b',
        '1.6b',
        '1.0.2-b.5',
        '1.0.2-b.4',
        '1.0.2-b.3',
        '1.0.2-b.2',
        '1.0.2-b.1',
        '1.0.2-b.0',
        '1.0.1-a.19',
        '1.0.1-a.18',
        '1.0.1-a.17',
        '1.0.1-a.16',
        '1.0.1-a.15',
        '1.0.1-a.14',
        '1.0.1-a.13',
        '1.0.1-a.12',
        '1.0.1-a.11',
        '1.0.1-a.10',
        '1.0.1-a.9',
        '1.0.1-a.8',
        '1.0.1-a.7',
        '1.0.1-a.6',
        '1.0.1-a.5',
        '1.0.1-a.4',
        '1.0.1-a.3',
        '1.0.1-a.2',
        '1.0.1-a',
        '1.0.0-a.39',
        '1.0.0-a.35',
        '1.0.0-a.33',
        '1.0.0-a.30',
        '1.0.0-a.29',
        '1.0.0-a.28',
        '1.0.0-a.26',
        '1.0.0-a.24',
        '1.0.0-a.23',
        '1.0.0-a.17',
        '1.0.0-a.15',
        '1.0.0-a.13',
        '1.0.0-a.12',
        '1.0.0-a.11',
        '1.0.0-a.8',
        '1.0.0-a.7',
        '1.0.0-a.6',
        '1.0.0-a.5',
        '1.0.0-a.4',
        '1.0.0-a.3',
        '1.0.0-a.2',
        '1.0.0-a.1',
      ])

      await browser.close()
    },
    1000 * 60 * 20,
  )
})

function escapeBackticks(str: string) {
  return str.replace(/`/g, '\\`')
}
