import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from '@Entities/character.entity';
import { DataSource, Repository } from 'typeorm';
import { CharacterDto } from '@DTOs/character.dto';
import { CreateCharacterRequest } from '@Requests/Character/create-character.request';
import { UpdateCharacterRequest } from '@Requests/Character/update-character.request';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { GameSession } from '@Entities/game-session.entity';
import { GameSessionDto } from '@DTOs/game-session.dto';

@Injectable()
export class GameSessionService {
  constructor(
    @InjectRepository(GameSession)
    private gameSessionRepository: Repository<GameSession>,
    private dataSource: DataSource,
  ) {}

  async findOne(token: string): Promise<GameSessionDto> {
    const existingSession = await this.gameSessionRepository.findOne({
      where: { token },
    });
    if (!existingSession) {
      throw new NotFoundException();
    }
    return GameSessionDto.fromEntity(existingSession);
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
      manager.merge(Character, existingCharacter, {
        ...characterRequest,
        updated_at: new Date(),
      });
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
}
