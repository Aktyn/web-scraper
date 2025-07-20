import path from "node:path"
import fs from "node:fs"
import type { Viewport } from "rebrowser-puppeteer"
import { Jimp, JimpMime, ResizeStrategy } from "jimp"

export type Resolution = Pick<Viewport, "width" | "height">

function calculateSmartResolution(
  { width, height }: Resolution,
  factor = 28,
  minPixels = 56 * 56,
  maxPixels = 14 * 14 * 4 * 1280,
) {
  // Validation
  if (height < factor || width < factor) {
    throw new Error(
      `height:${height} or width:${width} must be larger than factor:${factor}`,
    )
  } else if (Math.max(height, width) / Math.min(height, width) > 200) {
    throw new Error(
      `absolute aspect ratio must be smaller than 200, got ${Math.max(height, width) / Math.min(height, width)}`,
    )
  }

  // Rescale to nearest multiple of factor
  let h_bar = Math.round(height / factor) * factor
  let w_bar = Math.round(width / factor) * factor

  if (h_bar * w_bar > maxPixels) {
    const beta = Math.sqrt((height * width) / maxPixels)
    h_bar = Math.floor(height / beta / factor) * factor
    w_bar = Math.floor(width / beta / factor) * factor
  } else if (h_bar * w_bar < minPixels) {
    const beta = Math.sqrt(minPixels / (height * width))
    h_bar = Math.ceil((height * beta) / factor) * factor
    w_bar = Math.ceil((width * beta) / factor) * factor
  }

  return { width: w_bar, height: h_bar }
}

export async function resizeScreenshot(imageData: Uint8Array): Promise<{
  resizedImageData: Buffer<ArrayBufferLike>
  originalResolution: Resolution
  resizedResolution: Resolution
}> {
  const image = await Jimp.fromBuffer(imageData)

  const originalWidth = image.width
  const originalHeight = image.height
  const { width: resizedWidth, height: resizedHeight } =
    calculateSmartResolution({ width: originalWidth, height: originalHeight })

  const resized = image.resize({
    w: resizedWidth,
    h: resizedHeight,
    mode: ResizeStrategy.HERMITE,
  })

  if (process.env.NODE_ENV === "development") {
    try {
      const outputPath = path.join(process.cwd(), "screenshots")
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true })
      }
      await resized.write(
        path.join(outputPath, "ollama_resized.jpeg") as `${string}.${string}`,
      )
    } catch {
      // noop
    }
  }

  return {
    resizedImageData: await resized.getBuffer(JimpMime.jpeg),
    originalResolution: {
      width: originalWidth,
      height: originalHeight,
    },
    resizedResolution: {
      width: resizedWidth,
      height: resizedHeight,
    },
  }
}
