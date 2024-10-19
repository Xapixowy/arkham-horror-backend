import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from '@Entities/character.entity';
import { DataSource, Repository } from 'typeorm';
import { CharacterDto } from '@DTOs/character.dto';
import { CreateCharacterRequest } from '@Requests/Character/create-character.request';
import { UpdateCharacterRequest } from '@Requests/Character/update-character.request';
import { FileUploadHelper } from '@Helpers/file-upload.helper';
import { FileDeleteFailedException } from '@Exceptions/File/file-delete-failed.exception';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../Config/app.config';
import { Language } from '@Enums/language';

@Injectable()
export class CharacterService {
  appLanguage: Language;

  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private dataSource: DataSource,
    private fileUploadHelper: FileUploadHelper,
    private configService: ConfigService,
  ) {
    this.appLanguage = this.configService.get<AppConfig>('app').language;
  }

  async findAll(language?: Language): Promise<CharacterDto[]> {
    const characters = await this.characterRepository.find();
    return characters.map((character) =>
      CharacterDto.fromEntity(
        language ? this.getTranslatedCharacter(character, language) : character,
      ),
    );
  }

  async findOne(id: number, language?: Language): Promise<CharacterDto> {
    const existingCharacter = await this.characterRepository.findOneBy({ id });
    if (!existingCharacter) {
      throw new NotFoundException();
    }
    return CharacterDto.fromEntity(
      language
        ? this.getTranslatedCharacter(existingCharacter, language)
        : existingCharacter,
    );
  }

  async add(characterRequest: CreateCharacterRequest): Promise<CharacterDto> {
    const character = this.characterRepository.create({
      ...characterRequest,
      locale: this.appLanguage,
    });
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

  async setPhoto(id: number, file: Express.Multer.File): Promise<CharacterDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCharacter = await manager.findOneBy(Character, { id });
      if (!existingCharacter) {
        throw new NotFoundException();
      }

      const savedFilePath = this.fileUploadHelper.saveFile(
        file,
        this.fileUploadHelper.generateDestinationPath(`characters/${id}`, true),
      );

      existingCharacter.image_path =
        this.fileUploadHelper.localToRemotePath(savedFilePath);

      return CharacterDto.fromEntity(
        await manager.save(Character, existingCharacter),
      );
    });
  }

  async deletePhoto(id: number): Promise<CharacterDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCharacter = await manager.findOneBy(Character, { id });
      if (!existingCharacter) {
        throw new NotFoundException();
      }

      if (existingCharacter.image_path) {
        const isFileDeleted = this.fileUploadHelper.deleteFile(
          this.fileUploadHelper.remoteToLocalPath(existingCharacter.image_path),
        );

        if (!isFileDeleted) {
          throw new FileDeleteFailedException();
        }

        existingCharacter.image_path = null;
      }

      return CharacterDto.fromEntity(
        await manager.save(Character, existingCharacter),
      );
    });
  }

  private getTranslatedCharacter(
    character: Character,
    language: Language,
  ): Character {
    const isTranslation = character.translations
      .map((translation) => translation.locale)
      .includes(language);

    if (character.locale !== language && isTranslation) {
      const translation = character.translations.find(
        (translation) => translation.locale === language,
      );
      character.name = translation.name;
      character.description = translation.description;
      character.profession = translation.profession;
      character.starting_location = translation.starting_location;
      character.locale = translation.locale;
    }

    return character;
  }
}
