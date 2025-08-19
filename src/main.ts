import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Optional: if you want to ensure DataSource is available
  const dataSource: DataSource = app.get(DataSource);

  if (!dataSource.isInitialized) {
    console.error('❌ Database connection failed: DataSource not initialized');
    process.exit(1);
  }

  console.log('✅ Database connected successfully');

  const port = process.env.APP_PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 App is running on http://localhost:${port}`);
}
bootstrap();
