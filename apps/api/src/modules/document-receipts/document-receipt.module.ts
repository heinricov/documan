import { Module } from "@nestjs/common"
import { DocumentReceiptController } from "./document-receipt.controller.js"
import { DocumentReceiptService } from "./document-receipt.service.js"

@Module({
  controllers: [DocumentReceiptController],
  providers: [DocumentReceiptService],
  exports: [DocumentReceiptService],
})
export class DocumentReceiptsModule {}
