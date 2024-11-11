import { Module } from '@nestjs/common';
import { Character } from '@Entities/character.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterController } from '@Controllers/character.controller';
import { CharacterService } from '@Services/character/character.service';
import { FileUploadHelper } from '@Helpers/file-upload/file-upload.helper';
import { CharacterTranslation } from '@Entities/character-translation.entity';
import { CharacterTranslationService } from '@Services/character-translation/character-translation.service';
import { CharacterTranslationController } from '@Controllers/character-translation.controller';
import { User } from '@Entities/user.entity';
import { Card } from '@Entities/card.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, CharacterTranslation, User, Card]),
  ],
  controllers: [CharacterController, CharacterTranslationController],
  providers: [CharacterService, CharacterTranslationService, FileUploadHelper],
})
export class CharacterModule {}
