import { Module } from "@nestjs/common"
import { BoxController } from "./box.controller.js"
import { BoxService } from "./box.service.js"

@Module({
  controllers: [BoxController],
  providers: [BoxService],
  exports: [BoxService],
})
export class BoxesModule {}
