import { Module } from '@nestjs/common';
import { UserService } from '@Services/user/user.service';
import { User } from '@Entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '@Controllers/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
