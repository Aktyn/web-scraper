import { Button } from "@/components/shadcn/button"
import { ScrollArea } from "./components/shadcn/scroll-area"

export default function App() {
  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col items-center justify-center gap-4 p-4">
        <div className="flex flex-col items-stretch max-w-64">
          <img src="/aktyn-icon.png" />
          <img src="/web-scraper-icon.png" />
        </div>
        <p>TODO</p>
        <Button variant="default">Click me</Button>
      </div>
    </ScrollArea>
  )
}
