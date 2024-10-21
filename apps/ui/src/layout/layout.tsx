import { PropsWithChildren, useEffect } from 'react'
import { useView } from '~/context/view-context'
import { Header } from './header'

export function Layout({ children }: PropsWithChildren) {
  const view = useView()

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('maximized')

    if (view.maximized) {
      root.classList.add('maximized')
    }
  }, [view.maximized])

  return (
    <div className="flex flex-col h-screen w-screen">
      <Header />
      <div className="flex flex-col flex-grow justify-center items-center">{children}</div>
    </div>
  )
}
