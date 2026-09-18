import { Module, OnModuleDestroy } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { prisma } from '@packages/db';
import { HealthModule } from './health/health.module.js';
import { RolesModule } from './modules/roles/role.module.js';
import { UsersModule } from './modules/users/user.module.js';
import { SubsidiariesModule } from './modules/subsidiaries/subsidiary.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { RateLimitGuard } from './common/guards/rate-limit.guard.js';
import { AuthGuard } from './common/guards/auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';

@Module({
  imports: [HealthModule, AuthModule, RolesModule, UsersModule, SubsidiariesModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
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
