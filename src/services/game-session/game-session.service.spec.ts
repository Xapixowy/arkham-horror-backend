import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { GameSessionService } from './game-session.service';
import { GameSession } from '@Entities/game-session.entity';
import { GameSessionDto } from '@Dtos/game-session.dto';
import { User } from '@Entities/user.entity';
import { PlayerService } from '../player/player.service';
import { ConfigService } from '@nestjs/config';
import { GameSessionsGateway } from '@Gateways/game-sessions.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GameSessionNotFoundException } from '@Exceptions/game-session/game-session-not-found.exception';
import { Player } from '@Entities/player.entity';
import { PlayerDto } from '@Dtos/player.dto';

describe('GameSessionService', () => {
  let service: GameSessionService;
  let gameSessionRepository: Repository<GameSession>;
  let dataSource: DataSource;
  let playerService: PlayerService;
  let configService: ConfigService;
  let gameSessionsGateway: GameSessionsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameSessionService,
        { provide: getRepositoryToken(GameSession), useClass: Repository },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
        {
          provide: PlayerService,
          useValue: {
            add: jest.fn(),
            addPlayerToGameSession: jest.fn(),
          },
        },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        {
          provide: GameSessionsGateway,
          useValue: {
            emitPhaseChangedEvent: jest.fn(),
            emitPlayerUpdatedEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GameSessionService>(GameSessionService);
    gameSessionRepository = module.get<Repository<GameSession>>(
      getRepositoryToken(GameSession),
    );
    dataSource = module.get<DataSource>(DataSource);
    playerService = module.get<PlayerService>(PlayerService);
    configService = module.get<ConfigService>(ConfigService);
    gameSessionsGateway = module.get<GameSessionsGateway>(GameSessionsGateway);
  });

  describe('findAll', () => {
    it('should return a list of GameSessionDto', async () => {
      const gameSessions = [{ id: 1, players: [] }] as GameSession[];
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({ find: () => gameSessions }),
        );

      const result = await service.findAll();

      expect(result).toEqual(
        gameSessions.map((gameSession) =>
          GameSessionDto.fromEntity(gameSession, { players: true }),
        ),
      );
    });
  });

  describe('findOne', () => {
    it('should return a GameSessionDto for a given token', async () => {
      const token = 'testToken';
      const gameSession = { token, players: [] } as GameSession;
      jest
        .spyOn(service, 'getGameSession')
        .mockResolvedValue(gameSession as any);

      const result = await service.findOne(token);

      expect(result).toEqual(
        GameSessionDto.fromEntity(gameSession, { players: true }),
      );
    });

    it('should throw GameSessionNotFoundException if game session does not exist', async () => {
      jest
        .spyOn(service, 'getGameSession')
        .mockRejectedValue(new GameSessionNotFoundException());

      await expect(service.findOne('invalidToken')).rejects.toThrow(
        GameSessionNotFoundException,
      );
    });
  });

  describe('add', () => {
    let user: User;

    beforeEach(() => {
      user = new User();
    });

    it('should create and return a new GameSessionDto', async () => {
      const token = 'uniqueToken';
      const newGameSession = { token, players: [] };
      service['getUnusedToken'] = jest.fn().mockResolvedValue(token);
      playerService['addPlayerToGameSession'] = jest.fn().mockResolvedValue({});
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({
            create: jest.fn().mockResolvedValue(newGameSession),
            save: jest.fn().mockResolvedValue({ id: 1, ...newGameSession }),
          }),
        );

      const result = await service.add(user);

      expect(result.token).toBe(token);
      expect(result.players).toHaveLength(1);
    });

    it('should retry generating a unique token if there is a collision', async () => {
      service['getUnusedToken'] = jest
        .fn()
        .mockResolvedValueOnce('duplicateToken')
        .mockResolvedValueOnce('uniqueToken');
      jest
        .spyOn(gameSessionRepository, 'findOne')
        .mockResolvedValueOnce({ token: 'duplicateToken' } as GameSession)
        .mockResolvedValueOnce(null);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({
            create: jest.fn().mockResolvedValue({ token: 'uniqueToken' }),
            save: jest.fn().mockResolvedValue({ id: 1, token: 'uniqueToken' }),
          }),
        );

      const result = await service.add(user);

      expect(result.token).toBe('uniqueToken');
    });
  });

  describe('remove', () => {
    it('should delete a game session by token', async () => {
      const token = 'testToken';
      const gameSession = { token } as GameSession;
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({
            findOne: jest.fn().mockResolvedValue(gameSession),
            remove: jest.fn().mockResolvedValue(gameSession),
          }),
        );

      const result = await service.remove(token);

      expect(result).toEqual(GameSessionDto.fromEntity(gameSession));
    });

    it('should throw GameSessionNotFoundException if game session does not exist', async () => {
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({ findOne: jest.fn().mockResolvedValue(null) }),
        );

      await expect(service.remove('invalidToken')).rejects.toThrow(
        GameSessionNotFoundException,
      );
    });
  });

  describe('join', () => {
    let token: string;
    let user: User;
    let player: Player;
    let gameSession: GameSession;

    beforeEach(() => {
      token = 'testToken';
      user = { id: 1 } as User;
      player = { token: 'playerToken', user } as Player;
      gameSession = {
        token,
        players: [
          { token: 'playerToken', user: { id: 1 } },
          { token: 'anotherToken', user: { id: 2 } },
        ],
      } as GameSession;
    });

    it('should return an existing game session DTO and player DTO if the user is already in the session', async () => {
      jest.spyOn(service, 'getGameSession').mockResolvedValue(gameSession);

      const result = await service.join(token, null, user);

      expect(result).toEqual({
        game_session:
          GameSessionService.createGameSessionDtoFromEntity(gameSession),
        player: PlayerService.createPlayerDtoFromEntity(
          gameSession.players.find((p) => p.user?.id === user.id),
        ),
      });
    });

    it('should return an existing game session DTO and player DTO if the player is already in the session', async () => {
      jest.spyOn(service, 'getGameSession').mockResolvedValue(gameSession);

      const result = await service.join(token, player, null);

      expect(result).toEqual({
        game_session:
          GameSessionService.createGameSessionDtoFromEntity(gameSession),
        player: PlayerService.createPlayerDtoFromEntity(
          gameSession.players.find((p) => p.token === player.token),
        ),
      });
    });

    it('should add a new player and return updated game session DTO and new player DTO if neither user nor player is in the session', async () => {
      jest.spyOn(service, 'getGameSession').mockResolvedValueOnce(gameSession);
      jest
        .spyOn(playerService, 'add')
        .mockResolvedValue(player as unknown as PlayerDto);

      const updatedGameSession = {
        ...gameSession,
        players: [...gameSession.players, player],
      };

      jest
        .spyOn(service, 'getGameSession')
        .mockResolvedValueOnce(updatedGameSession);

      const result = await service.join(token, null, null);

      expect(result).toEqual({
        game_session:
          GameSessionService.createGameSessionDtoFromEntity(updatedGameSession),
        player,
      });

      expect(result.game_session.players.length).toBe(3);
      expect(result.game_session.players).toContainEqual(
        expect.objectContaining(player),
      );
    });

    it('should throw an error if the game session does not exist', async () => {
      jest
        .spyOn(service, 'getGameSession')
        .mockRejectedValue(new GameSessionNotFoundException());

      await expect(service.join(token, null, user)).rejects.toThrow(
        GameSessionNotFoundException,
      );
    });
  });

  describe('resetPhase', () => {
    it('should reset game session phase to default and emit an event', async () => {
      const token = 'testToken';
      const gameSession = { token, phase: 1 };
      jest.spyOn(configService, 'get').mockReturnValue({ defaultPhase: 0 });
      jest
        .spyOn(service, 'getGameSession')
        .mockResolvedValue(gameSession as any);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({ save: jest.fn().mockResolvedValue(gameSession) }),
        );

      const result = await service.resetPhase(token);

      expect(result.phase).toBe(0);
      expect(gameSessionsGateway.emitPhaseChangedEvent).toHaveBeenCalledWith(0);
    });

    it('should throw GameSessionNotFoundException if game session does not exist', async () => {
      jest
        .spyOn(service, 'getGameSession')
        .mockRejectedValue(new GameSessionNotFoundException());

      await expect(service.resetPhase('invalidToken')).rejects.toThrow(
        GameSessionNotFoundException,
      );
    });
  });

  describe('nextPhase', () => {
    it('should increment game session phase and emit events', async () => {
      const token = 'testToken';
      const gameSession = {
        token,
        phase: 1,
        players: [
          {
            id: 1,
            statistics: {
              phases_played: 0,
            },
          },
          {
            id: 2,
            statistics: {
              phases_played: 0,
            },
          },
        ],
      };
      jest
        .spyOn(service, 'getGameSession')
        .mockResolvedValue(gameSession as any);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({
            save: jest
              .fn()
              .mockResolvedValueOnce(gameSession)
              .mockResolvedValueOnce(
                gameSession.players.map((player) => ({
                  ...player,
                  statistics: {
                    phases_played: 1,
                  },
                })),
              ),
          }),
        );

      const result = await service.nextPhase(token);

      expect(result.phase).toBe(2);
      expect(gameSessionsGateway.emitPhaseChangedEvent).toHaveBeenCalledWith(2);
    });

    it('should throw GameSessionNotFoundException if game session does not exist', async () => {
      jest
        .spyOn(service, 'getGameSession')
        .mockRejectedValue(new GameSessionNotFoundException());

      await expect(service.nextPhase('invalidToken')).rejects.toThrow(
        GameSessionNotFoundException,
      );
    });
  });

  describe('previousPhase', () => {
    it('should decrement game session phase and emit event', async () => {
      const token = 'testToken';
      const gameSession = { token, phase: 2 };
      jest
        .spyOn(service, 'getGameSession')
        .mockResolvedValue(gameSession as any);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({ save: jest.fn().mockResolvedValue(gameSession) }),
        );

      const result = await service.previousPhase(token);

      expect(result.phase).toBe(1);
      expect(gameSessionsGateway.emitPhaseChangedEvent).toHaveBeenCalledWith(1);
    });

    it('should throw GameSessionNotFoundException if game session does not exist', async () => {
      jest
        .spyOn(service, 'getGameSession')
        .mockRejectedValue(new GameSessionNotFoundException());

      await expect(service.previousPhase('invalidToken')).rejects.toThrow(
        GameSessionNotFoundException,
      );
    });
  });

  describe('getGameSession', () => {
    it('should return a GameSession if it exists', async () => {
      const token = 'existingToken';
      const gameSession = { token, players: [] };

      jest
        .spyOn(gameSessionRepository, 'findOne')
        .mockResolvedValue(gameSession as any);

      const result = await service.getGameSession(token);

      expect(result).toEqual(gameSession);
    });

    it('should throw GameSessionNotFoundException if the game session does not exist', async () => {
      const token = 'nonExistingToken';

      jest.spyOn(gameSessionRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getGameSession(token)).rejects.toThrow(
        GameSessionNotFoundException,
      );
    });
  });
});
