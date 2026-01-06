-- CreateTable
CREATE TABLE "HotArticle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cover" TEXT,
    "wxid" TEXT,
    "mpNickname" TEXT,
    "pubTime" TEXT,
    "publishType" TEXT,
    "position" INTEGER,
    "isOriginal" TEXT,
    "readNum" INTEGER,
    "zanNum" INTEGER,
    "avg" REAL,
    "hot" REAL,
    "fans" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "HotArticle_url_key" ON "HotArticle"("url");
