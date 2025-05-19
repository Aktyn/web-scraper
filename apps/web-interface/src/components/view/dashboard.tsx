import { Code } from "../common/code"
import { ScrollArea } from "../shadcn/scroll-area"

export function Dashboard() {
  return (
    <ScrollArea className="w-full overflow-hidden">
      <div className="p-4 flex items-center justify-center min-h-full view-transition">
        <Code>{JSON.stringify(test, null, 2)}</Code>
      </div>
    </ScrollArea>
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
