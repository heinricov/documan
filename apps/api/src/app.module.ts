import { Module, OnModuleDestroy } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { prisma } from '@packages/db';
import { HealthModule } from './health/health.module.js';
import { RolesModule } from './modules/roles/role.module.js';
import { UsersModule } from './modules/users/user.module.js';
import { SubsidiariesModule } from './modules/subsidiaries/subsidiary.module.js';
import { DocTypesModule } from './modules/doc-types/doc-type.module.js';
import { PartnersModule } from './modules/partners/partner.module.js';
import { BoxesModule } from './modules/boxes/box.module.js';
import { DocumentReceiptsModule } from './modules/document-receipts/document-receipt.module.js';
import { DocumentReceiptDetailsModule } from './modules/document-receipt-details/document-receipt-detail.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { RateLimitGuard } from './common/guards/rate-limit.guard.js';
import { AuthGuard } from './common/guards/auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { RATE_LIMIT_STORE } from './common/rate-limit/store.js';
import { InMemoryRateLimitStore } from './common/rate-limit/in-memory-store.js';

@Module({
  imports: [HealthModule, AuthModule, RolesModule, UsersModule, SubsidiariesModule, DocTypesModule, PartnersModule, BoxesModule, DocumentReceiptsModule, DocumentReceiptDetailsModule],
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
    {
      provide: RATE_LIMIT_STORE,
      useClass: InMemoryRateLimitStore,
    },
  ],
})
export class AppModule implements OnModuleDestroy {
  async onModuleDestroy(): Promise<void> {
    await prisma.$disconnect();
  }
}
