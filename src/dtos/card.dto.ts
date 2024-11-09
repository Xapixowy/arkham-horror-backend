import { Card } from '@Entities/card.entity';
import { StatisticModifier } from '@Types/card/statistic-modifier.type';
import { Language } from '@Enums/language';
import { CardType } from '@Enums/card/card.type';
import { CardSubtype } from '@Enums/card/card.subtype';
import { DtoHelper } from '@Helpers/dto/dto.helper';
import { CardTranslationDto } from '@Dtos/card-translation.dto';
import { CharacterDto } from '@Dtos/character.dto';
import { DTOTypeMapping } from '@Types/dto/dto-type-mapping.type';
import { CardTranslation } from '@Entities/card-translation.entity';
import { Character } from '@Entities/character.entity';
import { PlayerCard } from '@Entities/player-card.entity';
import { PlayerCardDto } from '@Dtos/player-card.dto';

export class CardDto {
  static readonly typeMapping: DTOTypeMapping = {
    translations: (translations: CardTranslation[]) =>
      translations.map((translation) =>
        CardTranslationDto.fromEntity(translation),
      ),
    characters: (characters: Character[]) =>
      characters.map((character) => CharacterDto.fromEntity(character)),
    playerCards: (playerCards: PlayerCard[]) =>
      playerCards.map((playerCard) => PlayerCardDto.fromEntity(playerCard)),
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
    public playerCards?: PlayerCardDto[],
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
