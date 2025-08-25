import { z } from "zod"

export function getCoordinatesSchema(width: number, height: number) {
  return z.object({
    x: z
      .int()
      .min(0)
      .max(width)
      .describe("The x coordinate, number of pixels from the left edge"),
    y: z
      .int()
      .min(0)
      .max(height)
      .describe("The y coordinate, number of pixels from the top edge"),
  })
}
