import type { SubscriptionMessage } from "@web-scraper/common"
import EventEmitter from "node:events"

type EventsMap = {
  broadcast: (message: SubscriptionMessage) => void
}

class Emitter extends EventEmitter {
  override emit<K extends keyof EventsMap>(
    event: K,
    ...args: Parameters<EventsMap[K]>
  ) {
    return super.emit(event, ...args)
  }
  override on<K extends keyof EventsMap>(event: K, listener: EventsMap[K]) {
    return super.on(event, listener)
  }
  override off<K extends keyof EventsMap>(event: K, listener: EventsMap[K]) {
    return super.off(event, listener)
  }
}

export function getEventsModule() {
  return new Emitter()
}

export type EventsModule = ReturnType<typeof getEventsModule>
