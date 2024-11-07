import { Test, TestingModule } from '@nestjs/testing';
import { CharacterService } from './character.service';
import { Character } from '@Entities/character.entity';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CharacterDto } from '@Dtos/character.dto';
import { CreateCharacterRequest } from '@Requests/character/create-character.request';
import { UpdateCharacterRequest } from '@Requests/character/update-character.request';
import { FileUploadHelper } from '@Helpers/file-upload/file-upload.helper';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { FileDeleteFailedException } from '@Exceptions/file/file-delete-failed.exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Language } from '@Enums/language';

describe('CharacterService', () => {
  let characterService: CharacterService;
  let dataSource: DataSource;
  let fileUploadHelper: FileUploadHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharacterService,
        { provide: getRepositoryToken(Character), useClass: Repository },
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
        { id: 1, locale: Language.POLISH },
      ] as Character[];
      const findSpy = jest
        .spyOn(characterService['characterRepository'], 'find')
        .mockResolvedValue(characterEntities);

      const result = await characterService.findAll();

      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual(
        characterEntities.map((character) =>
          CharacterDto.fromEntity(character),
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
      } as Character;
      jest
        .spyOn(characterService['characterRepository'], 'findOne')
        .mockResolvedValue(characterEntity);

      const result = await characterService.findOne(1);

      expect(result).toEqual(CharacterDto.fromEntity(characterEntity));
    });

    it('should throw NotFoundException if character does not exist', async () => {
      jest
        .spyOn(characterService['characterRepository'], 'findOne')
        .mockResolvedValue(null);

      await expect(characterService.findOne(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('add', () => {
    let characterRequest: CreateCharacterRequest;
    let characterEntity: Character;
    let mockManager: { create: jest.Mock; save: jest.Mock };

    beforeEach(() => {
      characterRequest = {
        name: 'Test Character',
      } as CreateCharacterRequest;
      characterEntity = {
        id: 1,
        ...characterRequest,
        locale: Language.POLISH,
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as Character;
      mockManager = {
        create: jest.fn().mockReturnValue(characterEntity),
        save: jest.fn().mockResolvedValue(characterEntity),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should add a new character and return CharacterDto', async () => {
      const result = await characterService.add(characterRequest);

      expect(result).toEqual(CharacterDto.fromEntity(characterEntity));
      expect(mockManager.save).toHaveBeenCalledWith(characterEntity);
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
      characterEntity = { id: 1, name: 'Test Character' } as Character;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(characterEntity),
        save: jest.fn().mockResolvedValue(characterEntity),
        merge: jest.fn(),
      };

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should update an existing character', async () => {
      const result = await characterService.edit(1, characterRequest);

      expect(result).toEqual(CharacterDto.fromEntity(characterEntity));
      expect(mockManager.save).toHaveBeenCalledWith(Character, characterEntity);
    });

    it('should throw NotFoundException if character does not exist', async () => {
      mockManager.findOne = jest.fn().mockResolvedValue(null);

      await expect(characterService.edit(1, characterRequest)).rejects.toThrow(
        NotFoundException,
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

    it('should throw NotFoundException if character does not exist', async () => {
      mockManager.findOne = jest.fn().mockResolvedValue(null);

      await expect(characterService.remove(1)).rejects.toThrow(
        NotFoundException,
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

    it('should throw NotFoundException if character does not exist', async () => {
      mockManager.findOne = jest.fn().mockResolvedValue(null);

      await expect(characterService.setPhoto(1, file)).rejects.toThrow(
        NotFoundException,
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
});
