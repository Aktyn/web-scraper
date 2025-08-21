import { useCachedState } from "@/hooks/useCachedState"
import type { ReactNode } from "react"
import { createContext, useCallback, useContext } from "react"

const defaultQuickSettings = {
  enableToasts: true,
}

const QuickSettingsContext = createContext({
  settings: defaultQuickSettings,
  setSettings: <Key extends keyof typeof defaultQuickSettings>(
    _key: Key,
    _value: (typeof defaultQuickSettings)[Key],
  ) => {},
})

export function QuickSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, internalSetSettings] = useCachedState(
    "quick-settings",
    defaultQuickSettings,
    localStorage,
  )

  const setSettings = useCallback(
    <Key extends keyof typeof defaultQuickSettings>(
      key: Key,
      value: (typeof defaultQuickSettings)[Key],
    ) => {
      internalSetSettings((prev) => ({ ...prev, [key]: value }))
    },
    [internalSetSettings],
  )

  return (
    <QuickSettingsContext value={{ settings, setSettings }}>
      {children}
    </QuickSettingsContext>
  )
}

export function useQuickSettings() {
  const context = useContext(QuickSettingsContext)
  if (!context) {
    throw new Error(
      "useQuickSettings must be used within a QuickSettingsProvider",
    )
  }
  return context
}
