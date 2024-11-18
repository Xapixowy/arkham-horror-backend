import { Test, TestingModule } from '@nestjs/testing';
import { CharacterService } from './character.service';
import { Character } from '@Entities/character.entity';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CharacterDto } from '@Dtos/character.dto';
import { CreateCharacterRequest } from '@Requests/character/create-character.request';
import { UpdateCharacterRequest } from '@Requests/character/update-character.request';
import { FileUploadHelper } from '@Helpers/file-upload/file-upload.helper';
import { FileDeleteFailedException } from '@Exceptions/file/file-delete-failed.exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Language } from '@Enums/language';
import { Card } from '@Entities/card.entity';
import { CharacterCard } from '@Entities/character-card.entity';
import { CharacterCardDto } from '@Dtos/character-card.dto';
import { CharacterNotFoundException } from '@Exceptions/character/character-not-found.exception';

describe('CharacterService', () => {
  let characterService: CharacterService;
  let dataSource: DataSource;
  let fileUploadHelper: FileUploadHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharacterService,
        { provide: getRepositoryToken(Character), useClass: Repository },
        { provide: getRepositoryToken(Card), useClass: Repository },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
        {
          provide: FileUploadHelper,
          useValue: {
            saveFile: jest.fn(),
            deleteFile: jest.fn(),
            generateDestinationPath: jest.fn(),
            localToRemotePath: jest.fn(),
            remoteToLocalPath: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'app') {
                return { language: Language.POLISH };
              }
              return {};
            }),
          },
        },
      ],
    }).compile();

    characterService = module.get<CharacterService>(CharacterService);
    dataSource = module.get<DataSource>(DataSource);
    fileUploadHelper = module.get<FileUploadHelper>(FileUploadHelper);
  });

  describe('findAll', () => {
    it('should retrieve all characters and map to CharacterDto', async () => {
      const characterEntities = [
        {
          id: 1,
          locale: Language.POLISH,
          translations: [],
          characterCards: [],
        },
      ] as Character[];
      const findSpy = jest
        .spyOn(characterService['characterRepository'], 'find')
        .mockResolvedValue(characterEntities);

      const result = await characterService.findAll(Language.POLISH);

      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual(
        characterEntities.map((character) =>
          CharacterDto.fromEntity(character, {
            characterCards: true,
          }),
        ),
      );
    });
  });

  describe('findOne', () => {
    it('should retrieve one character by id', async () => {
      const characterEntity = {
        id: 1,
        locale: Language.POLISH,
        translations: [],
        characterCards: [],
      } as Character;
      jest
        .spyOn(characterService['characterRepository'], 'findOne')
        .mockResolvedValue(characterEntity);

      const result = await characterService.findOne(1, Language.POLISH);

      expect(result).toEqual(
        CharacterDto.fromEntity(characterEntity, {
          characterCards: true,
        }),
      );
    });

    it('should throw CharacterNotFoundException if character does not exist', async () => {
      jest
        .spyOn(characterService['characterRepository'], 'findOne')
        .mockResolvedValue(null);

      await expect(
        characterService.findOne(1, Language.POLISH),
      ).rejects.toThrow(CharacterNotFoundException);
    });
  });

  describe('add', () => {
    let characterRequest: CreateCharacterRequest;
    let characterEntity: Character;
    let characterCardEntities: CharacterCard[];
    let mockManager: { create: jest.Mock; save: jest.Mock };

    beforeEach(() => {
      characterRequest = {
        name: 'Test Character',
        cardIds: [1, 2],
      } as CreateCharacterRequest;
      characterEntity = {
        id: 1,
        ...characterRequest,
        locale: Language.POLISH,
        created_at: new Date(),
        updated_at: new Date(),
        characterCards: [],
      } as unknown as Character;
      characterCardEntities = [
        { id: 1, card: { id: 1 } as Card } as CharacterCard,
        { id: 2, card: { id: 2 } as Card } as CharacterCard,
      ];
      mockManager = {
        create: jest.fn().mockReturnValue(characterEntity),
        save: jest.fn().mockResolvedValue(characterEntity),
      };

      characterService['assignCardsToCharacter'] = jest
        .fn()
        .mockResolvedValue(characterCardEntities);

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should add a new character and return CharacterDto', async () => {
      const characterCardDtos = characterCardEntities.map((characterCard) =>
        CharacterCardDto.fromEntity(characterCard, { card: true }),
      );

      const expectedCharacterDto = CharacterDto.fromEntity(characterEntity, {
        characterCards: true,
      });

      expectedCharacterDto.characterCards = characterCardDtos;

      const result = await characterService.add(characterRequest);

      expect(result).toEqual(expectedCharacterDto);
      expect(mockManager.create).toHaveBeenCalledWith(Character, {
        ...characterRequest,
        locale: Language.POLISH,
      });
      expect(mockManager.save).toHaveBeenCalledWith(Character, characterEntity);
    });
  });

  describe('edit', () => {
    let characterRequest: UpdateCharacterRequest;
    let characterEntity: Character;
    let mockManager: { findOne: jest.Mock; save: jest.Mock; merge: jest.Mock };

    beforeEach(() => {
      characterRequest = {
        name: 'Updated Character',
      } as UpdateCharacterRequest;
      characterEntity = {
        id: 1,
        name: 'Test Character',
        characterCards: [],
      } as Character;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(characterEntity),
        save: jest.fn().mockResolvedValue(characterEntity),
        merge: jest.fn(),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));

      jest
        .spyOn(characterService['characterRepository'], 'findOne')
        .mockResolvedValue(characterEntity);
    });

    it('should update an existing character', async () => {
      const result = await characterService.edit(1, characterRequest);

      expect(result).toEqual(
        CharacterDto.fromEntity(characterEntity, {
          characterCards: true,
        }),
      );
      expect(mockManager.save).toHaveBeenCalledWith(Character, characterEntity);
    });

    it('should throw CharacterNotFoundException if character does not exist', async () => {
      jest
        .spyOn(characterService['characterRepository'], 'findOne')
        .mockResolvedValue(null);

      await expect(characterService.edit(1, characterRequest)).rejects.toThrow(
        CharacterNotFoundException,
      );
    });
  });

  describe('remove', () => {
    let characterEntity: Character;
    let mockManager: { findOne: jest.Mock; remove: jest.Mock };

    beforeEach(() => {
      characterEntity = { id: 1 } as Character;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(characterEntity),
        remove: jest.fn().mockResolvedValue(characterEntity),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should remove an existing character', async () => {
      const result = await characterService.remove(1);

      expect(result).toEqual(CharacterDto.fromEntity(characterEntity));
      expect(mockManager.remove).toHaveBeenCalledWith(
        Character,
        characterEntity,
      );
    });

    it('should throw CharacterNotFoundException if character does not exist', async () => {
      mockManager.findOne = jest.fn().mockResolvedValue(null);

      await expect(characterService.remove(1)).rejects.toThrow(
        CharacterNotFoundException,
      );
    });
  });

  describe('setPhoto', () => {
    let characterEntity: Character;
    let file: Express.Multer.File;
    let mockManager: { findOne: jest.Mock; save: jest.Mock };
    const savedFilePath = 'saved/path/to/file.jpg';

    beforeEach(() => {
      characterEntity = { id: 1 } as Character;
      file = { filename: 'test.jpg' } as Express.Multer.File;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(characterEntity),
        save: jest.fn().mockResolvedValue(characterEntity),
      };

      jest.spyOn(fileUploadHelper, 'saveFile').mockReturnValue(savedFilePath);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should set the photo path', async () => {
      const result = await characterService.setPhoto(1, file);

      expect(result).toEqual(CharacterDto.fromEntity(characterEntity));
      expect(mockManager.save).toHaveBeenCalledWith(Character, characterEntity);
    });

    it('should throw CharacterNotFoundException if character does not exist', async () => {
      mockManager.findOne = jest.fn().mockResolvedValue(null);

      await expect(characterService.setPhoto(1, file)).rejects.toThrow(
        CharacterNotFoundException,
      );
    });
  });

  describe('deletePhoto', () => {
    let characterEntity: Character;
    let mockManager: { findOne: jest.Mock; save: jest.Mock };

    beforeEach(() => {
      characterEntity = { id: 1, image_path: 'path/to/image.jpg' } as Character;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(characterEntity),
        save: jest.fn().mockResolvedValue(characterEntity),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should delete the photo if path exists', async () => {
      jest.spyOn(fileUploadHelper, 'deleteFile').mockReturnValue(true);

      const result = await characterService.deletePhoto(1);

      expect(result).toEqual(CharacterDto.fromEntity(characterEntity));
      expect(mockManager.save).toHaveBeenCalledWith(Character, characterEntity);
    });

    it('should throw FileDeleteFailedException if file deletion fails', async () => {
      jest.spyOn(fileUploadHelper, 'deleteFile').mockReturnValue(false);

      await expect(characterService.deletePhoto(1)).rejects.toThrow(
        FileDeleteFailedException,
      );
    });
  });

  describe('getTranslatedCharacter', () => {
    let characterEntity: Character;

    beforeEach(() => {
      characterEntity = {
        id: 1,
        name: 'Original Name',
        description: 'Original Description',
        profession: 'Warrior',
        starting_location: 'Village',
        locale: Language.ENGLISH,
        translations: [
          {
            locale: Language.POLISH,
            name: 'Przetłumaczona Nazwa',
            description: 'Przetłumaczony Opis',
            profession: 'Wojownik',
            starting_location: 'Wioska',
          },
        ],
      } as Character;
    });

    it('should update character properties if translation exists and language is different', () => {
      const translatedCharacter = CharacterService.getTranslatedCharacter(
        characterEntity,
        Language.POLISH,
      );

      expect(translatedCharacter.name).toBe('Przetłumaczona Nazwa');
      expect(translatedCharacter.description).toBe('Przetłumaczony Opis');
      expect(translatedCharacter.profession).toBe('Wojownik');
      expect(translatedCharacter.starting_location).toBe('Wioska');
      expect(translatedCharacter.locale).toBe(Language.POLISH);
    });

    it('should not update character if locale matches language', () => {
      const translatedCharacter = CharacterService.getTranslatedCharacter(
        characterEntity,
        Language.ENGLISH,
      );

      expect(translatedCharacter.name).toBe('Original Name');
      expect(translatedCharacter.description).toBe('Original Description');
      expect(translatedCharacter.profession).toBe('Warrior');
      expect(translatedCharacter.starting_location).toBe('Village');
      expect(translatedCharacter.locale).toBe(Language.ENGLISH);
    });

    it('should not update character if translation for language does not exist', () => {
      const character: Character = {
        id: 1,
        name: 'Original Name',
        description: 'Original Description',
        profession: 'Warrior',
        starting_location: 'Village',
        locale: Language.ENGLISH,
        translations: [
          {
            locale: Language.POLISH,
            name: 'Przetłumaczona Nazwa',
            description: 'Przetłumaczony Opis',
            profession: 'Wojownik',
            starting_location: 'Wioska',
          },
        ],
      } as Character;

      const translatedCharacter = CharacterService.getTranslatedCharacter(
        character,
        'de' as Language,
      );

      expect(translatedCharacter.name).toBe('Original Name');
      expect(translatedCharacter.description).toBe('Original Description');
      expect(translatedCharacter.profession).toBe('Warrior');
      expect(translatedCharacter.starting_location).toBe('Village');
      expect(translatedCharacter.locale).toBe(Language.ENGLISH);
    });
  });
});
