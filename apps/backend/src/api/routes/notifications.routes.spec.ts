import { beforeEach, describe, expect, it, vi } from "vitest"
import { setup, type TestModules } from "../../test/setup"
import { eq } from "drizzle-orm"
import { notificationsTable } from "../../db/schema"

describe("Notifications Routes", () => {
  let modules: TestModules

  beforeEach(async () => {
    modules = await setup()
  })

  describe("GET /notifications", () => {
    it("should return status 200 and paginated notifications", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/notifications",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.length).toBe(50)
      expect(payload.page).toBe(0)
      expect(payload.pageSize).toBe(64)
      expect(payload.hasMore).toBe(false)
    })

    it("should respect pagination parameters", async () => {
      const response = await modules.api.inject({
        method: "GET",
        url: "/notifications?page=1&pageSize=15",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.length).toBe(15)
      expect(payload.page).toBe(1)
      expect(payload.pageSize).toBe(15)
      expect(payload.hasMore).toBe(true)
    })

    it("should return status 200 and hasMore=false on the last page", async () => {
      // 50 items, pageSize=20. page 0 (20), page 1 (20), page 2 (10)
      const response = await modules.api.inject({
        method: "GET",
        url: "/notifications?page=2&pageSize=20",
      })
      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.data.length).toBe(10)
      expect(payload.page).toBe(2)
      expect(payload.pageSize).toBe(20)
      expect(payload.hasMore).toBe(false)
    })

    it("should return 500 if there is a database error", async () => {
      vi.spyOn(modules.db, "select").mockRejectedValue(
        new Error("Database error"),
      )

      const response = await modules.api.inject({
        method: "GET",
        url: "/notifications",
      })

      expect(response.statusCode).toBe(500)
    })
  })

  describe("PATCH /notifications/:id/read", () => {
    it("should return status 200 and the updated notification", async () => {
      const response = await modules.api.inject({
        method: "PATCH",
        url: "/notifications/1/read",
      })

      expect(response.statusCode).toBe(200)
      const payload = JSON.parse(response.payload)
      expect(payload.id).toBe(1)
      expect(payload.read).toBe(true)

      const notificationInDb = await modules.db
        .select()
        .from(notificationsTable)
        .where(eq(notificationsTable.id, 1))
        .get()
      expect(notificationInDb).toBeDefined()
      expect(notificationInDb).toHaveProperty("read", true)
    })

    it("should return 404 if notification does not exist", async () => {
      const response = await modules.api.inject({
        method: "PATCH",
        url: "/notifications/999/read",
      })
      expect(response.statusCode).toBe(404)
    })

    it("should return 500 if there is a database error", async () => {
      vi.spyOn(modules.db, "update").mockRejectedValue(
        new Error("Database error"),
      )

      const response = await modules.api.inject({
        method: "PATCH",
        url: "/notifications/1/read",
      })

      expect(response.statusCode).toBe(500)
    })
  })

  describe("PATCH /notifications/read-all", () => {
    it("should return status 204 and mark all notifications as read", async () => {
      const unreadNotificationsBefore = await modules.db
        .select()
        .from(notificationsTable)
        .where(eq(notificationsTable.read, false))
        .all()
      expect(unreadNotificationsBefore.length).toBeGreaterThan(0)

      const response = await modules.api.inject({
        method: "PATCH",
        url: "/notifications/read-all",
      })

      expect(response.statusCode).toBe(204)

      const unreadNotificationsAfter = await modules.db
        .select()
        .from(notificationsTable)
        .where(eq(notificationsTable.read, false))
        .all()
      expect(unreadNotificationsAfter.length).toBe(0)

      const allNotifications =
        await modules.db.query.notificationsTable.findMany()
      expect(
        allNotifications.every((notification) => notification.read),
      ).toBeTruthy()
    })

    it("should return 500 if there is a database error", async () => {
      vi.spyOn(modules.db, "update").mockRejectedValue(
        new Error("Database error"),
      )

      const response = await modules.api.inject({
        method: "PATCH",
        url: "/notifications/read-all",
      })

      expect(response.statusCode).toBe(500)
    })
  })

  describe("DELETE /notifications/:id", () => {
    it("should return status 204 and delete the notification", async () => {
      const response = await modules.api.inject({
        method: "DELETE",
        url: "/notifications/2",
      })

      expect(response.statusCode).toBe(204)

      const notificationInDb = await modules.db
        .select()
        .from(notificationsTable)
        .where(eq(notificationsTable.id, 2))
        .get()
      expect(notificationInDb).toBeUndefined()
    })

    it("should return 404 if notification does not exist", async () => {
      const response = await modules.api.inject({
        method: "DELETE",
        url: "/notifications/999",
      })
      expect(response.statusCode).toBe(404)
    })

    it("should return 500 if there is a database error", async () => {
      vi.spyOn(modules.db, "delete").mockRejectedValue(
        new Error("Database error"),
      )

      const response = await modules.api.inject({
        method: "DELETE",
        url: "/notifications/1",
      })

      expect(response.statusCode).toBe(500)
    })
  })
})
