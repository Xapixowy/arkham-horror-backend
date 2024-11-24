import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { Card } from '@Entities/card.entity';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CardDto } from '@Dtos/card.dto';
import { CreateCardRequest } from '@Requests/card/create-card.request';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileUploadHelper } from '@Helpers/file-upload/file-upload.helper';
import { FileDeleteFailedException } from '@Exceptions/file/file-delete-failed.exception';
import { Language } from '@Enums/language';
import { CardNotFoundException } from '@Exceptions/card/card-not-found.exception';

describe('CardService', () => {
  let cardService: CardService;
  let cardRepository: Repository<Card>;
  let dataSource: DataSource;
  let fileUploadHelper: FileUploadHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useValue: {
            find: jest.fn(),
          },
        },
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
              switch (key) {
                case 'app':
                  return { language: Language.POLISH };
                default:
                  return {};
              }
            }),
          },
        },
      ],
    }).compile();

    cardService = module.get<CardService>(CardService);
    cardRepository = module.get<Repository<Card>>(getRepositoryToken(Card));
    dataSource = module.get<DataSource>(DataSource);
    fileUploadHelper = module.get<FileUploadHelper>(FileUploadHelper);
  });

  describe('findAll', () => {
    it('should retrieve all cards and map to CardDto', async () => {
      const cardEntities = [{ id: 1, locale: Language.POLISH }] as Card[];
      jest.spyOn(cardRepository, 'find').mockResolvedValue(cardEntities);

      const result = await cardService.findAll(Language.POLISH);

      expect(result).toEqual(
        cardEntities.map((card) => CardDto.fromEntity(card)),
      );
    });
  });

  describe('findOne', () => {
    let cardEntity: Card;

    beforeEach(() => {
      cardEntity = { id: 1, locale: Language.POLISH, translations: [] } as Card;
      jest.spyOn(cardService as any, 'getCard').mockResolvedValue(cardEntity);
    });

    it('should retrieve one card by id', async () => {
      const result = await cardService.findOne(1, Language.POLISH);

      expect(result).toEqual(CardDto.fromEntity(cardEntity));
    });

    it('should throw CardNotFoundException if card does not exist', async () => {
      jest
        .spyOn(cardService as any, 'getCard')
        .mockRejectedValue(new CardNotFoundException());

      await expect(cardService.findOne(1, Language.POLISH)).rejects.toThrow(
        CardNotFoundException,
      );
    });
  });

  describe('add', () => {
    let cardRequest: CreateCardRequest;
    let cardEntity: Card;
    let mockManager: {
      create: jest.Mock;
      save: jest.Mock;
    };

    beforeEach(() => {
      cardRequest = { name: 'Test Card' } as CreateCardRequest;
      cardEntity = {
        id: 1,
        ...cardRequest,
        locale: Language.POLISH,
        created_at: new Date(),
        updated_at: new Date(),
      } as Card;
      mockManager = {
        create: jest.fn().mockReturnValue(cardEntity),
        save: jest.fn().mockResolvedValue(cardEntity),
      };

      jest.spyOn(cardService as any, 'getCard').mockResolvedValue(cardEntity);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should add a new card and return CardDto', async () => {
      const result = await cardService.add(cardRequest);

      expect(result).toEqual(CardDto.fromEntity(cardEntity));
      expect(mockManager.save).toHaveBeenCalledWith(cardEntity);
    });
  });

  describe('edit', () => {
    let cardRequest: CreateCardRequest;
    let cardEntity: Card;
    let mockManager: {
      findOne: jest.Mock;
      save: jest.Mock;
      merge: jest.Mock;
    };

    beforeEach(() => {
      cardRequest = { name: 'Updated Card' } as CreateCardRequest;
      cardEntity = { id: 1, name: 'Test Card' } as Card;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(cardEntity),
        save: jest.fn().mockResolvedValue(cardEntity),
        merge: jest.fn(),
      };

      jest.spyOn(cardService as any, 'getCard').mockResolvedValue(cardEntity);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should update an existing card', async () => {
      const result = await cardService.edit(1, cardRequest);

      expect(result).toEqual(CardDto.fromEntity(cardEntity));
      expect(mockManager.save).toHaveBeenCalledWith(Card, cardEntity);
    });

    it('should throw CardNotFoundException if card does not exist', async () => {
      jest
        .spyOn(cardService as any, 'getCard')
        .mockRejectedValue(new CardNotFoundException());

      await expect(cardService.edit(1, cardRequest)).rejects.toThrow(
        CardNotFoundException,
      );
    });
  });

  describe('remove', () => {
    let cardEntity: Card;
    let mockManager: {
      findOne: jest.Mock;
      remove: jest.Mock;
    };

    beforeEach(() => {
      cardEntity = { id: 1 } as Card;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(cardEntity),
        remove: jest.fn().mockResolvedValue(cardEntity),
      };

      jest.spyOn(cardService as any, 'getCard').mockResolvedValue(cardEntity);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should remove an existing card', async () => {
      const result = await cardService.remove(1);

      expect(result).toEqual(CardDto.fromEntity(cardEntity));
      expect(mockManager.remove).toHaveBeenCalledWith(Card, cardEntity);
    });

    it('should throw CardNotFoundException if card does not exist', async () => {
      jest
        .spyOn(cardService as any, 'getCard')
        .mockRejectedValue(new CardNotFoundException());

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));

      await expect(cardService.remove(1)).rejects.toThrow(
        CardNotFoundException,
      );
    });
  });

  describe('setFrontPhoto', () => {
    let cardEntity: Card;
    let file: Express.Multer.File;
    let mockManager: {
      findOne: jest.Mock;
      save: jest.Mock;
    };

    const savedFilePath = 'saved/path/to/file.jpg';

    beforeEach(() => {
      cardEntity = { id: 1 } as Card;
      file = { filename: 'test.jpg' } as Express.Multer.File;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(cardEntity),
        save: jest.fn().mockResolvedValue(cardEntity),
      };

      jest.spyOn(cardService as any, 'getCard').mockResolvedValue(cardEntity);
      jest.spyOn(fileUploadHelper, 'saveFile').mockReturnValue(savedFilePath);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should set the front photo path', async () => {
      const result = await cardService.setFrontPhoto(1, file);

      expect(result).toEqual(CardDto.fromEntity(cardEntity));
      expect(mockManager.save).toHaveBeenCalledWith(Card, cardEntity);
    });

    it('should throw CardNotFoundException if card does not exist', async () => {
      jest
        .spyOn(cardService as any, 'getCard')
        .mockRejectedValue(new CardNotFoundException());

      await expect(cardService.setFrontPhoto(1, file)).rejects.toThrow(
        CardNotFoundException,
      );
    });
  });

  describe('deleteFrontPhoto', () => {
    let cardEntity: Card;
    let mockManager: {
      findOne: jest.Mock;
      save: jest.Mock;
    };

    beforeEach(() => {
      cardEntity = { id: 1, front_image_path: 'path/to/image.jpg' } as Card;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(cardEntity),
        save: jest.fn().mockResolvedValue(cardEntity),
      };

      jest.spyOn(cardService as any, 'getCard').mockResolvedValue(cardEntity);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should delete the front photo if path exists', async () => {
      jest.spyOn(fileUploadHelper, 'deleteFile').mockReturnValue(true);

      const result = await cardService.deleteFrontPhoto(1);

      expect(result).toEqual(CardDto.fromEntity(cardEntity));
      expect(mockManager.save).toHaveBeenCalledWith(Card, cardEntity);
    });

    it('should throw FileDeleteFailedException if file deletion fails', async () => {
      jest.spyOn(fileUploadHelper, 'deleteFile').mockReturnValue(false);

      await expect(cardService.deleteFrontPhoto(1)).rejects.toThrow(
        FileDeleteFailedException,
      );
    });
  });

  describe('setBackPhoto', () => {
    let cardEntity: Card;
    let file: Express.Multer.File;
    let mockManager: {
      findOne: jest.Mock;
      save: jest.Mock;
    };

    const savedFilePath = 'saved/path/to/file.jpg';

    beforeEach(() => {
      cardEntity = { id: 1 } as Card;
      file = { filename: 'test.jpg' } as Express.Multer.File;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(cardEntity),
        save: jest.fn().mockResolvedValue(cardEntity),
      };

      jest.spyOn(cardService as any, 'getCard').mockResolvedValue(cardEntity);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
      jest.spyOn(fileUploadHelper, 'saveFile').mockReturnValue(savedFilePath);
    });

    it('should set the back photo path', async () => {
      const result = await cardService.setBackPhoto(1, file);

      expect(result).toEqual(CardDto.fromEntity(cardEntity));
      expect(mockManager.save).toHaveBeenCalledWith(Card, cardEntity);
    });

    it('should throw CardNotFoundException if card does not exist', async () => {
      jest
        .spyOn(cardService as any, 'getCard')
        .mockRejectedValue(new CardNotFoundException());

      await expect(cardService.setBackPhoto(1, file)).rejects.toThrow(
        CardNotFoundException,
      );
    });
  });

  describe('deleteBackPhoto', () => {
    let cardEntity: Card;
    let mockManager: {
      findOne: jest.Mock;
      save: jest.Mock;
    };

    beforeEach(() => {
      cardEntity = { id: 1, back_image_path: 'path/to/image.jpg' } as Card;
      mockManager = {
        findOne: jest.fn().mockResolvedValue(cardEntity),
        save: jest.fn().mockResolvedValue(cardEntity),
      };

      jest.spyOn(cardService as any, 'getCard').mockResolvedValue(cardEntity);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb(mockManager));
    });

    it('should delete the back photo if path exists', async () => {
      jest.spyOn(fileUploadHelper, 'deleteFile').mockReturnValue(true);

      const result = await cardService.deleteBackPhoto(1);

      expect(result).toEqual(CardDto.fromEntity(cardEntity));
      expect(mockManager.save).toHaveBeenCalledWith(Card, cardEntity);
    });

    it('should throw FileDeleteFailedException if file deletion fails', async () => {
      jest.spyOn(fileUploadHelper, 'deleteFile').mockReturnValue(false);

      await expect(cardService.deleteBackPhoto(1)).rejects.toThrow(
        FileDeleteFailedException,
      );
    });
  });
});
