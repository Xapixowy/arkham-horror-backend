import { CharacterTranslation } from '@Entities/character-translation.entity';
import { Language } from '@Enums/language';

export class CharacterTranslationDto {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public profession: string,
    public starting_location: string,
    public locale: Language,
  ) {}

  static fromEntity(
    characterTranslation: CharacterTranslation,
  ): CharacterTranslationDto {
    return new CharacterTranslationDto(
      characterTranslation.id,
      characterTranslation.name,
      characterTranslation.description,
      characterTranslation.profession,
      characterTranslation.starting_location,
      characterTranslation.locale,
    );
  }
}
