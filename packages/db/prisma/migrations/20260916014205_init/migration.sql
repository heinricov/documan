-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_title_key" ON "roles"("title");
