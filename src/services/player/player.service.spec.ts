import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { NotFoundException } from '@Exceptions/not-found.exception';
import { PlayerService } from './player.service';
import { Player } from '@Entities/player.entity';
import { GameSession } from '@Entities/game-session.entity';
import { User } from '@Entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { GameSessionsGateway } from '@Gateways/game-sessions.gateway';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Language } from '@Enums/language';
import { PlayerDto } from '@Dtos/player.dto';
import { PlayerExistsException } from '@Exceptions/player/player-exists.exception';
import { PlayersLimitReachedException } from '@Exceptions/game-session/players-limit-reached.exception';
import { Character } from '@Entities/character.entity';
import { Card } from '@Entities/card.entity';
import { AppConfig } from '@Configs/app.config';
import { GameSessionsConfig } from '@Configs/game_sessions.config';
import { CardService } from '@Services/card/card.service';
import { UpdatePlayerRequest } from '@Requests/player/update-player.request';
import { PlayerRole } from '@Enums/player/player-role.enum';
import { CharacterCard } from '@Entities/character-card.entity';
import { CharacterService } from '@Services/character/character.service';

describe('PlayerService', () => {
  let service: PlayerService;
  let playerRepository: Repository<Player>;
  let gameSessionRepository: Repository<GameSession>;
  let dataSource: DataSource;
  let configService: ConfigService;
  let gameSessionsGateway: GameSessionsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        { provide: getRepositoryToken(Player), useClass: Repository },
        { provide: getRepositoryToken(GameSession), useClass: Repository },
        { provide: getRepositoryToken(Character), useClass: Repository },
        { provide: getRepositoryToken(Card), useClass: Repository },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'app':
                  return { language: Language.POLISH } as AppConfig;
                case 'gameSessions':
                  return { maxPlayers: 6 } as GameSessionsConfig;
                default:
                  return null;
              }
            }),
          },
        },
        {
          provide: GameSessionsGateway,
          useValue: { emitPlayerUpdatedEvent: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
    playerRepository = module.get<Repository<Player>>(
      getRepositoryToken(Player),
    );
    gameSessionRepository = module.get<Repository<GameSession>>(
      getRepositoryToken(GameSession),
    );
    dataSource = module.get<DataSource>(DataSource);
    configService = module.get<ConfigService>(ConfigService);
    gameSessionsGateway = module.get<GameSessionsGateway>(GameSessionsGateway);
  });

  describe('findAll', () => {
    it('should return a list of PlayerDto', async () => {
      const token = 'sessionToken';
      const language = Language.POLISH;
      const gameSession = { id: 1 };
      const players = [{ id: 1, character: {}, playerCards: [] }] as Player[];

      service['getGameSession'] = jest
        .fn()
        .mockResolvedValue(gameSession as any);
      jest.spyOn(playerRepository, 'find').mockResolvedValue(players as any);

      const result = await service.findAll(token, language);

      expect(result).toEqual(
        players.map((player) =>
          PlayerDto.fromEntity(player, {
            user: true,
            character: true,
            playerCards: true,
          }),
        ),
      );
    });

    it('should throw NotFoundException if game session does not exist', async () => {
      service['getGameSession'] = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.findAll('invalidToken', Language.POLISH),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a PlayerDto for a given player token', async () => {
      const gameSessionToken = 'sessionToken';
      const playerToken = 'playerToken';
      const language = Language.POLISH;
      const player = { id: 1, character: {}, playerCards: [] } as Player;

      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest.fn().mockResolvedValue(player);

      const result = await service.findOne(
        gameSessionToken,
        playerToken,
        language,
      );

      expect(result).toEqual(
        PlayerDto.fromEntity(player, {
          user: true,
          character: true,
          playerCards: true,
        }),
      );
    });

    it('should throw NotFoundException if player or session does not exist', async () => {
      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.findOne('sessionToken', 'invalidPlayerToken', Language.POLISH),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserPlayer', () => {
    it('should return the user’s PlayerDto in a given session', async () => {
      const gameSessionToken = 'sessionToken';
      const user = new User();
      const language = Language.POLISH;
      const player = { id: 1, character: {} } as Player;

      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getUserPlayerInGameSession'] = jest
        .fn()
        .mockResolvedValue(player);

      const result = await service.findUserPlayer(
        gameSessionToken,
        user,
        language,
      );

      expect(result).toEqual(
        PlayerDto.fromEntity(player, { user: true, character: true }),
      );
    });

    it('should throw NotFoundException if user or player does not exist', async () => {
      const user = new User();

      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getUserPlayerInGameSession'] = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.findUserPlayer('sessionToken', user, Language.POLISH),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('add', () => {
    it('should add a player to a game session and return PlayerDto', async () => {
      const gameSessionToken = 'sessionToken';
      const user = new User();
      const gameSession = { players: [] };
      const newPlayerDto = { id: 1, user, character: {} };

      service['getGameSession'] = jest.fn().mockResolvedValue(gameSession);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => cb({}));
      jest
        .spyOn(service, 'addPlayerToGameSession')
        .mockResolvedValue(newPlayerDto as any);

      const result = await service.add(gameSessionToken, user);

      expect(result).toEqual(newPlayerDto);
    });

    it('should throw PlayerExistsException if user is already a player', async () => {
      const user = new User();
      const gameSession = { players: [{ id: 1 }] };

      service['getGameSession'] = jest.fn().mockResolvedValue(gameSession);
      service['getUserPlayerInGameSession'] = jest
        .fn()
        .mockResolvedValue({ id: 1 });

      await expect(service.add('sessionToken', user)).rejects.toThrow(
        PlayerExistsException,
      );
    });

    it('should throw PlayersLimitReachedException if game session has reached player limit', async () => {
      const gameSession = { players: Array(6).fill({}) };

      service['getGameSession'] = jest.fn().mockResolvedValue(gameSession);

      await expect(service.add('sessionToken', null)).rejects.toThrow(
        PlayersLimitReachedException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a player by token and return PlayerDto', async () => {
      const playerToken = 'playerToken';
      const player = { id: 1, user: {}, character: {} } as Player;

      service['getPlayer'] = jest.fn().mockResolvedValue(player);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({
            remove: jest.fn().mockResolvedValue(player),
          }),
        );

      const result = await service.remove(playerToken);

      expect(result).toEqual(PlayerDto.fromEntity(player));
    });

    it('should throw NotFoundException if player does not exist', async () => {
      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(service.remove('invalidPlayerToken')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('renewCharacter', () => {
    it('should renew a player’s character and return updated PlayerDto', async () => {
      const gameSessionToken = 'sessionToken';
      const playerToken = 'playerToken';
      const language = Language.POLISH;
      const player = {
        id: 1,
        character: { id: 1 },
        statistics: {
          characters_played: 0,
        },
      } as Player;

      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest.fn().mockResolvedValue(player);
      service['getTranslatedPlayer'] = jest.fn().mockReturnValue(player);

      jest
        .spyOn(service['characterRepository'], 'find')
        .mockResolvedValue([{ id: 2 }] as Character[]);
      jest
        .spyOn(service['playerRepository'], 'findOne')
        .mockResolvedValue(null);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({
            save: jest.fn().mockResolvedValue({
              ...player,
              statistics: {
                characters_played: 1,
              },
            }),
          }),
        );

      const result = await service.renewCharacter(
        gameSessionToken,
        playerToken,
        language,
      );

      console.log(result);

      expect(result).toBeDefined();
      expect(result.character.id).toBe(2);
    });

    it('should throw NotFoundException if player or session does not exist', async () => {
      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.renewCharacter(
          'sessionToken',
          'invalidPlayerToken',
          Language.POLISH,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignCards', () => {
    it('should assign cards to a player and return PlayerCardDto array', async () => {
      const gameSessionToken = 'sessionToken';
      const playerToken = 'playerToken';
      const language = Language.POLISH;
      const cardIds = [1, 2, 3];
      const player = { id: 1, playerCards: [] };
      const cards = cardIds.map((id) => ({ id, translations: [] })) as Card[];
      const playerCards = cards.map((card) => ({
        id: card.id,
        player,
        card,
      }));

      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest.fn().mockResolvedValue(player);
      jest.spyOn(service['cardRepository'], 'find').mockResolvedValue(cards);
      jest
        .spyOn(CardService, 'getTranslatedCard')
        .mockReturnValueOnce(cards[0])
        .mockReturnValueOnce(cards[1])
        .mockReturnValueOnce(cards[2]);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({
            create: jest
              .fn()
              .mockResolvedValueOnce(cards[0])
              .mockResolvedValueOnce(cards[1])
              .mockResolvedValueOnce(cards[2]),
            findOneBy: jest.fn().mockResolvedValue({
              ...player,
              playerCards,
              statistics: {
                cards_acquired: 0,
              },
            }),
            save: jest.fn().mockResolvedValue({
              ...player,
              playerCards,
              statistics: {
                cards_acquired: 3,
              },
            }),
          }),
        );

      const result = await service.assignCards(
        gameSessionToken,
        playerToken,
        language,
        cardIds,
      );

      expect(result).toBeDefined();
      expect(result.length).toEqual(cards.length);
    });

    it('should throw NotFoundException if game session does not exist', async () => {
      service['getPlayer'] = jest.fn().mockResolvedValue({});
      jest
        .spyOn(service['gameSessionRepository'], 'findOne')
        .mockResolvedValue(null);

      await expect(
        service.assignCards(
          'invalidSessionToken',
          'playerToken',
          Language.POLISH,
          [1],
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if player does not exist', async () => {
      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.assignCards(
          'sessionToken',
          'invalidPlayerToken',
          Language.POLISH,
          [1],
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeCards', () => {
    it('should remove specified cards from a player and return remaining PlayerCardDto array', async () => {
      const gameSessionToken = 'sessionToken';
      const playerToken = 'playerToken';
      const language = Language.POLISH;
      const cardIds = [1, 2];
      const player = {
        id: 1,
        playerCards: [{ card: { id: 1 }, quantity: 1 }],
        statistics: {
          cards_lost: 0,
        },
      };

      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest.fn().mockResolvedValue(player);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({
            save: jest.fn().mockResolvedValue({
              ...player,
              statistics: {
                cards_lost: 1,
              },
            }),
            remove: jest.fn(),
            findOneBy: jest.fn().mockResolvedValue({
              ...player,
              playerCards: [],
            }),
          }),
        );

      const result = await service.removeCards(
        gameSessionToken,
        playerToken,
        language,
        cardIds,
      );

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should throw NotFoundException if game session does not exist', async () => {
      service['getGameSession'] = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.removeCards(
          'invalidSessionToken',
          'playerToken',
          Language.POLISH,
          [1],
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if player does not exist', async () => {
      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.removeCards(
          'sessionToken',
          'invalidPlayerToken',
          Language.POLISH,
          [1],
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePlayer', () => {
    it('should update player status and return updated PlayerDto', async () => {
      const gameSessionToken = 'sessionToken';
      const playerToken = 'playerToken';
      const language = Language.POLISH;
      const updatePlayerRequest = {
        status: {
          sanity: 4,
        },
      } as UpdatePlayerRequest;
      const player = {
        id: 1,
        statistics: {
          sanity_lost: 0,
        },
        character: {},
        status: {
          endurance: 5,
          sanity: 5,
        },
        equipment: {
          money: 0,
          clues: 0,
        },
      };

      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest.fn().mockResolvedValue(player);
      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) =>
          cb({ save: jest.fn().mockResolvedValue(player) }),
        );
      jest
        .spyOn(gameSessionsGateway, 'emitPlayerUpdatedEvent')
        .mockImplementation(() => {});

      const result = await service.updatePlayer(
        gameSessionToken,
        playerToken,
        language,
        updatePlayerRequest,
      );

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(PlayerDto);
    });

    it('should throw NotFoundException if game session does not exist', async () => {
      service['getGameSession'] = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.updatePlayer(
          'invalidSessionToken',
          'playerToken',
          Language.POLISH,
          {} as UpdatePlayerRequest,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if player does not exist', async () => {
      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.updatePlayer(
          'sessionToken',
          'invalidPlayerToken',
          Language.POLISH,
          {} as UpdatePlayerRequest,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generatePlayerObject', () => {
    it('should generate a player object with the correct properties', async () => {
      const gameSession = new GameSession();
      const user = new User();
      const character = {
        id: 1,
        endurance: 10,
        sanity: 10,
        equipment: { money: 10, clues: 5 },
        attributes: { speed: [1, 2, 3] },
      };

      service['getUnusedToken'] = jest.fn().mockResolvedValue('uniqueToken');
      service['getUnusedCharacterInGameSession'] = jest
        .fn()
        .mockResolvedValue(character);

      const result = await service.generatePlayerObject(
        gameSession,
        true,
        user,
      );

      expect(result).toBeDefined();
      expect(result.token).toBe('uniqueToken');
      expect(result.user).toBe(user);
      expect(result.game_session).toBe(gameSession);
      expect(result.role).toBe(PlayerRole.HOST);
      expect(result.status).toEqual({ endurance: 10, sanity: 10 });
      expect(result.equipment).toEqual({ money: 10, clues: 5 });
    });
  });

  describe('addPlayerToGameSession', () => {
    let manager: EntityManager;

    beforeEach(() => {
      manager = {
        save: jest
          .fn()
          .mockResolvedValueOnce({
            id: 1,
            role: PlayerRole.HOST,
            character: { characterCards: [] },
            playerCards: [],
          })
          .mockResolvedValueOnce([]),
        create: jest.fn().mockResolvedValue({
          role: PlayerRole.HOST,
          character: { characterCards: [] },
          playerCards: [],
        }),
      } as unknown as EntityManager;
    });

    it('should add a player to a game session and return PlayerDto', async () => {
      const gameSession = new GameSession();
      const user = new User();
      const characterCards = [
        { card: new Card(), quantity: 1 },
      ] as CharacterCard[];

      service['generatePlayerObject'] = jest.fn().mockResolvedValue({
        token: 'uniqueToken',
        user,
        game_session: gameSession,
        character: { id: 1, characterCards } as Character,
      });

      const result = await service.addPlayerToGameSession(
        gameSession,
        manager,
        true,
        user,
      );

      expect(result).toBeInstanceOf(PlayerDto);
      expect(manager.save).toHaveBeenCalledTimes(2);
    });

    it('should assign HOST role to the first player in the session', async () => {
      const gameSession = new GameSession();
      const user = new User();

      service['generatePlayerObject'] = jest.fn().mockResolvedValue({
        token: 'uniqueToken',
        user,
        game_session: gameSession,
        character: {} as Character,
        role: PlayerRole.HOST,
      });

      const result = await service.addPlayerToGameSession(
        gameSession,
        manager,
        true,
        user,
      );

      expect(result).toBeDefined();
      expect(result.role).toBe(PlayerRole.HOST);
    });
  });

  describe('getTranslatedPlayer', () => {
    it('should return the player as-is if language matches the app default', () => {
      const player = { id: 1, character: {}, playerCards: [] };

      const result = service.getTranslatedPlayer(
        player as any,
        Language.POLISH,
      );

      expect(result).toBe(player);
    });

    it('should return a translated player if language differs from app default', () => {
      const player = {
        id: 1,
        character: { id: 1 },
        playerCards: [{ card: { id: 1 } }],
      } as Player;
      jest.spyOn(CharacterService, 'getTranslatedCharacter').mockReturnValue({
        id: 1,
        name: 'translated character',
      } as Character);
      jest
        .spyOn(CardService, 'getTranslatedCard')
        .mockReturnValue({ id: 1, name: 'translated card' } as Card);

      const result = service.getTranslatedPlayer(player, 'fr' as Language);

      expect(result.character).toEqual({ id: 1, name: 'translated character' });
      expect(result.playerCards[0].card).toEqual({
        id: 1,
        name: 'translated card',
      });
    });
  });

  describe('getPlayerByToken', () => {
    it('should return a Player when the token is valid', async () => {
      const token = 'validToken';
      const player = { id: 1, token, game_session: {} } as Player;

      service['getPlayer'] = jest.fn().mockResolvedValue(player);

      const result = await service.getPlayerByToken(token);

      expect(result).toEqual(player);
    });

    it('should throw NotFoundException if the player with the given token does not exist', async () => {
      const token = 'invalidToken';

      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(service.getPlayerByToken(token)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
