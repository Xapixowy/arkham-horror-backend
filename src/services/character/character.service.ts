import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from '@Entities/character.entity';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { CharacterDto } from '@Dtos/character.dto';
import { CreateCharacterRequest } from '@Requests/character/create-character.request';
import { UpdateCharacterRequest } from '@Requests/character/update-character.request';
import { FileUploadHelper } from '@Helpers/file-upload/file-upload.helper';
import { FileDeleteFailedException } from '@Exceptions/file/file-delete-failed.exception';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@Configs/app.config';
import { Language } from '@Enums/language';
import { Card } from '@Entities/card.entity';
import { CharacterCard } from '@Entities/character-card.entity';
import { CharacterCardDto } from '@Dtos/character-card.dto';
import { CardService } from '@Services/card/card.service';

@Injectable()
export class CharacterService {
  appLanguage: Language;

  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private dataSource: DataSource,
    private fileUploadHelper: FileUploadHelper,
    private configService: ConfigService,
  ) {
    this.appLanguage = this.configService.get<AppConfig>('app').language;
  }

  async findAll(language: Language): Promise<CharacterDto[]> {
    const characters = await this.characterRepository.find({
      relations: [
        'translations',
        'characterCards',
        'characterCards.card',
        'characterCards.card.translations',
      ],
      order: {
        id: 'ASC',
      },
    });

    return characters.map((character) =>
      this.mapCharacterToTranslatedCharacterDto(character, language),
    );
  }

  async findOne(id: number, language: Language): Promise<CharacterDto> {
    const existingCharacter = await this.getCharacter(id);

    return this.mapCharacterToTranslatedCharacterDto(
      existingCharacter,
      language,
    );
  }

  async add(characterRequest: CreateCharacterRequest): Promise<CharacterDto> {
    return this.dataSource.transaction(async (manager) => {
      const character = manager.create(Character, {
        ...characterRequest,
        locale: this.appLanguage,
      });

      const characterEntity = await manager.save(Character, character);

      const characterCards = await this.assignCardsToCharacter(
        characterEntity,
        characterRequest.cardIds,
        manager,
      );

      const characterCardDtos = characterCards.map((characterCardEntity) =>
        CharacterCardDto.fromEntity(characterCardEntity, {
          card: true,
        }),
      );

      const characterDto = CharacterDto.fromEntity(characterEntity, {
        characterCards: true,
      });

      characterDto.characterCards = characterCardDtos;

      return characterDto;
    });
  }

  async edit(
    id: number,
    characterRequest: UpdateCharacterRequest,
  ): Promise<CharacterDto> {
    const existingCharacter = await this.getCharacter(id);

    return await this.dataSource.transaction(async (manager) => {
      manager.merge(Character, existingCharacter, {
        ...characterRequest,
        updated_at: new Date(),
      });

      const updatedCharacter = await manager.save(Character, existingCharacter);

      const characterCards = await this.assignCardsToCharacter(
        updatedCharacter,
        characterRequest.cardIds,
        manager,
      );

      const characterCardDtos = characterCards.map((characterCardEntity) =>
        CharacterCardDto.fromEntity(characterCardEntity, {
          card: true,
        }),
      );

      const characterDto = CharacterDto.fromEntity(updatedCharacter, {
        characterCards: true,
      });

      characterDto.characterCards = characterCardDtos;

      return characterDto;
    });
  }

  async remove(id: number): Promise<CharacterDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCharacter = await manager.findOne(Character, {
        where: { id },
      });
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
      const existingCharacter = await manager.findOne(Character, {
        where: { id },
      });
      if (!existingCharacter) {
        throw new NotFoundException();
      }

      const savedFilePath = this.fileUploadHelper.saveFile(
        file,
        this.fileUploadHelper.generateDestinationPath(`characters/${id}`, true),
      );

      existingCharacter.image_path =
        this.fileUploadHelper.localToRemotePath(savedFilePath);
      existingCharacter.updated_at = new Date();

      return CharacterDto.fromEntity(
        await manager.save(Character, existingCharacter),
      );
    });
  }

  async deletePhoto(id: number): Promise<CharacterDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCharacter = await manager.findOne(Character, {
        where: { id },
      });
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
        existingCharacter.updated_at = new Date();
      }

      return CharacterDto.fromEntity(
        await manager.save(Character, existingCharacter),
      );
    });
  }

  static getTranslatedCharacter(
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

  private async assignCardsToCharacter(
    character: Character,
    cardIds: number[] | undefined,
    manager: EntityManager,
  ): Promise<CharacterCard[]> {
    if (cardIds === undefined && character.characterCards === undefined) {
      return [];
    }

    if (cardIds === undefined) {
      return character.characterCards;
    }

    const characterCards: CharacterCard[] = character.characterCards || [];

    characterCards.forEach((characterCard) => {
      manager.remove(CharacterCard, characterCard);
    });

    const cardsToAssign = await this.cardRepository.find({
      where: { id: In(cardIds) },
    });

    const cardsToAssignWithQuantity = cardsToAssign.map((card) => ({
      card,
      quantity: cardIds.filter((cardId) => cardId === card.id).length,
    }));

    return await manager.save(
      CharacterCard,
      cardsToAssignWithQuantity.map((cardToAssignWithQuantity) => ({
        ...cardToAssignWithQuantity,
        character,
      })),
    );
  }

  private async getCharacter(
    id: number,
    relations: string[] = [
      'translations',
      'characterCards',
      'characterCards.card',
      'characterCards.card.translations',
    ],
  ): Promise<Character> {
    const existingCharacter = await this.characterRepository.findOne({
      where: { id },
      relations,
    });

    if (!existingCharacter) {
      throw new NotFoundException();
    }

    return existingCharacter;
  }

  private mapCharacterToTranslatedCharacterDto(
    character: Character,
    language: Language,
  ): CharacterDto {
    const translatedCharacter = CharacterService.getTranslatedCharacter(
      character,
      language,
    );

    const characterDto = CharacterDto.fromEntity(translatedCharacter, {
      characterCards: true,
    });

    characterDto.characterCards = character.characterCards.map(
      (characterCard) => {
        const translatedCard = CardService.getTranslatedCard(
          characterCard.card,
          language,
        );

        return CharacterCardDto.fromEntity(
          {
            ...characterCard,
            card: translatedCard,
          },
          {
            card: true,
          },
        );
      },
    );

    return characterDto;
  }
}
