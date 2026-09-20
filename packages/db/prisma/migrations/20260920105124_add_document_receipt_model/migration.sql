-- CreateTable
CREATE TABLE "document_receipts" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "userId" UUID NOT NULL,
    "docTypeId" UUID NOT NULL,
    "subsidiaryId" UUID NOT NULL,
    "partnerId" UUID NOT NULL,
    "boxId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_receipts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "document_receipts" ADD CONSTRAINT "document_receipts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_receipts" ADD CONSTRAINT "document_receipts_docTypeId_fkey" FOREIGN KEY ("docTypeId") REFERENCES "doc_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_receipts" ADD CONSTRAINT "document_receipts_subsidiaryId_fkey" FOREIGN KEY ("subsidiaryId") REFERENCES "subsidiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_receipts" ADD CONSTRAINT "document_receipts_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_receipts" ADD CONSTRAINT "document_receipts_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "boxes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
