import { Character } from '@Entities/character.entity';
import { Statistics } from '@Types/character/statistics.type';
import { Skill } from '@Types/character/skill.type';
import { Equipment } from '@Types/character/equipment.type';
import { Expansion } from '@Enums/expansion.enum';
import { Language } from '@Enums/language';
import { CharacterTranslationDto } from '@Dtos/character-translation.dto';
import { CardDto } from '@Dtos/card.dto';
import { PlayerDto } from '@Dtos/player.dto';
import { DTOTypeMapping } from '@Types/dto/dto-type-mapping.type';
import { CharacterTranslation } from '@Entities/character-translation.entity';
import { Card } from '@Entities/card.entity';
import { Player } from '@Entities/player.entity';
import { DtoHelper } from '@Helpers/dto/dto.helper';

export class CharacterDto {
  private static readonly typeMapping: DTOTypeMapping = {
    translations: (translations: CharacterTranslation[]) =>
      translations.map((translation) =>
        CharacterTranslationDto.fromEntity(translation),
      ),
    cards: (cards: Card[]) => cards.map((card) => CardDto.fromEntity(card)),
    players: (players: Player[]) =>
      players.map((player) => PlayerDto.fromEntity(player)),
  };

  constructor(
    public id: number,
    public expansion: Expansion,
    public name: string,
    public description: string,
    public profession: string,
    public starting_location: string,
    public image_path: string,
    public sanity: number,
    public endurance: number,
    public concentration: number,
    public statistics: Statistics,
    public skills: Skill[],
    public equipment: Equipment,
    public locale: Language,
    public created_at: Date,
    public updated_at: Date,
    public translations?: CharacterTranslationDto[],
    public cards?: CardDto[],
    public players?: PlayerDto[],
  ) {}

  static fromEntity(
    character: Character,
    properties?: {
      translations?: true;
      cards?: true;
      players?: true;
    },
  ): CharacterDto {
    return DtoHelper.populateDtoWithOptionalProperties(
      new CharacterDto(
        character.id,
        character.expansion,
        character.name,
        character.description,
        character.profession,
        character.starting_location,
        character.image_path,
        character.sanity,
        character.endurance,
        character.concentration,
        character.statistics,
        character.skills,
        character.equipment,
        character.locale,
        character.created_at,
        character.updated_at,
      ),
      character,
      this.typeMapping,
      properties,
    );
  }
}
