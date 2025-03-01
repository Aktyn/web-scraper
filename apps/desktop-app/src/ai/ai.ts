import { Ollama, type ErrorResponse, type GenerateRequest, type GenerateResponse } from 'ollama'

// eslint-disable-next-line @typescript-eslint/naming-convention
export class AI extends Ollama {
  //TODO: set default model

  listModels() {
    return super.list().then((models) => models.models)
  }

  async quickPrompt<Stream extends boolean = false>(
    prompt: string,
    options?: Partial<GenerateRequest & { stream: Stream }>,
  ) {
    const result = await super.generate({
      // model: 'phi4',
      model: 'qwen2.5-coder:32b',
      prompt,
      keep_alive: 60 * 7, // in seconds
      ...options,
      stream: (options?.stream ?? false) as false,
    })
    return result as unknown as Stream extends true
      ? AbortableAsyncIterator<GenerateResponse>
      : GenerateResponse
  }

  static async awaitStream<T extends object>(iterator: AbortableAsyncIterator<T>) {
    const chunks = []
    for await (const chunk of iterator) {
      chunks.push(chunk)
    }
    return chunks
  }
}

export declare class AbortableAsyncIterator<T extends object> {
  private readonly abortController
  private readonly itr
  private readonly doneCallback
  constructor(
    abortController: AbortController,
    itr: AsyncGenerator<T | ErrorResponse>,
    doneCallback: () => void,
  )
  abort(): void
  [Symbol.asyncIterator](): AsyncGenerator<Awaited<T>, void, unknown>
}
