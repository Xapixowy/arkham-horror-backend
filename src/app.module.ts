import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoutesModule } from './routes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configs } from './configs';
import { ServeStaticModule } from '@nestjs/serve-static';
import { FileUploadConfig } from '@configs/file-upload.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { I18nModule } from 'nestjs-i18n';
import { i18nResolvers } from '@configs/i18n.config';
import { UserInterceptor } from '@interceptors/user.interceptor';
import { UserService } from '@services/user.service';
import { UserModule } from '@modules/user.module';
import { AuthGuard } from '@guards/auth.guard';
import { Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UserRolesGuard } from '@guards/user-roles.guard';
import { PlayerRolesGuard } from '@guards/player-roles.guard';

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
    UserModule,
    RoutesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'APP_INTERCEPTOR',
      useFactory: (userService: UserService) =>
        new UserInterceptor(userService),
      inject: [UserService],
    },
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
export class AppModule {}
