import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoutesModule } from './routes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configs } from './configs';
import { ServeStaticModule } from '@nestjs/serve-static';
import { FileUploadConfig } from '@Configs/file-upload.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { I18nModule } from 'nestjs-i18n';
import { i18nResolvers } from '@Configs/i18n.config';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '@Services/user/user.service';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@Guards/auth.guard';
import { UserRolesGuard } from '@Guards/user-roles.guard';
import { PlayerRolesGuard } from '@Guards/player-roles.guard';
import { UserModule } from '@Modules/user.module';
import { UserMiddleware } from '@Middlewares/user.middleware';
import { LanguageMiddleware } from '@Middlewares/language.middleware';

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
            configService.get<FileUploadConfig>('fileUpload').uploadsPath,
          ...configService.get('serveStaticModule'),
        },
      ],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('mailer'),
    }),
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('i18n'),
      resolvers: i18nResolvers,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => configService.get('jwt'),
    }),
    RoutesModule,
    UserModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useFactory: (userService: UserService, reflector: Reflector) =>
        new AuthGuard(userService, reflector),
      inject: [UserService, Reflector],
    },
    {
      provide: 'APP_GUARD',
      useClass: UserRolesGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: PlayerRolesGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*');
    consumer.apply(LanguageMiddleware).forRoutes('*');
  }
}
