import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidationPipeConfig } from '@Configs/validation-pipe.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe(
      configService.get<ValidationPipeConfig>('validationPipe'),
    ),
  );
  app.enableCors();
  await app.listen(process.env.APP_PORT);
}

bootstrap();
