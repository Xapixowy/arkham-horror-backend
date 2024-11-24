import { Injectable } from '@nestjs/common';
import { CreateCardRequest } from '@Requests/card/create-card.request';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from '@Entities/card.entity';
import { DataSource, Repository } from 'typeorm';
import { CardDto } from '@Dtos/card.dto';
import { FileUploadHelper } from '@Helpers/file-upload/file-upload.helper';
import { FileDeleteFailedException } from '@Exceptions/file/file-delete-failed.exception';
import { Language } from '@Enums/language';
import { AppConfig } from '@Configs/app.config';
import { ConfigService } from '@nestjs/config';
import { CardNotFoundException } from '@Exceptions/card/card-not-found.exception';

@Injectable()
export class CardService {
  appLanguage: Language;

  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private dataSource: DataSource,
    private fileUploadHelper: FileUploadHelper,
    private configService: ConfigService,
  ) {
    this.appLanguage = this.configService.get<AppConfig>('app').language;
  }

  async findAll(language: Language): Promise<CardDto[]> {
    const cards = await this.cardRepository.find({
      relations: ['translations'],
      order: {
        id: 'ASC',
      },
    });
    return cards.map((card) =>
      CardDto.fromEntity(
        language !== card.locale
          ? CardService.getTranslatedCard(card, language)
          : card,
      ),
    );
  }

  async findOne(id: number, language: Language): Promise<CardDto> {
    const existingCard = await this.getCard(id, ['translations']);

    return CardDto.fromEntity(
      language !== existingCard.locale
        ? CardService.getTranslatedCard(existingCard, language)
        : existingCard,
    );
  }

  async add(cardRequest: CreateCardRequest): Promise<CardDto> {
    return this.dataSource.transaction(async (manager) => {
      const card = manager.create(Card, {
        ...cardRequest,
        locale: this.appLanguage,
      });

      return CardDto.fromEntity(await manager.save(card));
    });
  }

  async edit(id: number, cardRequest: CreateCardRequest): Promise<CardDto> {
    const existingCard = await this.getCard(id);

    return await this.dataSource.transaction(async (manager) => {
      manager.merge(Card, existingCard, {
        ...cardRequest,
        updated_at: new Date(),
      });
      return CardDto.fromEntity(await manager.save(Card, existingCard));
    });
  }

  async remove(id: number): Promise<CardDto> {
    const existingCard = await this.getCard(id);
    return this.dataSource.transaction(async (manager) => {
      await manager.remove(Card, existingCard);

      return CardDto.fromEntity(existingCard);
    });
  }

  async setFrontPhoto(id: number, file: Express.Multer.File): Promise<CardDto> {
    const existingCard = await this.getCard(id);

    return this.dataSource.transaction(async (manager) => {
      const savedFilePath = this.fileUploadHelper.saveFile(
        file,
        this.fileUploadHelper.generateDestinationPath(`cards/${id}`, true),
      );

      existingCard.front_image_path =
        this.fileUploadHelper.localToRemotePath(savedFilePath);
      existingCard.updated_at = new Date();

      return CardDto.fromEntity(await manager.save(Card, existingCard));
    });
  }

  async deleteFrontPhoto(id: number): Promise<CardDto> {
    const existingCard = await this.getCard(id);

    return this.dataSource.transaction(async (manager) => {
      if (existingCard.front_image_path) {
        const isFileDeleted = this.fileUploadHelper.deleteFile(
          this.fileUploadHelper.remoteToLocalPath(
            existingCard.front_image_path,
          ),
        );

        if (!isFileDeleted) {
          throw new FileDeleteFailedException();
        }

        existingCard.front_image_path = null;
        existingCard.updated_at = new Date();
      }

      return CardDto.fromEntity(await manager.save(Card, existingCard));
    });
  }

  async setBackPhoto(id: number, file: Express.Multer.File): Promise<CardDto> {
    const existingCard = await this.getCard(id);

    return this.dataSource.transaction(async (manager) => {
      const savedFilePath = this.fileUploadHelper.saveFile(
        file,
        this.fileUploadHelper.generateDestinationPath(`cards/${id}`, true),
      );

      existingCard.back_image_path =
        this.fileUploadHelper.localToRemotePath(savedFilePath);
      existingCard.updated_at = new Date();

      return CardDto.fromEntity(await manager.save(Card, existingCard));
    });
  }

  async deleteBackPhoto(id: number): Promise<CardDto> {
    const existingCard = await this.getCard(id);

    return this.dataSource.transaction(async (manager) => {
      if (existingCard.back_image_path) {
        const isFileDeleted = this.fileUploadHelper.deleteFile(
          this.fileUploadHelper.remoteToLocalPath(existingCard.back_image_path),
        );

        if (!isFileDeleted) {
          throw new FileDeleteFailedException();
        }

        existingCard.back_image_path = null;
        existingCard.updated_at = new Date();
      }

      return CardDto.fromEntity(await manager.save(Card, existingCard));
    });
  }

  private async getCard(
    id: number,
    relations: string[] = ['translations'],
  ): Promise<Card> {
    const existingCard = this.cardRepository.findOne({
      where: { id },
      relations,
    });

    if (!existingCard) {
      throw new CardNotFoundException();
    }

    return existingCard;
  }

  static getTranslatedCard(card: Card, language: Language): Card {
    const isTranslation = card.translations
      .map((translation) => translation.locale)
      .includes(language);

    if (card.locale !== language && isTranslation) {
      const translation = card.translations.find(
        (translation) => translation.locale === language,
      );
      card.name = translation.name;
      card.description = translation.description;
      card.locale = translation.locale;
    }

    return card;
  }
}
