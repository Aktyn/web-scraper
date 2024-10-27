-- CreateTable
CREATE TABLE "ScraperJob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "startUrl" TEXT NOT NULL,
    "execution" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ScraperJob_name_key" ON "ScraperJob"("name");
