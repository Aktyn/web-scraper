import { execSync } from "child_process"
import fs from "fs"
import os from "os"
import path from "path"
import { IS_TEST_ENV } from "./test/is-test-env"
import sea from "node:sea"

function findInPath(executable: string) {
  try {
    const command = process.platform === "win32" ? "where" : "which"
    const result = execSync(`${command} ${executable}`, {
      stdio: ["pipe", "pipe", "ignore"],
      encoding: "utf-8",
    })
    return result.trim().split(/\r?\n/)[0] ?? null
  } catch {
    return null
  }
}

export function getChromeExecutablePath() {
  if (IS_TEST_ENV) {
    return ""
  }

  const executableCandidates = ["chromium-browser", "chromium", "google-chrome"]

  for (const executable of executableCandidates) {
    let foundPath: string | null = null
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (process.platform) {
      case "darwin": {
        const defaultPaths: Record<string, string> = {
          "google-chrome":
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          chromium: "/Applications/Chromium.app/Contents/MacOS/Chromium",
        }
        const defaultPath = defaultPaths[executable]
        if (defaultPath && fs.existsSync(defaultPath)) {
          foundPath = defaultPath
        }
        break
      }
      case "win32": {
        const suffixes: Record<string, string> = {
          "google-chrome": "Google\\Chrome\\Application\\chrome.exe",
          chromium: "Chromium\\Application\\chrome.exe",
        }
        const prefixes = [
          process.env.LOCALAPPDATA,
          process.env.PROGRAMFILES,
          process.env["PROGRAMFILES(X86)"],
        ].filter(Boolean) as string[]

        const suffix = suffixes[executable]
        if (suffix) {
          for (const prefix of prefixes) {
            const chromePath = path.join(prefix, suffix)
            if (fs.existsSync(chromePath)) {
              foundPath = chromePath
              break
            }
          }
        }
        break
      }
      default:
        // For linux and other unix-like systems, we'll just rely on `findInPath`
        break
    }

    foundPath ||= findInPath(executable)
    if (foundPath) {
      return foundPath
    }
  }

  return null
}

export function getUserDataDirectory() {
  if (IS_TEST_ENV) {
    return ""
  }

  const homeDir = os.homedir()
  if (!homeDir) {
    return null
  }

  let pathsToCheck: string[] = []

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (process.platform) {
    case "linux":
      pathsToCheck = [
        path.join(homeDir, ".config", "chromium", "Default"),
        path.join(homeDir, "snap", "chromium", "common", "chromium", "Default"),
        path.join(homeDir, ".config", "google-chrome", "Default"),
        path.join(
          homeDir,
          "snap",
          "google-chrome",
          "common",
          "google-chrome",
          "Default",
        ),
      ]
      break
    case "darwin":
      pathsToCheck = [
        path.join(
          homeDir,
          "Library",
          "Application Support",
          "Chromium",
          "Default",
        ),
        path.join(
          homeDir,
          "Library",
          "Application Support",
          "Google",
          "Chrome",
          "Default",
        ),
      ]
      break
    case "win32": {
      const localAppData = process.env.LOCALAPPDATA
      if (localAppData) {
        pathsToCheck = [
          path.join(localAppData, "Chromium", "User Data", "Default"),
          path.join(localAppData, "Google", "Chrome", "User Data", "Default"),
        ]
      }
      break
    }
  }

  for (const p of pathsToCheck) {
    if (fs.existsSync(p)) {
      return p
    }
  }

  return null
}

export function cwd() {
  if (IS_TEST_ENV) {
    return path.join(__dirname, "..")
  }

  if (sea.isSea()) {
    return __dirname
  }

  if ("__dirname" in globalThis) {
    return path.join(globalThis["__dirname"], "..")
  } else {
    globalThis["__dirname"] = process.cwd()
  }

  return path.resolve(process.cwd())
}
