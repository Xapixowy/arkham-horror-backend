import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from '@Entities/character.entity';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { ConfigService } from '@nestjs/config';
import { CreateCharacterTranslationRequest } from '@Requests/character-translation/create-character-translation.request';
import { CharacterTranslation } from '@Entities/character-translation.entity';
import { TranslationExistsException } from '@Exceptions/translation-exists.exception';
import { CharacterTranslationDto } from '@Dtos/character-translation.dto';
import { AppConfig } from '@Configs/app.config';
import { LanguageNotSupportedExceptionException } from '@Exceptions/language-not-supported-exception.exception';
import { UpdateCharacterTranslationRequest } from '@Requests/character-translation/update-character-translation.request';

@Injectable()
export class CharacterTranslationService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async findAll(characterId: number): Promise<CharacterTranslationDto[]> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
      relations: ['translations'],
      order: {
        id: 'ASC',
      },
    });
    if (!character) {
      throw new NotFoundException();
    }
    return character.translations.map((translation) =>
      CharacterTranslationDto.fromEntity(translation),
    );
  }

  async findOne(
    characterId: number,
    locale: string,
  ): Promise<CharacterTranslationDto> {
    const character = await this.characterRepository.findOne({
      where: { id: characterId },
      relations: ['translations'],
    });
    if (!character) {
      throw new NotFoundException();
    }
    const translation = character.translations.find(
      (translation) => translation.locale === locale,
    );
    if (!translation) {
      throw new NotFoundException();
    }
    return CharacterTranslationDto.fromEntity(translation);
  }

  async add(
    characterId: number,
    characterTranslationRequest: CreateCharacterTranslationRequest,
  ): Promise<CharacterTranslationDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCharacter = await manager.findOne(Character, {
        where: { id: characterId },
        relations: ['translations'],
      });
      if (!existingCharacter) {
        throw new NotFoundException();
      }

      const availableLanguages = this.configService
        .get<AppConfig>('app')
        .available_languages.filter(
          (language) =>
            language !== this.configService.get<AppConfig>('app').language,
        );
      if (!availableLanguages.includes(characterTranslationRequest.locale)) {
        throw new LanguageNotSupportedExceptionException();
      }

      const existingCharacterTranslations = new Set<string>(
        existingCharacter.translations.map((translation) => translation.locale),
      );
      if (
        existingCharacterTranslations.has(characterTranslationRequest.locale)
      ) {
        throw new TranslationExistsException();
      }

      const characterTranslation = await manager.save(CharacterTranslation, {
        ...characterTranslationRequest,
        character: existingCharacter,
      });

      return CharacterTranslationDto.fromEntity(characterTranslation);
    });
  }

  async edit(
    characterId: number,
    locale: string,
    characterTranslationRequest: UpdateCharacterTranslationRequest,
  ): Promise<CharacterTranslationDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCharacter = await manager.findOne(Character, {
        where: { id: characterId },
        relations: ['translations'],
      });
      if (!existingCharacter) {
        throw new NotFoundException();
      }

      const existingCharacterTranslation = existingCharacter.translations.find(
        (translation) => translation.locale === locale,
      );
      if (!existingCharacterTranslation) {
        throw new NotFoundException();
      }

      manager.merge(CharacterTranslation, existingCharacterTranslation, {
        ...characterTranslationRequest,
        updated_at: new Date(),
      });

      return CharacterTranslationDto.fromEntity(
        await manager.save(CharacterTranslation, existingCharacterTranslation),
      );
    });
  }

  async delete(
    characterId: number,
    locale: string,
  ): Promise<CharacterTranslationDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCharacter = await manager.findOne(Character, {
        where: { id: characterId },
        relations: ['translations'],
      });
      if (!existingCharacter) {
        throw new NotFoundException();
      }

      const existingCharacterTranslation = existingCharacter.translations.find(
        (translation) => translation.locale === locale,
      );
      if (!existingCharacterTranslation) {
        throw new NotFoundException();
      }

      return CharacterTranslationDto.fromEntity(
        await manager.remove(
          CharacterTranslation,
          existingCharacterTranslation,
        ),
      );
    });
  }
}
