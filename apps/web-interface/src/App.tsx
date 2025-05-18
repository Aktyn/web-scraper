import { Code } from "./components/common/code"
import { Sidebar } from "./components/layout/sidebar"
import { ScrollArea } from "./components/shadcn/scroll-area"
import { Toaster } from "./components/shadcn/sonner"
import { TooltipProvider } from "./components/shadcn/tooltip"

export default function App() {
  return (
    <TooltipProvider>
      <Sidebar />
      <main className="grow flex flex-col justify-center">
        <ScrollArea className="w-full overflow-hidden">
          <div className="p-4 flex items-center justify-center min-h-full">
            <Code>{JSON.stringify(test, null, 2)}</Code>
          </div>
        </ScrollArea>
      </main>
      <Toaster />
    </TooltipProvider>
  )
}

const test = {
  $schema: "https://turbo.build/schema.json",
  tasks: {
    build: {
      dependsOn: ["^build"],
      outputs: ["dist/**", "lib/**", "!**/node_modules/**"],
    },
    start: {
      dependsOn: ["^build", "build"],
      cache: false,
      persistent: true,
    },
    lint: {},
    test: {
      dependsOn: ["^build"],
    },
    "test:coverage": {
      dependsOn: ["^build"],
    },
    "test:watch": {
      dependsOn: ["^build"],
    },
    typecheck: {
      dependsOn: ["^build"],
    },
    dev: {
      cache: false,
      persistent: true,
    },
  },
}
