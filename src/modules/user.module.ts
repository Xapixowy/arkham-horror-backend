import { Module } from '@nestjs/common';
import { UserService } from '@Services/user/user.service';
import { User } from '@Entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
