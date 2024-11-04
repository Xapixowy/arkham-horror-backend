import { Card } from '@entities/card.entity';
import { StatisticModifier } from '@custom-types/card/statistic-modifier.type';
import { Language } from '@enums/language';
import { CardType } from '@enums/card/card.type';
import { CardSubtype } from '@enums/card/card.subtype';
import { DtoHelper } from '@helpers/dto.helper';
import { CardTranslationDto } from '@dtos/card-translation.dto';
import { CharacterDto } from '@dtos/character.dto';
import { PlayerDto } from '@dtos/player.dto';
import { DTOTypeMapping } from '@custom-types/dto/dto-type-mapping.type';
import { CardTranslation } from '@entities/card-translation.entity';
import { Character } from '@entities/character.entity';
import { Player } from '@entities/player.entity';

export class CardDto {
  private static readonly typeMapping: DTOTypeMapping = {
    translations: (translations: CardTranslation[]) =>
      translations.map((translation) =>
        CardTranslationDto.fromEntity(translation),
      ),
    characters: (characters: Character[]) =>
      characters.map((character) => CharacterDto.fromEntity(character)),
    players: (players: Player[]) =>
      players.map((player) => PlayerDto.fromEntity(player)),
  };

  constructor(
    public id: number,
    public name: string,
    public description: string,
    public type: CardType,
    public subtype: CardSubtype,
    public statisticModifiers: StatisticModifier[],
    public handUsage: number,
    public front_image_path: string,
    public back_image_path: string,
    public locale: Language,
    public created_at: Date,
    public update_at: Date,
    public translations?: CardTranslationDto[],
    public characters?: CharacterDto[],
    public players?: PlayerDto[],
  ) {}

  static fromEntity(
    card: Card,
    properties?: { translations?: true; characters?: true; players?: true },
  ): CardDto {
    return DtoHelper.populateDtoWithOptionalProperties(
      new CardDto(
        card.id,
        card.name,
        card.description,
        card.type,
        card.subtype,
        card.statistic_modifiers,
        card.hand_usage,
        card.front_image_path,
        card.back_image_path,
        card.locale,
        card.created_at,
        card.updated_at,
      ),
      card,
      this.typeMapping,
      properties,
    );
  }
}
