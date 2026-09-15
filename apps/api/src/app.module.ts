import { Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { RateLimitGuard } from "./common/guards/rate-limit.guard.js"

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule {}