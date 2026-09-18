import { Module } from "@nestjs/common"
import { SubsidiaryController } from "./subsidiary.controller.js"
import { SubsidiaryService } from "./subsidiary.service.js"

@Module({
  controllers: [SubsidiaryController],
  providers: [SubsidiaryService],
  exports: [SubsidiaryService],
})
export class SubsidiariesModule {}