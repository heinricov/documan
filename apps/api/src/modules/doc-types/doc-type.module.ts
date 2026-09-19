import { Module } from "@nestjs/common"
import { DocTypeController } from "./doc-type.controller.js"
import { DocTypeService } from "./doc-type.service.js"

@Module({
  controllers: [DocTypeController],
  providers: [DocTypeService],
  exports: [DocTypeService],
})
export class DocTypesModule {}