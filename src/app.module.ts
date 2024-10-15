import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoutesModule } from './routes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configs } from './Config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { FileUploadConfig } from './Config/file-upload.config';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: configs,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath:
            configService.get<FileUploadConfig>('fileUploads').uploadsPath,
          ...configService.get('serveStaticModule'),
        },
      ],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('mailer')
    }),
    RoutesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
