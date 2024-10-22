import { Injectable } from '@nestjs/common';
import { CreateCardRequest } from '@Requests/Card/create-card.request';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from '@Entities/card.entity';
import { DataSource, Repository } from 'typeorm';
import { CardDto } from '@DTOs/card.dto';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { FileUploadHelper } from '@Helpers/file-upload.helper';
import { FileDeleteFailedException } from '@Exceptions/File/file-delete-failed.exception';
import { Language } from '@Enums/language';
import { AppConfig } from '../Config/app.config';
import { ConfigService } from '@nestjs/config';

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

  async findAll(language?: Language): Promise<CardDto[]> {
    const cards = await this.cardRepository.find();
    return cards.map((card) =>
      CardDto.fromEntity(
        language ? this.getTranslatedCard(card, language) : card,
      ),
    );
  }

  async findOne(id: number, language?: Language): Promise<CardDto> {
    const existingCard = await this.cardRepository.findOneBy({ id });
    if (!existingCard) {
      throw new NotFoundException();
    }
    return CardDto.fromEntity(
      language ? this.getTranslatedCard(existingCard, language) : existingCard,
    );
  }

  async add(cardRequest: CreateCardRequest): Promise<CardDto> {
    const card = this.cardRepository.create({
      ...cardRequest,
      locale: this.appLanguage,
    });
    return this.dataSource.transaction(async (manager) =>
      CardDto.fromEntity(await manager.save(card)),
    );
  }

  async edit(id: number, cardRequest: CreateCardRequest): Promise<CardDto> {
    return await this.dataSource.transaction(async (manager) => {
      const existingCard = await manager.findOneBy(Card, { id });
      if (!existingCard) {
        throw new NotFoundException();
      }
      manager.merge(Card, existingCard, {
        ...cardRequest,
        updated_at: new Date(),
      });
      return CardDto.fromEntity(await manager.save(Card, existingCard));
    });
  }

  async remove(id: number): Promise<CardDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCard = await manager.findOneBy(Card, { id });
      if (!existingCard) {
        throw new NotFoundException();
      }
      return CardDto.fromEntity(await manager.remove(Card, existingCard));
    });
  }

  async setFrontPhoto(id: number, file: Express.Multer.File): Promise<CardDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingCard = await manager.findOneBy(Card, { id });
      if (!existingCard) {
        throw new NotFoundException();
      }

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
    return this.dataSource.transaction(async (manager) => {
      const existingCard = await manager.findOneBy(Card, { id });
      if (!existingCard) {
        throw new NotFoundException();
      }

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
    return this.dataSource.transaction(async (manager) => {
      const existingCard = await manager.findOneBy(Card, { id });
      if (!existingCard) {
        throw new NotFoundException();
      }

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
    return this.dataSource.transaction(async (manager) => {
      const existingCard = await manager.findOneBy(Card, { id });
      if (!existingCard) {
        throw new NotFoundException();
      }

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

  private getTranslatedCard(card: Card, language: Language): Card {
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
