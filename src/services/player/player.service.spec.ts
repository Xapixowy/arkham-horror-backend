import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, Repository } from 'typeorm';
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
import { GameSessionNotFoundException } from '@Exceptions/game-session/game-session-not-found.exception';
import { PlayerNotFoundException } from '@Exceptions/player/player-not-found.exception';
import { UserNotFoundException } from '@Exceptions/user/user-not-found.exception';
import { QuantityCard } from '@Types/card/quantity-card.type';
import { PlayerCard } from '@Entities/player-card.entity';
import { ArrayHelper } from '@Helpers/array/array.helper';
import { CardType } from '@Enums/card/card.type';

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

    it('should throw GameSessionNotFoundException if game session does not exist', async () => {
      service['getGameSession'] = jest
        .fn()
        .mockRejectedValue(new GameSessionNotFoundException());

      await expect(
        service.findAll('invalidToken', Language.POLISH),
      ).rejects.toThrow(GameSessionNotFoundException);
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

    it('should throw PlayerNotFoundException if player does not exist', async () => {
      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new PlayerNotFoundException());

      await expect(
        service.findOne('sessionToken', 'invalidPlayerToken', Language.POLISH),
      ).rejects.toThrow(PlayerNotFoundException);
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

    it('should throw UserNotFoundException if user does not exist', async () => {
      const user = new User();

      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getUserPlayerInGameSession'] = jest
        .fn()
        .mockRejectedValue(new UserNotFoundException());

      await expect(
        service.findUserPlayer('sessionToken', user, Language.POLISH),
      ).rejects.toThrow(UserNotFoundException);
    });

    it('should throw PlayerNotFoundException if player does not exist', async () => {
      const user = new User();

      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getUserPlayerInGameSession'] = jest
        .fn()
        .mockRejectedValue(new PlayerNotFoundException());

      await expect(
        service.findUserPlayer('sessionToken', user, Language.POLISH),
      ).rejects.toThrow(PlayerNotFoundException);
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

    it('should throw PlayerNotFoundException if player does not exist', async () => {
      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new PlayerNotFoundException());

      await expect(service.remove('invalidPlayerToken')).rejects.toThrow(
        PlayerNotFoundException,
      );
    });
  });

  describe('renewCharacter', () => {
    it('should renew a player’s character and return updated PlayerDto', async () => {
      const gameSessionToken = 'sessionToken';
      const playerToken = 'playerToken';
      const language = Language.POLISH;

      const existingGameSession = { id: 1 } as GameSession;
      const existingPlayer = {
        id: 1,
        character: { id: 1 },
        statistics: { characters_played: 0 },
        playerCards: [],
      } as Player;

      const newCharacter = {
        id: 2,
        sanity: 5,
        endurance: 4,
        equipment: { money: 10, clues: 2 },
        attributes: {
          speed: [2],
          sneak: [3],
          prowess: [4],
          will: [5],
          knowledge: [6],
          luck: [7],
        },
      } as unknown as Character;

      const updatedPlayer = {
        ...existingPlayer,
        character: newCharacter,
        status: { sanity: 5, endurance: 4 },
        equipment: { money: 10, clues: 2 },
        attributes: {
          speed: 2,
          sneak: 3,
          prowess: 4,
          will: 5,
          knowledge: 6,
          luck: 7,
        },
        statistics: { characters_played: 1 },
      } as Player;

      const playerWithUpdatedCards = {
        ...updatedPlayer,
        playerCards: [{ id: 1, card: { id: 101 }, quantity: 1 } as PlayerCard],
      } as Player;

      service['getGameSession'] = jest
        .fn()
        .mockResolvedValue(existingGameSession);
      service['getPlayer'] = jest.fn().mockResolvedValue(existingPlayer);
      service['getUnusedCharacterInGameSession'] = jest
        .fn()
        .mockResolvedValue(newCharacter);
      jest
        .spyOn(service, 'assignCharacterRandomCardsToPlayer')
        .mockResolvedValue(playerWithUpdatedCards.playerCards);
      service['getTranslatedPlayer'] = jest
        .fn()
        .mockReturnValue(playerWithUpdatedCards);

      jest
        .spyOn(dataSource, 'transaction')
        .mockImplementation(async (cb: any) => {
          return cb({
            save: jest.fn().mockResolvedValue(updatedPlayer),
            merge: jest.fn().mockReturnValue(playerWithUpdatedCards),
          });
        });

      const result = await service.renewCharacter(
        gameSessionToken,
        playerToken,
        language,
      );

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(PlayerDto);
      expect(result.character.id).toBe(newCharacter.id);
      expect(result.statistics.characters_played).toBe(1);
      expect(service['getGameSession']).toHaveBeenCalledWith(gameSessionToken);
      expect(service['getPlayer']).toHaveBeenCalledWith(playerToken);
    });

    it('should throw PlayerNotFoundException if player does not exist', async () => {
      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new PlayerNotFoundException());

      await expect(
        service.renewCharacter(
          'sessionToken',
          'invalidPlayerToken',
          Language.POLISH,
        ),
      ).rejects.toThrow(PlayerNotFoundException);
    });

    it('should throw GameSessionNotFoundException if game session does not exist', async () => {
      service['getGameSession'] = jest
        .fn()
        .mockRejectedValue(new GameSessionNotFoundException());

      await expect(
        service.renewCharacter('invalidToken', 'playerToken', Language.POLISH),
      ).rejects.toThrow(GameSessionNotFoundException);
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

    it('should throw GameSessionNotFoundException if game session does not exist', async () => {
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
      ).rejects.toThrow(GameSessionNotFoundException);
    });

    it('should throw PlayerNotFoundException if player does not exist', async () => {
      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new PlayerNotFoundException());

      await expect(
        service.assignCards(
          'sessionToken',
          'invalidPlayerToken',
          Language.POLISH,
          [1],
        ),
      ).rejects.toThrow(PlayerNotFoundException);
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

    it('should throw GameSessionNotFoundException if game session does not exist', async () => {
      service['getGameSession'] = jest
        .fn()
        .mockRejectedValue(new GameSessionNotFoundException());

      await expect(
        service.removeCards(
          'invalidSessionToken',
          'playerToken',
          Language.POLISH,
          [1],
        ),
      ).rejects.toThrow(GameSessionNotFoundException);
    });

    it('should throw PlayerNotFoundException if player does not exist', async () => {
      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new PlayerNotFoundException());

      await expect(
        service.removeCards(
          'sessionToken',
          'invalidPlayerToken',
          Language.POLISH,
          [1],
        ),
      ).rejects.toThrow(PlayerNotFoundException);
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

    it('should throw GameSessionNotFoundException if game session does not exist', async () => {
      service['getGameSession'] = jest
        .fn()
        .mockRejectedValue(new GameSessionNotFoundException());

      await expect(
        service.updatePlayer(
          'invalidSessionToken',
          'playerToken',
          Language.POLISH,
          {} as UpdatePlayerRequest,
        ),
      ).rejects.toThrow(GameSessionNotFoundException);
    });

    it('should throw PlayerNotFoundException if player does not exist', async () => {
      service['getGameSession'] = jest.fn().mockResolvedValue({});
      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new PlayerNotFoundException());

      await expect(
        service.updatePlayer(
          'sessionToken',
          'invalidPlayerToken',
          Language.POLISH,
          {} as UpdatePlayerRequest,
        ),
      ).rejects.toThrow(PlayerNotFoundException);
    });
  });

  describe('assignQuantityCardsToPlayer', () => {
    let manager: EntityManager;
    let player: Player;
    let quantityCards: QuantityCard[];

    beforeEach(() => {
      player = {
        id: 1,
        playerCards: [
          { id: 1, card: { id: 1 }, quantity: 1 } as PlayerCard,
          { id: 2, card: { id: 2 }, quantity: 2 } as PlayerCard,
        ],
      } as Player;

      quantityCards = [
        { card: { id: 1 }, quantity: 2 },
        { card: { id: 3 }, quantity: 1 },
      ] as QuantityCard[];

      manager = {
        create: jest.fn().mockImplementation((_, entity) => entity),
        save: jest.fn().mockResolvedValue(null),
      } as unknown as EntityManager;
    });

    it('should update quantities for existing cards and add new cards', async () => {
      const result = await service.assignQuantityCardsToPlayer(
        player,
        quantityCards,
        manager,
      );

      expect(result).toBeDefined();
      expect(result.length).toEqual(3);

      const updatedCard1 = result.find((card) => card.card.id === 1);
      const newCard3 = result.find((card) => card.card.id === 3);

      expect(updatedCard1).toBeDefined();
      expect(updatedCard1.quantity).toEqual(3);

      expect(newCard3).toBeDefined();
      expect(newCard3.quantity).toEqual(1);

      expect(manager.create).toHaveBeenCalledTimes(1); // New card created
      expect(manager.save).toHaveBeenCalledWith(PlayerCard, expect.any(Array));
    });

    it('should retain other cards not updated or added', async () => {
      const result = await service.assignQuantityCardsToPlayer(
        player,
        quantityCards,
        manager,
      );

      const retainedCard = result.find((card) => card.card.id === 2);
      expect(retainedCard).toBeDefined();
      expect(retainedCard.quantity).toEqual(2);
    });

    it('should handle empty quantityCards without errors', async () => {
      const result = await service.assignQuantityCardsToPlayer(
        player,
        [],
        manager,
      );

      expect(result).toEqual(player.playerCards);
      expect(manager.save).toHaveBeenCalledWith(PlayerCard, player.playerCards);
    });
  });

  describe('assignCharacterRandomCardsToPlayer', () => {
    let manager: EntityManager;
    let player: Player;

    beforeEach(() => {
      player = {
        id: 1,
        character: {
          equipment: {
            random: {
              common_items: 2,
              unique_items: 1,
              spells: 0,
              abilities: 1,
              allies: 1,
            },
          },
        },
        playerCards: [],
      } as Player;

      manager = {
        find: jest.fn().mockResolvedValue([
          { id: 1, type: CardType.COMMON_ITEM },
          { id: 2, type: CardType.COMMON_ITEM },
          { id: 3, type: CardType.UNIQUE_ITEM },
          { id: 4, type: CardType.ABILITY },
          { id: 5, type: CardType.ALLY },
        ]),
      } as unknown as EntityManager;

      jest
        .spyOn(ArrayHelper, 'randomElements')
        .mockImplementation((array, count) => array.slice(0, count));

      jest
        .spyOn(service, 'assignQuantityCardsToPlayer')
        .mockResolvedValue([
          { id: 1, card: { id: 1 } as Card, quantity: 1, player } as PlayerCard,
          { id: 3, card: { id: 3 } as Card, quantity: 1, player } as PlayerCard,
        ]);
    });

    it('should assign random cards to the player based on character equipment', async () => {
      const result = await service.assignCharacterRandomCardsToPlayer(
        player,
        manager,
      );

      expect(manager.find).toHaveBeenCalledWith(Card, {
        relations: ['translations'],
      });

      expect(ArrayHelper.randomElements).toHaveBeenCalledTimes(5); // For each card type
      expect(service.assignQuantityCardsToPlayer).toHaveBeenCalled();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('card.id');
    });

    it('should handle character with no random equipment specified', async () => {
      player.character.equipment.random = {
        common_items: 0,
        unique_items: 0,
        spells: 0,
        abilities: 0,
        allies: 0,
      };

      const result = await service.assignCharacterRandomCardsToPlayer(
        player,
        manager,
      );

      expect(result).toEqual([]);
      expect(service.assignQuantityCardsToPlayer).not.toHaveBeenCalled();
    });

    it('should handle empty card repository gracefully', async () => {
      manager.find = jest.fn().mockResolvedValue([]);

      const result = await service.assignCharacterRandomCardsToPlayer(
        player,
        manager,
      );

      expect(result).toEqual([]);
      expect(service.assignQuantityCardsToPlayer).not.toHaveBeenCalled();
    });

    it('should assign correct number of cards for each type', async () => {
      await service.assignCharacterRandomCardsToPlayer(player, manager);

      expect(ArrayHelper.randomElements).toHaveBeenCalledWith(
        expect.arrayContaining([{ id: 1, type: CardType.COMMON_ITEM }]),
        2,
      );
      expect(ArrayHelper.randomElements).toHaveBeenCalledWith(
        expect.arrayContaining([{ id: 3, type: CardType.UNIQUE_ITEM }]),
        1,
      );
    });
  });

  describe('generateQuantityCards', () => {
    it('should group cards by their IDs and calculate quantities', () => {
      const cards = [
        { id: 1, name: 'Card 1' } as Card,
        { id: 2, name: 'Card 2' } as Card,
        { id: 1, name: 'Card 1' } as Card,
        { id: 3, name: 'Card 3' } as Card,
        { id: 2, name: 'Card 2' } as Card,
        { id: 1, name: 'Card 1' } as Card,
      ];

      const result = service.generateQuantityCards(cards);

      expect(result).toBeDefined();
      expect(result.length).toBe(3);

      const card1 = result.find((qc) => qc.card.id === 1);
      const card2 = result.find((qc) => qc.card.id === 2);
      const card3 = result.find((qc) => qc.card.id === 3);

      expect(card1).toBeDefined();
      expect(card1.quantity).toBe(3);

      expect(card2).toBeDefined();
      expect(card2.quantity).toBe(2);

      expect(card3).toBeDefined();
      expect(card3.quantity).toBe(1);
    });

    it('should return an empty array if no cards are provided', () => {
      const result = service.generateQuantityCards([]);

      expect(result).toEqual([]);
    });

    it('should handle a single card correctly', () => {
      const cards = [{ id: 1, name: 'Card 1' } as Card];

      const result = service.generateQuantityCards(cards);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].quantity).toBe(1);
      expect(result[0].card.id).toBe(1);
    });

    it('should handle cards with unique IDs without merging quantities', () => {
      const cards = [
        { id: 1, name: 'Card 1' } as Card,
        { id: 2, name: 'Card 2' } as Card,
        { id: 3, name: 'Card 3' } as Card,
      ];

      const result = service.generateQuantityCards(cards);

      expect(result).toBeDefined();
      expect(result.length).toBe(3);

      result.forEach((qc) => {
        expect(qc.quantity).toBe(1);
      });
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
        attributes: {
          speed: [1, 2, 3],
          sneak: [4, 5, 6],
          prowess: [7, 8, 9],
          will: [10, 11, 12],
          knowledge: [13, 14, 15],
          luck: [16, 17, 18],
        },
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
    let player: Player;

    beforeEach(() => {
      player = {
        id: 1,
        role: PlayerRole.HOST,
        character: { characterCards: [] },
        playerCards: [],
      } as Player;

      manager = {
        save: jest.fn().mockResolvedValueOnce(player).mockResolvedValueOnce([]),
        create: jest.fn().mockResolvedValue({
          role: PlayerRole.HOST,
          character: { characterCards: [] },
          playerCards: [],
        }),
      } as unknown as EntityManager;

      service['getPlayer'] = jest.fn().mockResolvedValue(player);
      service['assignCharacterRandomCardsToPlayer'] = jest
        .fn()
        .mockResolvedValue([]);
      service['assignQuantityCardsToPlayer'] = jest.fn().mockResolvedValue([]);
    });

    it('should add a player to a game session and return PlayerDto', async () => {
      const gameSession = new GameSession();
      const user = new User();
      const characterCards = [
        { card: new Card(), quantity: 1 },
      ] as CharacterCard[];

      player.character = { id: 1, characterCards } as Character;

      service['generatePlayerObject'] = jest.fn().mockResolvedValue({
        token: 'uniqueToken',
        user,
        game_session: gameSession,
        character: player.character,
      });

      const result = await service.addPlayerToGameSession(
        gameSession,
        manager,
        true,
        user,
      );

      expect(result).toBeInstanceOf(PlayerDto);
      expect(result).toEqual(
        PlayerDto.fromEntity(player, {
          character: true,
          playerCards: true,
        }),
      );
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

    it('should throw PlayerNotFoundException if the player with the given token does not exist', async () => {
      const token = 'invalidToken';

      service['getPlayer'] = jest
        .fn()
        .mockRejectedValue(new PlayerNotFoundException());

      await expect(service.getPlayerByToken(token)).rejects.toThrow(
        PlayerNotFoundException,
      );
    });
  });

  describe('createPlayerDtoFromEntity', () => {
    it('should create a PlayerDto from a Player entity with nested properties', () => {
      const playerEntity = {
        id: 1,
        user: { id: 10, name: 'User 1' },
        character: { id: 20, name: 'Character 1' },
        playerCards: [
          { id: 30, card: { id: 40, name: 'Card 1' } } as PlayerCard,
          { id: 31, card: { id: 41, name: 'Card 2' } } as PlayerCard,
        ],
      } as Player;

      const result = PlayerService.createPlayerDtoFromEntity(playerEntity);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(PlayerDto);

      // Validate main properties
      expect(result.id).toBe(playerEntity.id);
      expect(result.user).toEqual(playerEntity.user);
      expect(result.character).toEqual(playerEntity.character);

      // Validate playerCards transformation
      expect(result.playerCards).toBeDefined();
      expect(result.playerCards.length).toBe(2);

      result.playerCards.forEach((playerCardDto, index) => {
        const correspondingPlayerCard = playerEntity.playerCards[index];
        expect(playerCardDto).toBeDefined();
        expect(playerCardDto.id).toBe(correspondingPlayerCard.id);
        expect(playerCardDto.card).toEqual(correspondingPlayerCard.card);
      });
    });

    it('should handle empty playerCards array gracefully', () => {
      const playerEntity = {
        id: 1,
        user: { id: 10, name: 'User 1' },
        character: { id: 20, name: 'Character 1' },
        playerCards: [],
      } as Player;

      const result = PlayerService.createPlayerDtoFromEntity(playerEntity);

      expect(result).toBeDefined();
      expect(result.playerCards).toEqual([]);
    });

    it('should handle null or undefined playerCards gracefully', () => {
      const playerEntity = {
        id: 1,
        user: { id: 10, name: 'User 1' },
        character: { id: 20, name: 'Character 1' },
        playerCards: null,
      } as unknown as Player;

      const result = PlayerService.createPlayerDtoFromEntity(playerEntity);

      expect(result).toBeDefined();
      expect(result.playerCards).toEqual(undefined);
    });
  });
});
