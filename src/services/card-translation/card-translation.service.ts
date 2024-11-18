import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TranslationExistsException } from '@Exceptions/translation-exists.exception';
import { AppConfig } from '@Configs/app.config';
import { LanguageNotSupportedExceptionException } from '@Exceptions/language-not-supported-exception.exception';
import { Card } from '@Entities/card.entity';
import { CardTranslationDto } from '@Dtos/card-translation.dto';
import { CreateCardTranslationRequest } from '@Requests/card-translation/create-card-translation.request';
import { CardTranslation } from '@Entities/card-translation.entity';
import { UpdateCardTranslationRequest } from '@Requests/card-translation/update-card-translation.request';
import { CardNotFoundException } from '@Exceptions/card/card-not-found.exception';
import { CardTranslationNotFoundException } from '@Exceptions/card-translation/card-translation-not-found.exception';

@Injectable()
export class CardTranslationService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async findAll(cardId: number): Promise<CardTranslationDto[]> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['translations'],
      order: {
        id: 'ASC',
      },
    });
    if (!card) {
      throw new CardNotFoundException();
    }
    return card.translations.map((translation) =>
      CardTranslationDto.fromEntity(translation),
    );
  }

  async findOne(cardId: number, locale: string): Promise<CardTranslationDto> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['translations'],
    });
    if (!card) {
      throw new CardNotFoundException();
    }
    const translation = card.translations.find(
      (translation) => translation.locale === locale,
    );
    if (!translation) {
      throw new CardTranslationNotFoundException();
    }
    return CardTranslationDto.fromEntity(translation);
  }

  async add(
    cardId: number,
    cardTranslationRequest: CreateCardTranslationRequest,
  ): Promise<CardTranslationDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCard = await manager.findOne(Card, {
        where: { id: cardId },
        relations: ['translations'],
      });
      if (!existingCard) {
        throw new CardNotFoundException();
      }

      const availableLanguages = this.configService
        .get<AppConfig>('app')
        .available_languages.filter(
          (language) =>
            language !== this.configService.get<AppConfig>('app').language,
        );
      if (!availableLanguages.includes(cardTranslationRequest.locale)) {
        throw new LanguageNotSupportedExceptionException();
      }

      const existingCardTranslations = new Set<string>(
        existingCard.translations.map((translation) => translation.locale),
      );
      if (existingCardTranslations.has(cardTranslationRequest.locale)) {
        throw new TranslationExistsException();
      }

      const cardTranslation = await manager.save(CardTranslation, {
        ...cardTranslationRequest,
        card: existingCard,
      });

      return CardTranslationDto.fromEntity(cardTranslation);
    });
  }

  async edit(
    cardId: number,
    locale: string,
    cardTranslationRequest: UpdateCardTranslationRequest,
  ): Promise<CardTranslationDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCard = await manager.findOne(Card, {
        where: { id: cardId },
        relations: ['translations'],
      });
      if (!existingCard) {
        throw new CardNotFoundException();
      }

      const existingCardTranslation = existingCard.translations.find(
        (translation) => translation.locale === locale,
      );
      if (!existingCardTranslation) {
        throw new CardTranslationNotFoundException();
      }

      const updatedCardTranslation = manager.merge(
        CardTranslation,
        existingCardTranslation,
        {
          ...cardTranslationRequest,
          updated_at: new Date(),
        },
      );

      return CardTranslationDto.fromEntity(
        await manager.save(CardTranslation, updatedCardTranslation),
      );
    });
  }

  async delete(cardId: number, locale: string): Promise<CardTranslationDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCard = await manager.findOne(Card, {
        where: { id: cardId },
        relations: ['translations'],
      });
      if (!existingCard) {
        throw new CardNotFoundException();
      }

      const existingCardTranslation = existingCard.translations.find(
        (translation) => translation.locale === locale,
      );
      if (!existingCardTranslation) {
        throw new CardTranslationNotFoundException();
      }

      return CardTranslationDto.fromEntity(
        await manager.remove(CardTranslation, existingCardTranslation),
      );
    });
  }
}
