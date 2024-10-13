import { Module } from '@nestjs/common';
import { Character } from '@Entities/character.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterController } from '@Controllers/character.controller';
import { CharacterService } from '@Services/character.service';
import { FileUploadHelper } from '@Helpers/file-upload.helper';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@Guards/auth.guard';
import { RolesGuard } from '@Guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Character])],
  controllers: [CharacterController],
  providers: [
    CharacterService,
    FileUploadHelper,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class CharacterModule {}
