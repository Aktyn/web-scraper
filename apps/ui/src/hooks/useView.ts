import { useContext } from 'react'
import { ViewContext } from '~/context/view-context'

export function useView() {
  return useContext(ViewContext)
}
