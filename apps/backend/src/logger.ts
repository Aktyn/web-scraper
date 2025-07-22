import pino from "pino"
import fs from "fs"
import path from "path"
import { cwd } from "./utils"

export function getLogger() {
  const logsDirectory = path.join(cwd(), "logs")
  if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, { recursive: true })
  }

  const today = new Date().toISOString().split("T")[0]
  const logFile = path.join(logsDirectory, `${today}.log`)

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
