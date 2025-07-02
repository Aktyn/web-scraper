import ollama from "ollama"
import type { Resolution } from "./image-processing"

/** This function will throw an error if ollama is not installed */
export async function checkModelAvailability(modelName: string) {
  const list = await ollama.list()

  return list.models.some(
    (model) =>
      model.name.toLowerCase() === modelName.toLowerCase() ||
      model.model.toLowerCase() === modelName.toLowerCase(),
  )
}

export type Coordinates = {
  x: number
  y: number
}

export function getAbsoluteCoordinates(
  coordinates: Coordinates,
  originalResolution: Resolution,
  resizedResolution: Resolution,
) {
  return {
    x: (coordinates.x * originalResolution.width) / resizedResolution.width,
    y: (coordinates.y * originalResolution.height) / resizedResolution.height,
  }
}
