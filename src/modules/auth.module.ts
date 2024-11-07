import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@Entities/user.entity';
import { Module } from '@nestjs/common';
import { AuthController } from '@Controllers/auth.controller';
import { AuthService } from '@Services/auth/auth.service';
import { EmailService } from '@Services/email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
})
export class AuthModule {}
