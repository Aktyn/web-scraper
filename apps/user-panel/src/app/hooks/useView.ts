import { useContext } from 'react'
import { ViewContext } from '../context/viewContext'

export function useView() {
  return useContext(ViewContext)
}
