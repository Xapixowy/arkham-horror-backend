import { CharacterTranslation } from '@Entities/character-translation.entity';
import { Language } from '@Enums/language';
import { CharacterDto } from '@Dtos/character.dto';
import { DTOTypeMapping } from '@Types/dto/dto-type-mapping.type';
import { Character } from '@Entities/character.entity';
import { DtoHelper } from '@Helpers/dto/dto.helper';

export class CharacterTranslationDto {
  static readonly typeMapping: DTOTypeMapping = {
    character: (character: Character) => CharacterDto.fromEntity(character),
  };

  constructor(
    public id: number,
    public name: string,
    public description: string,
    public profession: string,
    public starting_location: string,
    public locale: Language,
    public created_at: Date,
    public updated_at: Date,
    public character?: CharacterDto,
  ) {}

  static fromEntity(
    characterTranslation: CharacterTranslation,
    properties?: {
      character?: true;
    },
  ): CharacterTranslationDto {
    return DtoHelper.populateDtoWithOptionalProperties(
      new CharacterTranslationDto(
        characterTranslation.id,
        characterTranslation.name,
        characterTranslation.description,
        characterTranslation.profession,
        characterTranslation.starting_location,
        characterTranslation.locale,
        characterTranslation.created_at,
        characterTranslation.updated_at,
      ),
      characterTranslation,
      this.typeMapping,
      properties,
    );
  }
}
