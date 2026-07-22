import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // تفعيل الـ CORS عشان الـ Frontend يعرف يكلم السيرفر
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();