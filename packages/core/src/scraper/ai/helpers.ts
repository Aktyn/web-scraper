import ollama from "ollama"

/** This function will throw an error if ollama is not installed */
export async function checkModelAvailability(modelName: string) {
  const list = await ollama.list()

  return list.models.some(
    (model) =>
      model.name.toLowerCase() === modelName.toLowerCase() ||
      model.model.toLowerCase() === modelName.toLowerCase(),
  )
}
