import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user.entity';
import { Module } from '@nestjs/common';
import { AuthController } from '@controllers/auth.controller';
import { AuthService } from '@services/auth.service';
import { EmailService } from '@services/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
})
export class AuthModule {}
