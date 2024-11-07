import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { GameSession } from '@Entities/game-session.entity';
import { GameSessionDto } from '@Dtos/game-session.dto';
import { User } from '@Entities/user.entity';
import { StringHelper } from '@Helpers/string/string.helper';
import { Player } from '@Entities/player.entity';
import { PlayerService } from '../player/player.service';

@Injectable()
export class GameSessionService {
  constructor(
    @InjectRepository(GameSession)
    private readonly gameSessionRepository: Repository<GameSession>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly playerService: PlayerService,
  ) {}

  async findAll(): Promise<GameSessionDto[]> {
    return this.dataSource.transaction(async (manager) => {
      const gameSessions = await manager.find(GameSession, {
        relations: ['players'],
      });
      return gameSessions.map((gameSession) =>
        GameSessionDto.fromEntity(gameSession, {
          players: true,
        }),
      );
    });
  }

  async findOne(token: string): Promise<GameSessionDto> {
    const existingGameSession = await this.gameSessionRepository.findOne({
      where: { token },
      relations: ['players'],
    });
    if (!existingGameSession) {
      throw new NotFoundException();
    }
    return GameSessionDto.fromEntity(existingGameSession, {
      players: true,
    });
  }

  async add(userId: number): Promise<GameSessionDto> {
    return this.dataSource.transaction(async (manager) => {
      const token = await this.getUnusedToken();

      const newGameSession = await manager.save(
        GameSession,
        manager.create(GameSession, {
          token,
        }),
      );

      const newPlayer = manager.create(
        Player,
        await this.playerService.generatePlayerObject(newGameSession, true),
      );

      await manager.save(Player, newPlayer);

      return GameSessionDto.fromEntity(newGameSession);
    });
  }

  async remove(token: string): Promise<GameSessionDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingGameSession = await manager.findOne(GameSession, {
        where: { token },
      });
      if (!existingGameSession) {
        throw new NotFoundException();
      }
      return GameSessionDto.fromEntity(
        await manager.remove(GameSession, existingGameSession),
      );
    });
  }

  private async getUnusedToken(): Promise<string> {
    const token = StringHelper.generateRandomString(6, {
      symbols: false,
    }).toUpperCase();

    const isTokenAlreadyUsed = await this.gameSessionRepository.findOne({
      where: { token },
    });

    if (isTokenAlreadyUsed) {
      return this.getUnusedToken();
    }

    return token;
  }
}
