import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from '@Entities/character.entity';
import { DataSource, Repository } from 'typeorm';
import { CharacterDto } from '@DTOs/character.dto';
import { CreateCharacterRequest } from '@Requests/Character/create-character.request';
import { UpdateCharacterRequest } from '@Requests/Character/update-character.request';
import { FileMissingException } from '@Exceptions/File/file-missing.exception';
import { FileWrongFileTypeException } from '@Exceptions/File/file-wrong-file-type.exception';
import { FileMaximumSizeExceededException } from '@Exceptions/File/file-maximum-size-exceeded.exception';
import { FileUploadHelper } from '@Helpers/file-upload.helper';

@Injectable()
export class CharacterService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<CharacterDto[]> {
    const characters = await this.characterRepository.find();
    return characters.map((character) => CharacterDto.fromEntity(character));
  }

  async findOne(id: number): Promise<CharacterDto> {
    const existingCharacter = await this.characterRepository.findOneBy({ id });
    if (!existingCharacter) {
      throw new NotFoundException();
    }
    return CharacterDto.fromEntity(existingCharacter);
  }

  async add(characterRequest: CreateCharacterRequest): Promise<CharacterDto> {
    const character = this.characterRepository.create(characterRequest);
    return this.dataSource.transaction(async (manager) =>
      CharacterDto.fromEntity(await manager.save(character)),
    );
  }

  async edit(
    id: number,
    characterRequest: UpdateCharacterRequest,
  ): Promise<CharacterDto> {
    return await this.dataSource.transaction(async (manager) => {
      const existingCharacter = await manager.findOneBy(Character, { id });
      if (!existingCharacter) {
        throw new NotFoundException();
      }
      manager.merge(Character, existingCharacter, characterRequest);
      return CharacterDto.fromEntity(
        await manager.save(Character, existingCharacter),
      );
    });
  }

  async remove(id: number): Promise<CharacterDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCharacter = await manager.findOneBy(Character, { id });
      if (!existingCharacter) {
        throw new NotFoundException();
      }
      return CharacterDto.fromEntity(
        await manager.remove(Character, existingCharacter),
      );
    });
  }

  async setPhoto(
    id: number,
    file?: Express.Multer.File,
  ): Promise<CharacterDto> {
    this.validateFile(file);

    return this.dataSource.transaction(async (manager) => {
      const existingCharacter = await manager.findOneBy(Character, { id });
      if (!existingCharacter) {
        throw new NotFoundException();
      }
      existingCharacter.image_path = FileUploadHelper.localToRemotePath(
        file.path,
      );

      return CharacterDto.fromEntity(
        await manager.save(Character, existingCharacter),
      );
    });
  }

  private validateFile(file: Express.Multer.File) {
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    const maximumSize = 5 * 1024 * 1024; // 5MB

    if (!file) {
      throw new FileMissingException();
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new FileWrongFileTypeException(allowedMimeTypes);
    }

    if (file.size > maximumSize) {
      throw new FileMaximumSizeExceededException();
    }
  }
}
