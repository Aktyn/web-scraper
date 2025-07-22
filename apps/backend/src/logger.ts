import pino from "pino"
import fs from "fs"
import path from "path"
import { cwd } from "./utils"

export const LOGS_DIRECTORY = path.join(cwd(), "logs")
if (!fs.existsSync(LOGS_DIRECTORY)) {
  fs.mkdirSync(LOGS_DIRECTORY, { recursive: true })
}

export function getLogger() {
  const today = new Date().toISOString().split("T")[0]
  const logFile = path.join(LOGS_DIRECTORY, `${today}.log`)

  const fileStream = fs.createWriteStream(logFile, { flags: "a" })

  const streams = [{ stream: process.stdout }, { stream: fileStream }]

  return pino(
    {
      level: process.env.LOG_LEVEL || "info",
      depthLimit: 10,
      enabled: true,
      timestamp: true,
      formatters: {
        level: (label) => {
          return { level: label }
        },
        bindings: (_bindings) => {
          return {
            // pid and hostname are excluded
          }
        },
      },
    },
    pino.multistream(streams),
  )
}
