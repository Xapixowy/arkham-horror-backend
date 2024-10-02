import { Injectable } from '@nestjs/common';
import { CreateCardRequest } from '@Requests/Card/create-card.request';
import { ErrorEnum } from '@Enums/error.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from '@Entities/card.entity';
import { DataSource, Repository } from 'typeorm';
import { CardDto } from '@DTOs/Card/card.dto';

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

  async findOne(id: number): Promise<CardDto | null> {
    const existingCard = this.cardRepository.findOneBy({ id });
    if (!existingCard) {
      throw new Error(ErrorEnum.NOT_FOUND);
    }
    return CardDto.fromEntity(await existingCard);
  }

  async add(cardRequest: CreateCardRequest): Promise<void> {
    const card = this.cardRepository.create(cardRequest);
    return this.dataSource.transaction(async (manager) => {
      await manager.save(card);
    });
  }

  async edit(id: number, cardRequest: CreateCardRequest): Promise<void> {
    return await this.dataSource.transaction(async (manager) => {
      const existingCard = await manager.findOneBy(Card, { id });
      if (!existingCard) {
        throw new Error(ErrorEnum.NOT_FOUND);
      }
      manager.merge(Card, existingCard, cardRequest);
      await manager.save(Card, existingCard);
    });
  }

  async remove(id: number): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const existingCard = await manager.findOneBy(Card, { id });
      if (!existingCard) {
        throw new Error(ErrorEnum.NOT_FOUND);
      }
      await manager.remove(Card, existingCard);
    });
  }
}
