import { CharacterTranslation } from '@Entities/character-translation.entity';
import { Language } from '@Enums/language';
import { CharacterDto } from '@Dtos/character.dto';
import { DTOTypeMapping } from '@Types/dto/dto-type-mapping.type';
import { Character } from '@Entities/character.entity';
import { DtoHelper } from '@Helpers/dto/dto.helper';
import { Skill } from '@Types/character/skill.type';

export class CharacterTranslationDto {
  private static readonly typeMapping: DTOTypeMapping = {
    character: (character: Character) => CharacterDto.fromEntity(character),
  };

  constructor(
    public id: number,
    public name: string,
    public description: string,
    public profession: string,
    public starting_location: string,
    public skills: Skill[],
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
        characterTranslation.skills,
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
