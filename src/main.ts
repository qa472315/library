import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser  from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Library API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  // CORS（如果前後端不同網域）
  // app.enableCors({
  //   origin: 'http://localhost:5173',
  //   credentials: true,
  // });
  const document = SwaggerModule.createDocument(app, config);
  await app.listen(process.env.PORT ?? 3000);
  const configService = new ConfigService();
  console.log('DB:', {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    db: configService.get('DB_NAME'),
  });
  console.log({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    db: process.env.DB_NAME,
  });
}
bootstrap();
