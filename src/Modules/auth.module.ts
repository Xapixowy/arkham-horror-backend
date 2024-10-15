import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@Entities/user.entity';
import { Module } from '@nestjs/common';
import { AuthController } from '@Controllers/auth.controller';
import { AuthService } from '@Services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from '@Services/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => configService.get('jwt'),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
})
export class AuthModule {}
