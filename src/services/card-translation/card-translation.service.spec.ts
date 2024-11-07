import { Test, TestingModule } from '@nestjs/testing';
import { CardTranslationService } from './card-translation.service';
import { Card } from '@Entities/card.entity';
import { CardTranslation } from '@Entities/card-translation.entity';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { TranslationExistsException } from '@Exceptions/translation-exists.exception';
import { LanguageNotSupportedExceptionException } from '@Exceptions/language-not-supported-exception.exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CardTranslationDto } from '@Dtos/card-translation.dto';
import { CreateCardTranslationRequest } from '@Requests/card-translation/create-card-translation.request';
import { UpdateCardTranslationRequest } from '@Requests/card-translation/update-card-translation.request';
import { AppConfig } from '@Configs/app.config';
import { Language } from '@Enums/language';

describe('CardTranslationService', () => {
  let cardTranslationService: CardTranslationService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardTranslationService,
        { provide: getRepositoryToken(Card), useClass: Repository },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'app') {
                return {
                  language: Language.POLISH,
                  available_languages: [Language.POLISH, Language.ENGLISH],
                } as AppConfig;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    cardTranslationService = module.get<CardTranslationService>(
      CardTranslationService,
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('findAll', () => {
    it('should retrieve all translations for a card', async () => {
      const card = {
        id: 1,
        translations: [
          { locale: Language.ENGLISH },
          { locale: 'de' as Language },
        ],
      } as Card;
      const findOneSpy = jest
        .spyOn(cardTranslationService['cardRepository'], 'findOne')
        .mockResolvedValue(card);

      const result = await cardTranslationService.findAll(1);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['translations'],
      });
      expect(result).toEqual(
        card.translations.map((t) => CardTranslationDto.fromEntity(t)),
      );
    });

    it('should throw NotFoundException if card does not exist', async () => {
      jest
        .spyOn(cardTranslationService['cardRepository'], 'findOne')
        .mockResolvedValue(null);

      await expect(cardTranslationService.findAll(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should retrieve a single translation by locale', async () => {
      const card = {
        id: 1,
        translations: [{ locale: Language.ENGLISH }],
      } as Card;
      jest
        .spyOn(cardTranslationService['cardRepository'], 'findOne')
        .mockResolvedValue(card);

      const result = await cardTranslationService.findOne(1, Language.ENGLISH);

      expect(result).toEqual(
        CardTranslationDto.fromEntity(card.translations[0]),
      );
    });

    it('should throw NotFoundException if card or translation does not exist', async () => {
      jest
        .spyOn(cardTranslationService['cardRepository'], 'findOne')
        .mockResolvedValue(null);

      await expect(
        cardTranslationService.findOne(1, Language.ENGLISH),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('add', () => {
    let createRequest: CreateCardTranslationRequest;
    let cardEntity: Card;
    let mockManager: {
      findOne: jest.Mock;
      save: jest.Mock;
    };

    beforeEach(() => {
      createRequest = {
        locale: Language.ENGLISH,
        name: 'Translation name',
        description: 'Translation Description',
      };
      cardEntity = { id: 1, translations: [] } as Card;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(cardEntity),
        save: jest.fn().mockResolvedValue(createRequest),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should add a new translation if locale is supported', async () => {
      const result = await cardTranslationService.add(1, createRequest);

      expect(result).toEqual(
        CardTranslationDto.fromEntity(createRequest as CardTranslation),
      );
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('should throw TranslationExistsException if translation already exists', async () => {
      cardEntity.translations.push({
        locale: Language.ENGLISH,
      } as CardTranslation);

      await expect(
        cardTranslationService.add(1, createRequest),
      ).rejects.toThrow(TranslationExistsException);
    });

    it('should throw LanguageNotSupportedExceptionException if locale is unsupported', async () => {
      createRequest.locale = 'fr' as Language;

      await expect(
        cardTranslationService.add(1, createRequest),
      ).rejects.toThrow(LanguageNotSupportedExceptionException);
    });
  });

  describe('edit', () => {
    let updateRequest: UpdateCardTranslationRequest;
    let cardEntity: Card;
    let mockManager: {
      findOne: jest.Mock;
      save: jest.Mock;
      merge: jest.Mock;
    };

    beforeEach(() => {
      updateRequest = { name: 'Translation Name Updated' };
      cardEntity = {
        id: 1,
        translations: [{ locale: Language.ENGLISH, name: 'Translation Name' }],
      } as Card;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(cardEntity),
        save: jest.fn().mockResolvedValue(updateRequest),
        merge: jest.fn().mockReturnValue({
          ...cardEntity.translations.find(
            (translation) => translation.locale === Language.ENGLISH,
          ),
          ...updateRequest,
          updated_at: new Date(),
        }),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should update an existing translation', async () => {
      const result = await cardTranslationService.edit(
        1,
        Language.ENGLISH,
        updateRequest,
      );

      expect(result.name).toBe(updateRequest.name);
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if card or translation does not exist', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(
        cardTranslationService.edit(1, Language.ENGLISH, updateRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    let cardEntity: Card;
    let mockManager: {
      findOne: jest.Mock;
      remove: jest.Mock;
    };

    beforeEach(() => {
      cardEntity = {
        id: 1,
        translations: [{ locale: Language.ENGLISH }],
      } as Card;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(cardEntity),
        remove: jest.fn().mockResolvedValue(cardEntity.translations[0]),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should delete an existing translation', async () => {
      const result = await cardTranslationService.delete(1, Language.ENGLISH);

      expect(result).toEqual(
        CardTranslationDto.fromEntity(cardEntity.translations[0]),
      );
      expect(mockManager.remove).toHaveBeenCalledWith(
        CardTranslation,
        cardEntity.translations[0],
      );
    });

    it('should throw NotFoundException if card or translation does not exist', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(
        cardTranslationService.delete(1, Language.ENGLISH),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
