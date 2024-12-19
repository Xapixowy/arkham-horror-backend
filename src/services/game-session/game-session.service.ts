import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { GameSession } from '@Entities/game-session.entity';
import { GameSessionDto } from '@Dtos/game-session.dto';
import { User } from '@Entities/user.entity';
import { StringHelper } from '@Helpers/string/string.helper';
import { PlayerService } from '../player/player.service';
import { ConfigService } from '@nestjs/config';
import { GameSessionsConfig } from '@Configs/game_sessions.config';
import { GameSessionPhase } from '@Enums/game-session/game-session-phase.enum';
import { EnumHelper } from '@Helpers/enum/enum.helper';
import { Player } from '@Entities/player.entity';
import { GameSessionsGateway } from '@Gateways/game-sessions.gateway';
import { PlayerDto } from '@Dtos/player.dto';
import { GameSessionNotFoundException } from '@Exceptions/game-session/game-session-not-found.exception';
import { GameSessionJoinResponse } from '@Responses/game-session/game-session.join.response';

@Injectable()
export class GameSessionService {
  constructor(
    @InjectRepository(GameSession)
    private readonly gameSessionRepository: Repository<GameSession>,
    private readonly dataSource: DataSource,
    private readonly playerService: PlayerService,
    private readonly configService: ConfigService,
    private readonly gameSessionsGateway: GameSessionsGateway,
  ) {}

  async findAll(): Promise<GameSessionDto[]> {
    return this.dataSource.transaction(async (manager) => {
      const gameSessions = await manager.find(GameSession, {
        relations: [
          'players',
          'players.user',
          'players.character',
          'players.character.translations',
          'players.playerCards',
          'players.playerCards.card',
          'players.playerCards.card.translations',
        ],
        order: {
          id: 'ASC',
        },
      });
      return gameSessions.map((gameSession) =>
        GameSessionService.createGameSessionDtoFromEntity(gameSession),
      );
    });
  }

  async findOne(token: string): Promise<GameSessionDto> {
    const existingGameSession = await this.getGameSession(token);

    return GameSessionService.createGameSessionDtoFromEntity(
      existingGameSession,
    );
  }

  async add(user: User | null): Promise<GameSessionDto> {
    return this.dataSource.transaction(async (manager) => {
      const token = await this.getUnusedToken();

      const newGameSession = await manager.save(
        GameSession,
        manager.create(GameSession, {
          token,
        }),
      );

      const newGameSessionDto = GameSessionDto.fromEntity(newGameSession, {
        players: true,
      });

      newGameSessionDto.players = [
        await this.playerService.addPlayerToGameSession(
          newGameSession,
          manager,
          true,
          user,
        ),
      ];

      return newGameSessionDto;
    });
  }

  async remove(token: string): Promise<GameSessionDto> {
    return this.dataSource.transaction(async (manager) => {
      const existingGameSession = await manager.findOne(GameSession, {
        where: { token },
      });
      if (!existingGameSession) {
        throw new GameSessionNotFoundException();
      }

      return GameSessionDto.fromEntity(
        await manager.remove(GameSession, existingGameSession),
      );
    });
  }

  async join(
    token: string,
    player: Player | null,
    user: User | null,
  ): Promise<GameSessionJoinResponse> {
    const existingGameSession = await this.getGameSession(token);

    let userPlayer: Player | null = null;

    if (user) {
      userPlayer = existingGameSession.players.find(
        (existingPlayer) => existingPlayer.user?.id === user!.id,
      );
    }

    if (!userPlayer && player) {
      userPlayer = existingGameSession.players.find(
        (existingPlayer) => existingPlayer.token === player!.token,
      );
    }

    if (userPlayer) {
      return {
        game_session:
          GameSessionService.createGameSessionDtoFromEntity(
            existingGameSession,
          ),
        player: PlayerService.createPlayerDtoFromEntity(userPlayer),
      };
    }

    const newPlayer = await this.playerService.add(
      existingGameSession.token,
      user,
    );

    this.gameSessionsGateway.emitGameSessionPlayerJoinedEvent(
      existingGameSession.token,
      newPlayer,
    );

    const updatedGameSession = await this.getGameSession(token);

    return {
      game_session:
        GameSessionService.createGameSessionDtoFromEntity(updatedGameSession),
      player: newPlayer,
    };
  }

