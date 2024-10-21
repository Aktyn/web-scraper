import { createContext, useContext } from 'react'
import { noop } from '~/lib/utils'
import { View } from '~/navigation'

export const ViewContext = createContext({
  view: View.DASHBOARD,
  setView: noop as (view: View) => void,
  maximized: false,
})

export function useView() {
  return useContext(ViewContext)
}
