import { Module } from "@nestjs/common"
import { DocumentReceiptDetailController } from "./document-receipt-detail.controller.js"
import { DocumentReceiptDetailService } from "./document-receipt-detail.service.js"

@Module({
  controllers: [DocumentReceiptDetailController],
  providers: [DocumentReceiptDetailService],
  exports: [DocumentReceiptDetailService],
})
export class DocumentReceiptDetailsModule {}
