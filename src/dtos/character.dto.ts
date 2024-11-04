import { Character } from '@entities/character.entity';
import { Statistics } from '@custom-types/character/statistics.type';
import { Skill } from '@custom-types/character/skill.type';
import { Equipment } from '@custom-types/character/equipment.type';
import { Expansion } from '@enums/expansion.enum';
import { Language } from '@enums/language';
import { CharacterTranslationDto } from '@dtos/character-translation.dto';
import { CardDto } from '@dtos/card.dto';
import { PlayerDto } from '@dtos/player.dto';
import { DTOTypeMapping } from '@custom-types/dto/dto-type-mapping.type';
import { CharacterTranslation } from '@entities/character-translation.entity';
import { Card } from '@entities/card.entity';
import { Player } from '@entities/player.entity';
import { DtoHelper } from '@helpers/dto.helper';

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
