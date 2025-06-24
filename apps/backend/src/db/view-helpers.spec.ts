import { SqliteConditionType, whereSchemaToSql } from "@web-scraper/common"
import { SQL } from "drizzle-orm"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { setup, type TestModules } from "../test/setup"
import { createTemporaryView, removeTemporaryView } from "./view-helpers"

describe("view-helpers", () => {
  let modules: TestModules

  beforeEach(async () => {
    modules = await setup()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  describe(createTemporaryView.name, () => {
    it("should create a temporary view with correct name and SQL", async () => {
      vi.spyOn(modules.db, "run")

      const sourceTableName = "personal_credentials_random_string"

      const result = await createTemporaryView(
        modules.db,
        sourceTableName,
        whereSchemaToSql({
          column: "origin",
          condition: SqliteConditionType.ILike,
          value: "%pepper.pl%",
        }),
      )
      expect(modules.db.run).toHaveBeenCalledWith(expect.any(SQL))
      expect(result).toMatch(/^temporary_view_.*/)
    })
  })

  describe(removeTemporaryView.name, () => {
    it("should execute DROP VIEW SQL with proper identifier", async () => {
      vi.spyOn(modules.db, "run")

      const viewName = "test_view"

      await removeTemporaryView(modules.db, viewName)
      expect(modules.db.run).toHaveBeenCalledWith(expect.any(SQL))
    })
  })
})
