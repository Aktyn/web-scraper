import { PropsWithChildren } from 'react'
import { Header } from './header'
import { useView } from '~/hooks/useView'
import { cn } from '~/lib/utils'

export function Layout({ children }: PropsWithChildren) {
  const view = useView()

  return (
    <div
      className={cn(
        'flex flex-col h-screen w-screen bg-background overflow-hidden',
        view.maximized ? 'rounded-none' : 'rounded-lg border',
      )}
    >
      <Header />
      <div className="flex flex-col flex-grow justify-center items-center">{children}</div>
    </div>
  )
}
