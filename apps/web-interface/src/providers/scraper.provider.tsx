import type { ScraperType } from "@web-scraper/common"
import { createContext, type PropsWithChildren } from "react"

const ScraperContext = createContext({
  scraper: {} as ScraperType,
})

export function ScraperProvider({
  children,
  scraper,
}: PropsWithChildren<{ scraper: ScraperType }>) {
  return <ScraperContext value={{ scraper }}>{children}</ScraperContext>
}

ScraperProvider.Context = ScraperContext
ScraperProvider.displayName = "ScraperProvider"
