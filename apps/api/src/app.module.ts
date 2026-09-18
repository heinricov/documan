import { Module, OnModuleDestroy } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { prisma } from '@packages/db';
import { HealthModule } from './health/health.module.js';
import { RolesModule } from './modules/roles/role.module.js';
import { UsersModule } from './modules/users/user.module.js';
import { SubsidiariesModule } from './modules/subsidiaries/subsidiary.module.js';
import { RateLimitGuard } from './common/guards/rate-limit.guard.js';

@Module({
  imports: [HealthModule, RolesModule, UsersModule, SubsidiariesModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule implements OnModuleDestroy {
  async onModuleDestroy(): Promise<void> {
    await prisma.$disconnect();
  }
}
