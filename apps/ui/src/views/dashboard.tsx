import { toast } from 'sonner'
import { Button } from '~/components/ui/button'

export function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full">
      <p>Dashboard</p>
      <Button onClick={() => toast('Hello, world!')}>Test</Button>
    </div>
  )
}
