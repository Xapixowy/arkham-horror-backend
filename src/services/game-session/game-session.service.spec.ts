import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { GameSessionService } from './game-session.service';
import { GameSession } from '@Entities/game-session.entity';
import { GameSessionDto } from '@Dtos/game-session.dto';
import { User } from '@Entities/user.entity';
import { PlayerService } from '../player/player.service';
import { ConfigService } from '@nestjs/config';
import { GameSessionsGateway } from '@Gateways/game-sessions.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';

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
          useValue: { addPlayerToGameSession: jest.fn() },
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

    it('should throw NotFoundException if game session does not exist', async () => {
      jest
        .spyOn(service, 'getGameSession')
        .mockRejectedValue(new NotFoundException());

      await expect(service.findOne('invalidToken')).rejects.toThrow(
        NotFoundException,
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

    it('should throw NotFoundException if game session does not exist', async () => {
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({ findOne: jest.fn().mockResolvedValue(null) }),
        );

      await expect(service.remove('invalidToken')).rejects.toThrow(
        NotFoundException,
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

    it('should throw NotFoundException if game session does not exist', async () => {
      jest
        .spyOn(service, 'getGameSession')
        .mockRejectedValue(new NotFoundException());

      await expect(service.resetPhase('invalidToken')).rejects.toThrow(
        NotFoundException,
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

    it('should throw NotFoundException if game session does not exist', async () => {
      jest
        .spyOn(service, 'getGameSession')
        .mockRejectedValue(new NotFoundException());

      await expect(service.nextPhase('invalidToken')).rejects.toThrow(
        NotFoundException,
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

      expect(result.phase).toBe(1); // assuming 1 is the previous phase
      expect(gameSessionsGateway.emitPhaseChangedEvent).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if game session does not exist', async () => {
      jest
        .spyOn(service, 'getGameSession')
        .mockRejectedValue(new NotFoundException());

      await expect(service.previousPhase('invalidToken')).rejects.toThrow(
        NotFoundException,
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
      expect(gameSessionRepository.findOne).toHaveBeenCalledWith({
        where: { token },
        relations: ['players'],
      });
    });

    it('should throw NotFoundException if the game session does not exist', async () => {
      const token = 'nonExistingToken';

      jest.spyOn(gameSessionRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getGameSession(token)).rejects.toThrow(
        NotFoundException,
      );
      expect(gameSessionRepository.findOne).toHaveBeenCalledWith({
        where: { token },
        relations: ['players'],
      });
    });
  });
});
