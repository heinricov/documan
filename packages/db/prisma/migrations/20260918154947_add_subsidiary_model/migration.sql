-- CreateTable
CREATE TABLE "subsidiaries" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subsidiaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subsidiaries_title_key" ON "subsidiaries"("title");

-- CreateIndex
CREATE UNIQUE INDEX "subsidiaries_name_key" ON "subsidiaries"("name");