  async resetPhase(token: string): Promise<GameSessionDto> {
    const gameSessionConfig =
      this.configService.get<GameSessionsConfig>('gameSessions');
    const gameSession = await this.getGameSession(token);

    return this.dataSource.transaction(async (manager) => {
      gameSession.phase = gameSessionConfig.defaultPhase;
      gameSession.updated_at = new Date();

      const updatedGameSession = await manager.save(GameSession, gameSession);

      this.gameSessionsGateway.emitPhaseChangedEvent(
        updatedGameSession.token,
        updatedGameSession.phase,
      );

      return GameSessionDto.fromEntity(updatedGameSession, {
        players: true,
      });
    });
  }

  async nextPhase(token: string): Promise<GameSessionDto> {
    const gameSession = await this.getGameSession(token);

    return this.dataSource.transaction(async (manager) => {
      const phases = EnumHelper.getValues(GameSessionPhase) as number[];
      const maxPhaseValue = Math.max(...phases);
      const minPhaseValue = Math.min(...phases);
      const theoreticalNextPhaseValue = gameSession.phase + 1;

      gameSession.phase =
        theoreticalNextPhaseValue > maxPhaseValue
          ? minPhaseValue
          : theoreticalNextPhaseValue;
      gameSession.updated_at = new Date();

      const updatedGameSession = await manager.save(GameSession, gameSession);

      this.gameSessionsGateway.emitPhaseChangedEvent(
        updatedGameSession.token,
        updatedGameSession.phase,
      );

      const updatedPlayers: Player[] = gameSession.players.map((player) => ({
        ...player,
        updated_at: new Date(),
        statistics: {
          ...player.statistics,
          phases_played: player.statistics.phases_played + 1,
        },
      }));

      const updatedPlayerEntities: Player[] = await manager.save(
        Player,
        updatedPlayers,
      );

      updatedPlayerEntities.forEach((player) =>
        this.gameSessionsGateway.emitPlayerUpdatedEvent(
          PlayerDto.fromEntity(player, {
            character: true,
          }),
        ),
      );

      return GameSessionDto.fromEntity(updatedGameSession, {
        players: true,
      });
    });
  }

  async previousPhase(token: string): Promise<GameSessionDto> {
    const gameSession = await this.getGameSession(token);

    return this.dataSource.transaction(async (manager) => {
      const phases = EnumHelper.getValues(GameSessionPhase) as number[];
      const maxPhaseValue = Math.max(...phases);
      const minPhaseValue = Math.min(...phases);
      const theoreticalPreviousPhaseValue = gameSession.phase - 1;

      gameSession.phase =
        theoreticalPreviousPhaseValue < minPhaseValue
          ? maxPhaseValue
          : theoreticalPreviousPhaseValue;
      gameSession.updated_at = new Date();

      const updatedGameSession = await manager.save(GameSession, gameSession);

      this.gameSessionsGateway.emitPhaseChangedEvent(
        updatedGameSession.token,
        updatedGameSession.phase,
      );

      return GameSessionDto.fromEntity(updatedGameSession, {
        players: true,
      });
    });
  }

  async getGameSession(
    token: string,
    relations: string[] = [
      'players',
      'players.user',
      'players.character',
      'players.character.translations',
      'players.playerCards',
      'players.playerCards.card',
      'players.playerCards.card.translations',
    ],
  ): Promise<GameSession> {
    const existingGameSession = await this.gameSessionRepository.findOne({
      where: { token },
      relations,
    });

    if (!existingGameSession) {
      throw new GameSessionNotFoundException();
    }

    return existingGameSession;
  }

  private async getUnusedToken(): Promise<string> {
    const tokenLength =
      this.configService.get<GameSessionsConfig>(
        'gameSessions',
      ).gameSessionTokenLength;

    const token = StringHelper.generateRandomString(tokenLength, {
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

  static createGameSessionDtoFromEntity(
    gameSession: GameSession,
  ): GameSessionDto {
    return GameSessionDto.fromEntity(
      gameSession,
      {
        players: true,
      },
      {
        players: (players: Player[]) =>
          players.map((player) =>
            PlayerService.createPlayerDtoFromEntity(player),
          ),
      },
    );
  }
}
