import { Module } from '@nestjs/common';
import { Character } from '@Entities/character.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterController } from '@Controllers/character.controller';
import { CharacterService } from '@Services/character.service';
import { FileUploadHelper } from '@Helpers/file-upload.helper';
import { CharacterTranslation } from '@Entities/character-translation.entity';
import { CharacterTranslationService } from '@Services/character-translation.service';
import { CharacterTranslationController } from '@Controllers/character-translation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Character, CharacterTranslation])],
  controllers: [CharacterController, CharacterTranslationController],
  providers: [CharacterService, CharacterTranslationService, FileUploadHelper],
})
export class CharacterModule {}
