import { NestFactory } from '@nestjs/core';
import { loadEnv } from '@configs/environment';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // Load .env dari root monorepo (cari pnpm-workspace.yaml)
  loadEnv();

  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.API_PORT) || 3000;
  await app.listen(port);

  console.log(`API running on http://localhost:${port}`);
}

await bootstrap();
