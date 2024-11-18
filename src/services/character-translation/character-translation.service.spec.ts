import { Test, TestingModule } from '@nestjs/testing';
import { CharacterTranslationService } from './character-translation.service';
import { Character } from '@Entities/character.entity';
import { CharacterTranslation } from '@Entities/character-translation.entity';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TranslationExistsException } from '@Exceptions/translation-exists.exception';
import { LanguageNotSupportedExceptionException } from '@Exceptions/language-not-supported-exception.exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CharacterTranslationDto } from '@Dtos/character-translation.dto';
import { CreateCharacterTranslationRequest } from '@Requests/character-translation/create-character-translation.request';
import { UpdateCharacterTranslationRequest } from '@Requests/character-translation/update-character-translation.request';
import { AppConfig } from '@Configs/app.config';
import { Language } from '@Enums/language';
import { CharacterNotFoundException } from '@Exceptions/character/character-not-found.exception';
import { CharacterTranslationNotFoundException } from '@Exceptions/character-translation/character-translation-not-found.exception';

describe('CharacterTranslationService', () => {
  let characterTranslationService: CharacterTranslationService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharacterTranslationService,
        { provide: getRepositoryToken(Character), useClass: Repository },
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

    characterTranslationService = module.get<CharacterTranslationService>(
      CharacterTranslationService,
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('findAll', () => {
    it('should retrieve all translations for a character', async () => {
      const character = {
        id: 1,
        translations: [
          { locale: Language.ENGLISH },
          { locale: 'de' as Language },
        ],
      } as Character;
      const findOneSpy = jest
        .spyOn(characterTranslationService['characterRepository'], 'findOne')
        .mockResolvedValue(character);

      const result = await characterTranslationService.findAll(1);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['translations'],
        order: {
          id: 'ASC',
        },
      });
      expect(result).toEqual(
        character.translations.map((t) =>
          CharacterTranslationDto.fromEntity(t),
        ),
      );
    });

    it('should throw CharacterNotFoundException if character does not exist', async () => {
      jest
        .spyOn(characterTranslationService['characterRepository'], 'findOne')
        .mockResolvedValue(null);

      await expect(characterTranslationService.findAll(1)).rejects.toThrow(
        CharacterNotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should retrieve a single translation by locale', async () => {
      const character = {
        id: 1,
        translations: [{ locale: Language.ENGLISH }],
      } as Character;
      jest
        .spyOn(characterTranslationService['characterRepository'], 'findOne')
        .mockResolvedValue(character);

      const result = await characterTranslationService.findOne(
        1,
        Language.ENGLISH,
      );

      expect(result).toEqual(
        CharacterTranslationDto.fromEntity(character.translations[0]),
      );
    });

    it('should throw CharacterNotFoundException if character does not exist', async () => {
      jest
        .spyOn(characterTranslationService['characterRepository'], 'findOne')
        .mockResolvedValue(null);

      await expect(
        characterTranslationService.findOne(1, Language.ENGLISH),
      ).rejects.toThrow(CharacterNotFoundException);
    });
  });

  describe('add', () => {
    let createRequest: CreateCharacterTranslationRequest;
    let characterEntity: Character;
    let mockManager: {
      findOne: jest.Mock;
      save: jest.Mock;
    };

    beforeEach(() => {
      createRequest = {
        locale: Language.ENGLISH,
        name: 'Translation name',
        description: 'Translation Description',
        profession: 'Translation Profession',
        starting_location: 'Translation Starting Location',
      };
      characterEntity = { id: 1, translations: [] } as Character;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(characterEntity),
        save: jest.fn().mockResolvedValue(createRequest),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should add a new translation if locale is supported', async () => {
      const result = await characterTranslationService.add(1, createRequest);

      expect(result).toEqual(
        CharacterTranslationDto.fromEntity(
          createRequest as CharacterTranslation,
        ),
      );
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('should throw TranslationExistsException if translation already exists', async () => {
      characterEntity.translations.push({
        locale: Language.ENGLISH,
      } as CharacterTranslation);

      await expect(
        characterTranslationService.add(1, createRequest),
      ).rejects.toThrow(TranslationExistsException);
    });

    it('should throw LanguageNotSupportedExceptionException if locale is unsupported', async () => {
      createRequest.locale = 'fr' as Language;

      await expect(
        characterTranslationService.add(1, createRequest),
      ).rejects.toThrow(LanguageNotSupportedExceptionException);
    });
  });

  describe('edit', () => {
    let updateRequest: UpdateCharacterTranslationRequest;
    let characterEntity: Character;
    let mockManager: {
      findOne: jest.Mock;
      save: jest.Mock;
      merge: jest.Mock;
    };

    beforeEach(() => {
      updateRequest = { name: 'Translation Name Updated' };
      characterEntity = {
        id: 1,
        translations: [{ locale: Language.ENGLISH, name: 'Translation Name' }],
      } as Character;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(characterEntity),
        save: jest.fn().mockResolvedValue(updateRequest),
        merge: jest.fn().mockReturnValue({
          ...characterEntity.translations.find(
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
      const result = await characterTranslationService.edit(
        1,
        Language.ENGLISH,
        updateRequest,
      );

      expect(result.name).toBe(updateRequest.name);
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('should throw CharacterNotFoundException if character does not exist', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(
        characterTranslationService.edit(1, Language.ENGLISH, updateRequest),
      ).rejects.toThrow(CharacterNotFoundException);
    });

    it('should throw CharacterTranslationNotFoundException if character translation does not exist', async () => {
      mockManager.findOne.mockResolvedValue({
        ...characterEntity,
        translations: [],
      });

      await expect(
        characterTranslationService.edit(1, Language.ENGLISH, updateRequest),
      ).rejects.toThrow(CharacterTranslationNotFoundException);
    });
  });

  describe('delete', () => {
    let characterEntity: Character;
    let mockManager: {
      findOne: jest.Mock;
      remove: jest.Mock;
    };

    beforeEach(() => {
      characterEntity = {
        id: 1,
        translations: [{ locale: Language.ENGLISH }],
      } as Character;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(characterEntity),
        remove: jest.fn().mockResolvedValue(characterEntity.translations[0]),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should delete an existing translation', async () => {
      const result = await characterTranslationService.delete(
        1,
        Language.ENGLISH,
      );

      expect(result).toEqual(
        CharacterTranslationDto.fromEntity(characterEntity.translations[0]),
      );
      expect(mockManager.remove).toHaveBeenCalledWith(
        CharacterTranslation,
        characterEntity.translations[0],
      );
    });

    it('should throw CharacterNotFoundException if character does not exist', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(
        characterTranslationService.delete(1, Language.ENGLISH),
      ).rejects.toThrow(CharacterNotFoundException);
    });

    it('should throw CharacterTranslationNotFoundException if character translation does not exist', async () => {
      mockManager.findOne.mockResolvedValue({
        ...characterEntity,
        translations: [],
      });

      await expect(
        characterTranslationService.delete(1, Language.ENGLISH),
      ).rejects.toThrow(CharacterTranslationNotFoundException);
    });
  });
});
