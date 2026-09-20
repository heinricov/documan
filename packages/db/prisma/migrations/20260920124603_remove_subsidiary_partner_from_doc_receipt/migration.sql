/*
  Warnings:

  - You are about to drop the column `partnerId` on the `document_receipts` table. All the data in the column will be lost.
  - You are about to drop the column `subsidiaryId` on the `document_receipts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "document_receipts" DROP CONSTRAINT "document_receipts_partnerId_fkey";

-- DropForeignKey
ALTER TABLE "document_receipts" DROP CONSTRAINT "document_receipts_subsidiaryId_fkey";

-- AlterTable
ALTER TABLE "document_receipts" DROP COLUMN "partnerId",
DROP COLUMN "subsidiaryId";
