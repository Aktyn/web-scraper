import args from "args"
import { executeScraperCLI } from "./execute-scraper.command"
import type { CliModuleContext } from "./helpers"
import { type CliArguments, cliOptions } from "./options"

export function getCliModule(context: CliModuleContext) {
  let cancelRun = false

  args
    .options(
      Object.entries(cliOptions).map(([name, option]) => ({
        name,
        description: option.description,
        defaultValue: option.defaultValue,
      })),
    )
    .example(
      "web-scraper --inMemoryDatabase",
      "Use in-memory database. This is useful for testing. Does not generate a database file.",
    )
    .command(
      "execute-scraper",
      "Execute an existing scraper by its name and optional iterator",
      (_, __, _args) => {
        cancelRun = true

        executeScraperCLI(_args as never, context).catch((error) =>
          context.logger.error(error),
        )
      },
    )
    .example(
      'web-scraper execute-scraper --scraper "my-scraper" --iterator "{\\"type\\":\\"entire-set\\",\\"dataSourceName\\":\\"crypto\\"}"',
      "Execute scraper `my-scraper` with given iterator configuration as JSON string",
    )
    .example(
      "web-scraper execute-scraper --scraper /home/me/local-scraper.json",
      "Execute scraper from local JSON file",
    )

  const cliArguments = args.parse(process.argv, {
    version: false,
    name: "Web Scraper",
    mainColor: [],
    subColor: [],
    mri: {},
  }) as CliArguments

  if (
    cliArguments.silent &&
    "child" in context.logger &&
    typeof context.logger.child === "function"
  ) {
    context.logger.level = "silent"
  }

  return { ...cliArguments, cancelRun }
}
