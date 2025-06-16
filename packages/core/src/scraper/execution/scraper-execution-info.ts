import type {
  ScraperInstructions,
  ScraperInstructionsExecutionInfo,
} from "@web-scraper/common"
import { EventEmitter } from "node:stream"
import type { DataBridge } from "../data-helper"

interface ScraperExecutionInfoEvents {
  update: (info: ScraperInstructionsExecutionInfo[number]) => void
}

export class ScraperExecutionInfo extends EventEmitter {
  private readonly executionInfo: ScraperInstructionsExecutionInfo = []
  private pushBuffer: ScraperInstructionsExecutionInfo = []

  constructor(
    public readonly instructions: ScraperInstructions,
    public readonly dataBridge: DataBridge,
  ) {
    super()
  }

  push(info: ScraperInstructionsExecutionInfo[number], flush = true) {
    this.executionInfo.push(info)

    if (flush) {
      this.flush()
    }
    this.pushBuffer.push(info)
  }

  flush() {
    for (const info of this.pushBuffer) {
      this.emit("update", info)
    }

    this.pushBuffer = []
  }

  override emit<E extends keyof ScraperExecutionInfoEvents>(
    event: E,
    ...args: Parameters<ScraperExecutionInfoEvents[E]>
  ): boolean {
    return super.emit(event, ...args)
  }

  on<E extends keyof ScraperExecutionInfoEvents>(
    event: E,
    listener: ScraperExecutionInfoEvents[E],
  ) {
    return super.on(event, listener)
  }

  off<E extends keyof ScraperExecutionInfoEvents>(
    event: E,
    listener: ScraperExecutionInfoEvents[E],
  ) {
    return super.off(event, listener)
  }

  get() {
    return this.executionInfo
  }
}
