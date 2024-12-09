import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '@Entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtUser } from '@Types/user/jwt-user.type';
import { JwtConfig } from '@Configs/jwt.config';
import { UserDto } from '@Dtos/user.dto';
import { StatisticsService } from '@Services/statistics/statistics.service';
import { Statistics } from '@Types/user/statistics.type';
import { UserNotFoundException } from '@Exceptions/user/user-not-found.exception';
import { GameSessionService } from '@Services/game-session/game-session.service';
import { GameSessionDto } from '@Dtos/game-session.dto';

describe('UserService', () => {
  let userService: UserService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'jwt') {
                return { secret: 'test-secret' } as JwtConfig;
              }
              return null;
            }),
          },
        },
        {
          provide: StatisticsService,
          useValue: {
            generateUserStatistics: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findOne', () => {
    it('should return UserDto if user is found by id', async () => {
      const user = { id: 1, email: 'test@example.com' } as User;
      userService['getUser'] = jest.fn().mockResolvedValue(user);

      const result = await userService.findOne(1);

      expect(result).toEqual(UserDto.fromEntity(user));
    });

    it('should throw UserNotFoundException if user is not found by id', async () => {
      userService['getUser'] = jest
        .fn()
        .mockRejectedValue(new UserNotFoundException());

      await expect(userService.findOne(1)).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });

  describe('getUserGameSessions', () => {
    it('should return a list of GameSessionDto if user has players and game sessions', async () => {
      const gameSession = {
        id: 1,
        players: [
          {
            id: 1,
            user: { id: 1, email: 'test@example.com' },
            character: { id: 1, translations: [] },
            playerCards: [
              {
                card: { id: 1, translations: [] },
              },
            ],
          },
        ],
      };
      const user = {
        id: 1,
        players: [
          {
            game_session: gameSession,
          },
        ],
      };

      userService['getUser'] = jest.fn().mockResolvedValue(user);
      jest
        .spyOn(GameSessionService, 'createGameSessionDtoFromEntity')
        .mockImplementation((session) => session as GameSessionDto);

      const result = await userService.getUserGameSessions(1);

      expect(result).toEqual([gameSession]);
      expect(userService['getUser']).toHaveBeenCalledWith(1, [
        'players',
        'players.game_session',
        'players.game_session.players',
        'players.game_session.players.user',
        'players.game_session.players.character',
        'players.game_session.players.character.translations',
        'players.game_session.players.playerCards',
        'players.game_session.players.playerCards.card',
        'players.game_session.players.playerCards.card.translations',
      ]);
      expect(
        GameSessionService.createGameSessionDtoFromEntity,
      ).toHaveBeenCalledWith(gameSession);
    });

    it('should return an empty array if user has no players', async () => {
      const user = { id: 1, players: [] };
      userService['getUser'] = jest.fn().mockResolvedValue(user);

      const result = await userService.getUserGameSessions(1);

      expect(result).toEqual([]);
      expect(userService['getUser']).toHaveBeenCalledWith(1, [
        'players',
        'players.game_session',
        'players.game_session.players',
        'players.game_session.players.user',
        'players.game_session.players.character',
        'players.game_session.players.character.translations',
        'players.game_session.players.playerCards',
        'players.game_session.players.playerCards.card',
        'players.game_session.players.playerCards.card.translations',
      ]);
    });

    it('should throw UserNotFoundException if user is not found', async () => {
      userService['getUser'] = jest
        .fn()
        .mockRejectedValue(new UserNotFoundException());

      await expect(userService.getUserGameSessions(1)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(userService['getUser']).toHaveBeenCalledWith(1, [
        'players',
        'players.game_session',
        'players.game_session.players',
        'players.game_session.players.user',
        'players.game_session.players.character',
        'players.game_session.players.character.translations',
        'players.game_session.players.playerCards',
        'players.game_session.players.playerCards.card',
        'players.game_session.players.playerCards.card.translations',
      ]);
    });
  });

  describe('getUserStatistics', () => {
    it('should return user statistics if user has players', async () => {
      const user = { id: 1, players: [{}] } as User;
      userService['getUser'] = jest.fn().mockResolvedValue(user);
      const statistics = { totalGames: 10 } as unknown as Statistics;
      jest
        .spyOn(StatisticsService, 'generateUserStatistics')
        .mockReturnValue(statistics);

      const result = await userService.getUserStatistics(1);

      expect(result).toEqual(statistics);
      expect(StatisticsService.generateUserStatistics).toHaveBeenCalledWith(
        user.players,
      );
    });

    it('should return null if user has no players', async () => {
      const user = { id: 1, players: null } as User;
      userService['getUser'] = jest.fn().mockResolvedValue(user);

      const result = await userService.getUserStatistics(1);

      expect(result).toBeNull();
    });
  });

  describe('getUserByJwtToken', () => {
    it('should return user if JWT is valid and user is found', async () => {
      const token = 'valid-token';
      const jwtPayload = { sub: 1 } as JwtUser;
      const user = { id: 1, email: 'test@example.com' } as User;

      userService['extractUserJwt'] = jest.fn().mockResolvedValue(jwtPayload);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await userService.getUserByJwtToken(token);

      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: jwtPayload.sub },
        relations: [],
      });
    });

    it('should return null if JWT is invalid', async () => {
      const token = 'invalid-token';
      userService['extractUserJwt'] = jest.fn().mockResolvedValue(null);

      const result = await userService.getUserByJwtToken(token);

      expect(result).toBeNull();
    });
  });

  describe('isUserExist', () => {
    it('should return true if user exists by id', async () => {
      const user = { id: 1 } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await userService.isUserExist({ id: 1 });

      expect(result).toBe(true);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });

    it('should return true if user exists by email', async () => {
      const user = { email: 'test@example.com' } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await userService.isUserExist({
        email: 'test@example.com',
      });

      expect(result).toBe(true);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      });
    });

    it('should return true if user exists by token', async () => {
      const token = 'valid-token';
      const jwtPayload = { sub: 1 } as JwtUser;
      const user = { id: 1 } as User;

      userService['extractUserJwt'] = jest.fn().mockResolvedValue(jwtPayload);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await userService.isUserExist({ token });

      expect(result).toBe(true);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: jwtPayload.sub },
      });
    });

    it('should return false if user does not exist by id, email, or token', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const resultById = await userService.isUserExist({ id: 999 });
      const resultByEmail = await userService.isUserExist({
        email: 'nonexistent@example.com',
      });
      const resultByToken = await userService.isUserExist({
        token: 'invalid-token',
      });

      expect(resultById).toBe(false);
      expect(resultByEmail).toBe(false);
      expect(resultByToken).toBe(false);
    });
  });
});
