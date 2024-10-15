import { Module } from '@nestjs/common';
import { Character } from '@Entities/character.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterController } from '@Controllers/character.controller';
import { CharacterService } from '@Services/character.service';
import { FileUploadHelper } from '@Helpers/file-upload.helper';

@Module({
  imports: [TypeOrmModule.forFeature([Character])],
  controllers: [CharacterController],
  providers: [CharacterService, FileUploadHelper],
})
export class CharacterModule {}
