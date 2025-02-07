import * as cheerio from 'cheerio'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prettifyXml = require('prettify-xml')

export function simplifyPageSource(pageSource: string, baseURI: string, maxOutputLength = 16_384) {
  const $ = cheerio.load(removeEmptyLines(pageSource), {
    xml: true,
    baseURI,
  })

  $('meta, link, script, style, iframe, video, audio, canvas, footer, svg').remove()
  $('[hidden]').remove()

  $('*').each((_, element) => {
    $(element).removeAttr(
      'style class aria-* tabindex draggable loading width height decoding sizes srcset crossorigin referrerpolicy',
    )
  })

  const formElementSelector = 'input, textarea, select, button, a'

  $('*').each((_, element) => {
    const $element = $(element)
    if ($element.is(formElementSelector)) {
      return
    }

    const hasText = $element.text().trim() !== ''
    const hasFormChildren = $element.find(formElementSelector).length > 0

    if (!hasText && !hasFormChildren) {
      $element.remove()
    }
  })

  let currentHtml = formatHTML($.html())
  if (currentHtml.length > maxOutputLength) {
    const elements = $('*').get().reverse()

    for (const element of elements) {
      const $element = $(element)

      if ($element.is('html, head, body')) {
        continue
      }

      const parent = $element.parent()
      $element.remove()

      let currentParent = parent
      while (currentParent.length > 0 && currentParent.children().length === 0) {
        const nextParent = currentParent.parent()
        currentParent.remove()
        currentParent = nextParent
      }

      currentHtml = formatHTML($.html())
      if (currentHtml.length <= maxOutputLength) {
        break
      }
    }
  }

  return currentHtml
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function formatHTML(html: string) {
  try {
    return prettifyXml(html, { indent: 2, newline: '\n' })
  } catch {
    console.error('Error formatting HTML', html)
    return html
  }
}

function removeEmptyLines(html: string) {
  return html
    .split('\n')
    .filter((line) => line.replace(/^\s*(.*)\s*$/g, '$1') !== '')
    .join('\n')
}
