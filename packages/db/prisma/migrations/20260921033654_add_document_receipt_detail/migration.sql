-- CreateTable
CREATE TABLE "document_receipt_details" (
    "id" UUID NOT NULL,
    "documentReceiptId" UUID NOT NULL,
    "docTypeId" UUID NOT NULL,
    "subsidiaryId" UUID NOT NULL,
    "partnerId" UUID NOT NULL,
    "nomorDoc" TEXT,
    "nomorFaktur" TEXT,
    "nomorPl" TEXT,
    "nomorDo" TEXT,
    "nomorInv" TEXT,
    "nomorPv" TEXT,
    "nomorNota" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_receipt_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "document_receipt_details" ADD CONSTRAINT "document_receipt_details_documentReceiptId_fkey" FOREIGN KEY ("documentReceiptId") REFERENCES "document_receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_receipt_details" ADD CONSTRAINT "document_receipt_details_docTypeId_fkey" FOREIGN KEY ("docTypeId") REFERENCES "doc_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_receipt_details" ADD CONSTRAINT "document_receipt_details_subsidiaryId_fkey" FOREIGN KEY ("subsidiaryId") REFERENCES "subsidiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_receipt_details" ADD CONSTRAINT "document_receipt_details_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
