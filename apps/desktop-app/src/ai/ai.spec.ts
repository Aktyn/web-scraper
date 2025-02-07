import fs from 'fs'
import { type GenerateResponse } from 'ollama'
import path from 'path'
import { simplifyPageSource } from '../scraper/utils/source.helpers'
import { type AbortableAsyncIterator, AI } from './ai'
import { unquote } from '@web-scraper/common'

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

  const examplePageSource = fs.readFileSync(
    path.join(__dirname, '..', 'test-utils', 'zen-browser-release-notes.html'),
    'utf-8',
  )
  const simplifiedSource = simplifyPageSource(
    examplePageSource,
    'https://zen-browser.app/release-notes/',
  )
  const systemMessage =
    "You are web assistant that can return only raw data from provided HTML code using the user's query. Don't provide any additional information. Return only requested data. If data is unavailable return: {{N/A}}."

  // beforeAll(async () => {
  //   console.info('Creating AI model for web scraping...')
  //   const modelfile = `FROM deepseek-r1:32b\nSYSTEM "${systemMessage}"`
  //   //@ts-expect-error deprecated type
  //   const progress = await ai.create({
  //     model: 'deepseek-r1-scraper',
  //     from: 'deepseek-r1:32b',
  //     system: systemMessage,
  //     stream: false,
  //     modelfile: modelfile,
  //   })
  //   console.info('AI model creating status:', progress.status)
  // })

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
})
