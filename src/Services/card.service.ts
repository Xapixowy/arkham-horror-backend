import { Injectable } from '@nestjs/common';
import { CreateCardRequest } from '@Requests/Card/create-card.request';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from '@Entities/card.entity';
import { DataSource, Repository } from 'typeorm';
import { CardDto } from '@DTOs/card.dto';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { FileUploadHelper } from '@Helpers/file-upload.helper';
import { FileDeleteFailedException } from '@Exceptions/File/file-delete-failed.exception';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<CardDto[]> {
    const cards = await this.cardRepository.find();
    return cards.map((card) => CardDto.fromEntity(card));
  }

  async findOne(id: number): Promise<CardDto> {
    const existingCard = await this.cardRepository.findOneBy({ id });
    if (!existingCard) {
      throw new NotFoundException();
    }
    return CardDto.fromEntity(existingCard);
  }

  async add(cardRequest: CreateCardRequest): Promise<CardDto> {
    const card = this.cardRepository.create(cardRequest);
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
      manager.merge(Card, existingCard, cardRequest);
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

      const savedFilePath = FileUploadHelper.saveFile(
        file,
        FileUploadHelper.generateDestinationPath(`cards/${id}`, true),
      );

      existingCard.front_image_path =
        FileUploadHelper.localToRemotePath(savedFilePath);

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
        const isFileDeleted = FileUploadHelper.deleteFile(
          FileUploadHelper.remoteToLocalPath(existingCard.front_image_path),
        );

        if (!isFileDeleted) {
          throw new FileDeleteFailedException();
        }

        existingCard.front_image_path = null;
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

      const savedFilePath = FileUploadHelper.saveFile(
        file,
        FileUploadHelper.generateDestinationPath(`cards/${id}`, true),
      );

      existingCard.back_image_path =
        FileUploadHelper.localToRemotePath(savedFilePath);

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
        const isFileDeleted = FileUploadHelper.deleteFile(
          FileUploadHelper.remoteToLocalPath(existingCard.back_image_path),
        );

        if (!isFileDeleted) {
          throw new FileDeleteFailedException();
        }

        existingCard.back_image_path = null;
      }

      return CardDto.fromEntity(await manager.save(Card, existingCard));
    });
  }
}
