import { Module } from '@nestjs/common';
import { Character } from '@entities/character.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterController } from '@controllers/character.controller';
import { CharacterService } from '@services/character.service';
import { FileUploadHelper } from '@helpers/file-upload.helper';
import { CharacterTranslation } from '@entities/character-translation.entity';
import { CharacterTranslationService } from '@services/character-translation.service';
import { CharacterTranslationController } from '@controllers/character-translation.controller';
import { User } from '@entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Character, CharacterTranslation, User])],
  controllers: [CharacterController, CharacterTranslationController],
  providers: [CharacterService, CharacterTranslationService, FileUploadHelper],
})
export class CharacterModule {}
