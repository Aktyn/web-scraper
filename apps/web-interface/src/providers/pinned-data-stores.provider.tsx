import { type UserDataStore } from "@web-scraper/common"
import { createContext, useCallback, useContext, useState } from "react"

const PinnedDataStoresContext = createContext({
  pinnedDataStores: [] as UserDataStore[],
  pinDataStore: (_dataStore: UserDataStore) => {},
  unpinDataStore: (_dataStore: UserDataStore) => {},
})

export function PinnedDataStoresProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [pinnedDataStores, setPinnedDataStores] = useState<UserDataStore[]>([])

  const pinDataStore = useCallback((dataStore: UserDataStore) => {
    setPinnedDataStores((prev) => [...prev, dataStore])
  }, [])

  const unpinDataStore = useCallback((dataStore: UserDataStore) => {
    setPinnedDataStores((prev) =>
      prev.filter((store) => store.tableName !== dataStore.tableName),
    )
  }, [])

  return (
    <PinnedDataStoresContext
      value={{ pinnedDataStores, pinDataStore, unpinDataStore }}
    >
      {children}
    </PinnedDataStoresContext>
  )
}

export function usePinnedDataStores() {
  return useContext(PinnedDataStoresContext)
}
