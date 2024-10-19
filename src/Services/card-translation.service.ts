import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { ConfigService } from '@nestjs/config';
import { TranslationExistsException } from '@Exceptions/translation-exists.exception';
import { AppConfig } from '../Config/app.config';
import { LanguageNotSupportedExceptionException } from '@Exceptions/language-not-supported-exception.exception';
import { Card } from '@Entities/card.entity';
import { CardTranslationDto } from '@DTOs/card-translation.dto';
import { CreateCardTranslationRequest } from '@Requests/CardTranslation/create-card-translation.request';
import { CardTranslation } from '@Entities/card-translation.entity';
import { UpdateCardTranslationRequest } from '@Requests/CardTranslation/update-card-translation.request';

@Injectable()
export class CardTranslationService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async findAll(cardId: number): Promise<CardTranslationDto[]> {
    const card = await this.cardRepository.findOneBy({
      id: cardId,
    });
    if (!card) {
      throw new NotFoundException();
    }
    return card.translations.map((translation) =>
      CardTranslationDto.fromEntity(translation),
    );
  }

  async findOne(cardId: number, locale: string): Promise<CardTranslationDto> {
    const card = await this.cardRepository.findOneBy({
      id: cardId,
    });
    if (!card) {
      throw new NotFoundException();
    }
    const translation = card.translations.find(
      (translation) => translation.locale === locale,
    );
    if (!translation) {
      throw new NotFoundException();
    }
    return CardTranslationDto.fromEntity(translation);
  }

  async add(
    cardId: number,
    cardTranslationRequest: CreateCardTranslationRequest,
  ): Promise<CardTranslationDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCard = await manager.findOneBy(Card, {
        id: cardId,
      });
      if (!existingCard) {
        throw new NotFoundException();
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
      const existingCard = await manager.findOneBy(Card, {
        id: cardId,
      });
      if (!existingCard) {
        throw new NotFoundException();
      }

      const existingCardTranslation = existingCard.translations.find(
        (translation) => translation.locale === locale,
      );
      if (!existingCardTranslation) {
        throw new NotFoundException();
      }

      manager.merge(CardTranslation, existingCardTranslation, {
        ...cardTranslationRequest,
      });

      return CardTranslationDto.fromEntity(
        await manager.save(CardTranslation, existingCardTranslation),
      );
    });
  }

  async delete(cardId: number, locale: string): Promise<CardTranslationDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCard = await manager.findOneBy(Card, {
        id: cardId,
      });
      if (!existingCard) {
        throw new NotFoundException();
      }

      const existingCardTranslation = existingCard.translations.find(
        (translation) => translation.locale === locale,
      );
      if (!existingCardTranslation) {
        throw new NotFoundException();
      }

      return CardTranslationDto.fromEntity(
        await manager.remove(CardTranslation, existingCardTranslation),
      );
    });
  }
}
