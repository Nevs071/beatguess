import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : true;

  app.enableCors({
    origin: allowedOrigins,
  });

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();