-- CreateTable
CREATE TABLE "SiteTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Site" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT,
    "language" TEXT
);

-- CreateTable
CREATE TABLE "SiteTagsRelation" (
    "tagId" INTEGER NOT NULL,
    "siteId" INTEGER NOT NULL,

    PRIMARY KEY ("tagId", "siteId"),
    CONSTRAINT "SiteTagsRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "SiteTag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SiteTagsRelation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "loginOrEmail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "additionalCredentialsData" TEXT,
    "lastUsed" DATETIME,
    "active" BOOLEAN DEFAULT true,
    "siteId" INTEGER NOT NULL,
    CONSTRAINT "Account_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteTag_name_key" ON "SiteTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Site_url_key" ON "Site"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Account_siteId_key" ON "Account"("siteId");

