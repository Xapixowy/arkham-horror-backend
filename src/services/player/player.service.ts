import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { GameSession } from '@Entities/game-session.entity';
import { User } from '@Entities/user.entity';
import { Player } from '@Entities/player.entity';
import { PlayerRole } from '@Enums/player/player-role.enum';
import { PlayerDto } from '@Dtos/player.dto';
import { PlayerExistsException } from '@Exceptions/player/player-exists.exception';
import { ConfigService } from '@nestjs/config';
import { GameSessionsConfig } from '@Configs/game_sessions.config';
import { PlayersLimitReachedException } from '@Exceptions/game-session/players-limit-reached.exception';
import { Character } from '@Entities/character.entity';
import { ArrayHelper } from '@Helpers/array/array.helper';
import { Language } from '@Enums/language';
import { AppConfig } from '@Configs/app.config';
import { CharacterService } from '@Services/character/character.service';
import { CardService } from '@Services/card/card.service';
import { Card } from '@Entities/card.entity';
import { PlayerCard } from '@Entities/player-card.entity';
import { PlayerCardDto } from '@Dtos/player-card.dto';
import { RegexConfig } from '@Configs/regex.config';
import { PlayerTokenInvalidException } from '@Exceptions/player/player-token-invalid.exception';
import { PlayerObject } from '@Types/player/player-object.type';
import { UpdatePlayerRequest } from '@Requests/player/update-player.request';
import { ObjectHelper } from '@Helpers/object/object.helper';
import { StatisticsService } from '@Services/statistics/statistics.service';
import { GameSessionsGateway } from '@Gateways/game-sessions.gateway';
import { UserNotFoundException } from '@Exceptions/user/user-not-found.exception';
import { GameSessionNotFoundException } from '@Exceptions/game-session/game-session-not-found.exception';
import { PlayerNotFoundException } from '@Exceptions/player/player-not-found.exception';
import { QuantityCard } from '@Types/card/quantity-card.type';
import { CardType } from '@Enums/card/card.type';

const DEFAULT_PLAYER_RELATIONS: string[] = [
  'user',
  'character',
  'character.translations',
  'playerCards',
  'playerCards.card',
  'playerCards.card.translations',
];

const DEFAULT_GAME_SESSION_RELATIONS: string[] = ['players'];

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(GameSession)
    private readonly gameSessionRepository: Repository<GameSession>,
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly gameSessionsGateway: GameSessionsGateway,
  ) {}

  async findAll(
    gameSessionToken: string,
    language: Language,
  ): Promise<PlayerDto[]> {
    const existingGameSession = await this.getGameSession(gameSessionToken);

    const players = await this.playerRepository.find({
      where: { game_session: { id: existingGameSession.id } },
      relations: DEFAULT_PLAYER_RELATIONS,
      order: {
        id: 'ASC',
      },
    });

    return players
      .map((player) => this.getTranslatedPlayer(player, language))
      .map((player) => PlayerService.createPlayerDtoFromEntity(player));
  }

  async findOne(
    gameSessionToken: string,
    playerToken: string,
    language: Language,
  ): Promise<PlayerDto> {
    await this.getGameSession(gameSessionToken);

    const existingPlayer = await this.getPlayer(playerToken);
    const translatedPlayer = this.getTranslatedPlayer(existingPlayer, language);

    return PlayerService.createPlayerDtoFromEntity(translatedPlayer);
  }

  async findUserPlayer(
    gameSessionToken: string,
    user: User,
    language: Language,
  ): Promise<PlayerDto> {
    if (!user) {
      throw new UserNotFoundException();
    }

    const existingGameSession = await this.getGameSession(gameSessionToken);
    const userPlayerInGameSession = await this.getUserPlayerInGameSession(
      user,
      existingGameSession,
    );
    const translatedPlayer = this.getTranslatedPlayer(
      userPlayerInGameSession,
      language,
    );

    return PlayerDto.fromEntity(translatedPlayer, {
      user: true,
      character: true,
    });
  }

  async add(gameSessionToken: string, user: User | null): Promise<PlayerDto> {
    const existingGameSession = await this.getGameSession(gameSessionToken);
    let isExistingPlayer = false;

    if (user) {
      try {
        isExistingPlayer = !!(await this.getUserPlayerInGameSession(
          user,
          existingGameSession,
        ));
      } catch {}
    }

    if (isExistingPlayer) {
      throw new PlayerExistsException();
    }

    const isHostInGameSession = existingGameSession.players.some(
      (player) => player.role === PlayerRole.HOST,
    );
    const playersInGameSessionCount = existingGameSession.players.length;
    const maxPlayersInGameSession =
      this.configService.get<GameSessionsConfig>('gameSessions').maxPlayers;

    if (playersInGameSessionCount >= maxPlayersInGameSession) {
      throw new PlayersLimitReachedException();
    }
    return this.dataSource.transaction(async (manager) => {
      return await this.addPlayerToGameSession(
        existingGameSession,
        manager,
        !isHostInGameSession,
        user,
      );
    });
  }

  async remove(playerToken: string): Promise<PlayerDto> {
    const player = await this.getPlayer(playerToken);

    return this.dataSource.transaction(async (manager) => {
      await manager.remove(Player, player);
      return PlayerDto.fromEntity(player);
    });
  }

  async renewCharacter(
    gameSessionToken: string,
    playerToken: string,
    language: Language,
  ): Promise<PlayerDto> {
    const existingGameSession = await this.getGameSession(gameSessionToken);
    const existingPlayer = await this.getPlayer(playerToken);

    return this.dataSource.transaction(async (manager) => {
      const newCharacter =
        await this.getUnusedCharacterInGameSession(existingGameSession);

      for (const playerCard of existingPlayer.playerCards) {
        await manager.remove(PlayerCard, playerCard);
      }

      const playerToUpdate = manager.merge(Player, existingPlayer, {
        character: newCharacter,
        status: {
          sanity: newCharacter.sanity,
          endurance: newCharacter.endurance,
        },
        equipment: {
          money: newCharacter.equipment.money,
          clues: newCharacter.equipment.clues,
        },
        attributes: {
          speed: newCharacter.attributes.speed[0],
          sneak: newCharacter.attributes.sneak[0],
          prowess: newCharacter.attributes.prowess[0],
          will: newCharacter.attributes.will[0],
          knowledge: newCharacter.attributes.knowledge[0],
          luck: newCharacter.attributes.luck[0],
        },
        updated_at: new Date(),
        statistics: {
          ...existingPlayer.statistics,
          characters_played: existingPlayer.statistics.characters_played + 1,
        },
      });
      playerToUpdate.playerCards = [];

      const updatedPlayer = await manager.save(Player, playerToUpdate);

      const updatedPlayerWithCharacterCards = manager.merge(
        Player,
        updatedPlayer,
        {
          playerCards: await this.assignCharacterCardsToPlayer(
            updatedPlayer,
            manager,
          ),
        },
      );

      const updatedPlayerWithCards = manager.merge(Player, updatedPlayer, {
        playerCards: await this.assignCharacterRandomCardsToPlayer(
          updatedPlayerWithCharacterCards,
          manager,
        ),
      });

      this.gameSessionsGateway.emitPlayerUpdatedEvent(
        gameSessionToken,
        PlayerService.createPlayerDtoFromEntity(updatedPlayerWithCards),
      );

      const translatedPlayer = this.getTranslatedPlayer(
        updatedPlayerWithCards,
        language,
      );

      return PlayerService.createPlayerDtoFromEntity(translatedPlayer);
    });
  }

  async assignCards(
    gameSessionToken: string,
    playerToken: string,
    language: Language,
    cardIds: number[],
  ): Promise<PlayerCardDto[]> {
    await this.getGameSession(gameSessionToken);
    const existingPlayer = await this.getPlayer(playerToken);

    return this.dataSource.transaction(async (manager) => {
      const cardsToAssign = await this.cardRepository.find({
        where: { id: In(cardIds) },
        relations: ['translations'],
      });

      const cardsToAssignWithQuantity: QuantityCard[] = cardsToAssign.map(
        (card) => ({
          card,
          quantity: cardIds.filter((cardId) => cardId === card.id).length,
        }),
      );

      const allPlayerCards = await this.assignQuantityCardsToPlayer(
        existingPlayer,
        cardsToAssignWithQuantity,
        manager,
      );

      const acquiredCardCount = cardsToAssignWithQuantity.reduce(
        (acc, card) => acc + card.quantity,
        0,
      );

      const playerToUpdate = await manager.findOneBy(Player, {
        id: existingPlayer.id,
      });

      const updatedPlayer = await manager.save(Player, {
        ...playerToUpdate,
        updated_at: new Date(),
        statistics: {
          ...playerToUpdate.statistics,
          cards_acquired:
            playerToUpdate.statistics.cards_acquired + acquiredCardCount,
        },
      });

      this.gameSessionsGateway.emitPlayerUpdatedEvent(
        gameSessionToken,
        PlayerService.createPlayerDtoFromEntity(updatedPlayer),
      );

      return allPlayerCards.map((playerCard) =>
        PlayerCardDto.fromEntity(
          {
            ...playerCard,
            card: CardService.getTranslatedCard(playerCard.card, language),
          },
          {
            card: true,
          },
        ),
      );
    });
  }

  async removeCards(
    gameSessionToken: string,
    playerToken: string,
    language: Language,
    cardIds: number[],
  ): Promise<PlayerCardDto[]> {
    await this.getGameSession(gameSessionToken);
    const existingPlayer = await this.getPlayer(playerToken);

    return this.dataSource.transaction(async (manager) => {
      const existingPlayerCardsMap = new Map(
        existingPlayer.playerCards.map((playerCard) => [
          playerCard.card.id,
          playerCard,
        ]),
      );

      let lostCardCount = 0;

      for (const cardId of cardIds) {
        const playerCard = existingPlayerCardsMap.get(cardId);

        if (playerCard) {
          lostCardCount += 1;
          if (playerCard.quantity > 1) {
            playerCard.quantity -= 1;
            await manager.save(PlayerCard, playerCard);
          } else {
            existingPlayerCardsMap.delete(cardId);
            await manager.remove(PlayerCard, playerCard);
          }
        }
      }

      const playerToUpdate = await manager.findOneBy(Player, {
        id: existingPlayer.id,
      });

      const updatedPlayer = await manager.save(Player, {
        ...playerToUpdate,
        updated_at: new Date(),
        statistics: {
          ...playerToUpdate.statistics,
          cards_lost: playerToUpdate.statistics.cards_lost + lostCardCount,
        },
      });

      this.gameSessionsGateway.emitPlayerUpdatedEvent(
        gameSessionToken,
        PlayerService.createPlayerDtoFromEntity(updatedPlayer),
      );

      const remainingPlayerCards = Array.from(existingPlayerCardsMap.values());

      return remainingPlayerCards.map((playerCard) =>
        PlayerCardDto.fromEntity(
          {
            ...playerCard,
            card: CardService.getTranslatedCard(playerCard.card, language),
          },
          {
            card: true,
          },
        ),
      );
    });
  }

  async updatePlayer(
    gameSessionToken: string,
    playerToken: string,
    language: Language,
    updatePlayerRequest: UpdatePlayerRequest,
  ): Promise<PlayerDto> {
    await this.getGameSession(gameSessionToken);
    const existingPlayer = await this.getPlayer(playerToken);
    const newStatistics = StatisticsService.generateUpdatedPlayerStatistics(
      existingPlayer,
      updatePlayerRequest,
    );
    const newPlayer = {
      ...ObjectHelper.replaceDefinedValues(existingPlayer, updatePlayerRequest),
      statistics: newStatistics,
      updated_at: new Date(),
    };

    return this.dataSource.transaction(async (manager) => {
      const updatedPlayer = await manager.save(Player, newPlayer);

      this.gameSessionsGateway.emitPlayerUpdatedEvent(
        gameSessionToken,
        PlayerService.createPlayerDtoFromEntity(updatedPlayer),
      );

      const translatedPlayer = this.getTranslatedPlayer(
        updatedPlayer,
        language,
      );

      return PlayerService.createPlayerDtoFromEntity(translatedPlayer);
    });
  }

  async assignQuantityCardsToPlayer(
    player: Player,
    quantityCards: QuantityCard[],
    manager: EntityManager,
  ): Promise<PlayerCard[]> {
    const existingPlayerCardsMap = new Map<number, PlayerCard>(
      player.playerCards.map((playerCard: PlayerCard) => [
        playerCard.card.id,
        playerCard,
      ]),
    );

    const combinedPlayerCardsMap = quantityCards.map((quantityCard) => {
      const existingCard = existingPlayerCardsMap.get(quantityCard.card.id);

      if (existingCard) {
        existingCard.quantity += quantityCard.quantity;
        return existingCard;
      } else {
        return manager.create(PlayerCard, {
          ...quantityCard,
          player,
        });
      }
    });

    const allPlayerCards: PlayerCard[] = [
      ...combinedPlayerCardsMap,
      ...player.playerCards.filter(
        (playerCard: PlayerCard) =>
          !combinedPlayerCardsMap.some((card) => card.id === playerCard.id),
      ),
    ];

    await manager.save(PlayerCard, allPlayerCards);

    return allPlayerCards;
  }

  async assignCharacterRandomCardsToPlayer(
    player: Player,
    manager: EntityManager,
  ): Promise<PlayerCard[]> {
    const allCards = await manager.find(Card, {
      relations: ['translations'],
    });

    const characterEquipment = player.character.equipment.random;

    const randomCards = {
      common_items:
        ArrayHelper.randomElements(
          allCards.filter((card) => card.type === CardType.COMMON_ITEM),
          characterEquipment.common_items,
        ) || [],
      unique_items:
        ArrayHelper.randomElements(
          allCards.filter((card) => card.type === CardType.UNIQUE_ITEM),
          characterEquipment.unique_items,
        ) || [],
      spells:
        ArrayHelper.randomElements(
          allCards.filter((card) => card.type === CardType.SPELL),
          characterEquipment.spells,
        ) || [],
      abilities:
        ArrayHelper.randomElements(
          allCards.filter((card) => card.type === CardType.ABILITY),
          characterEquipment.abilities,
        ) || [],
      allies:
        ArrayHelper.randomElements(
          allCards.filter((card) => card.type === CardType.ALLY),
          characterEquipment.allies,
        ) || [],
    };

    const quantityCards = this.generateQuantityCards(
      Object.values(randomCards).flat(),
    );

    if (quantityCards.length === 0) {
      return [];
    }

    return await this.assignQuantityCardsToPlayer(
      player,
      quantityCards,
      manager,
    );
  }

  async assignCharacterCardsToPlayer(
    player: Player,
    manager: EntityManager,
  ): Promise<PlayerCard[]> {
    const characterCards = player.character.characterCards || [];

    if (characterCards.length === 0) {
      return player.playerCards || [];
    }

    const quantityCards: QuantityCard[] = characterCards.map(
      (characterCard) => ({
        card: characterCard.card,
        quantity: characterCard.quantity,
      }),
    );

    return await this.assignQuantityCardsToPlayer(
      player,
      quantityCards,
      manager,
    );
  }

  generateQuantityCards(cards: Card[]): QuantityCard[] {
    const cardMap: Map<number, QuantityCard> = new Map();

    cards.forEach((card) => {
      if (cardMap.has(card.id)) {
        cardMap.get(card.id)!.quantity += 1;
      } else {
        cardMap.set(card.id, { card, quantity: 1 });
      }
    });

    return Array.from(cardMap.values());
  }

  async generatePlayerObject(
    gameSession: GameSession,
    isHost: boolean = true,
    user: User | null,
  ): Promise<PlayerObject> {
    const token: string = await this.getUnusedToken();

    const character = await this.getUnusedCharacterInGameSession(gameSession);

    return {
      token,
      user: user,
      game_session: gameSession,
      character,
      status: {
        endurance: character.endurance,
        sanity: character.sanity,
      },
      equipment: {
        money: character.equipment.money,
        clues: character.equipment.clues,
      },
      attributes: {
        speed: character.attributes.speed[2],
        sneak: character.attributes.sneak[2],
        prowess: character.attributes.prowess[2],
        will: character.attributes.will[2],
        knowledge: character.attributes.knowledge[2],
        luck: character.attributes.luck[2],
      },
      role: isHost ? PlayerRole.HOST : PlayerRole.PLAYER,
    };
  }

  async addPlayerToGameSession(
    gameSession: GameSession,
    manager: EntityManager,
    isHost: boolean = true,
    user: User | null,
  ): Promise<PlayerDto> {
    const newPlayerObject = await this.generatePlayerObject(
      gameSession,
      isHost,
      user,
    );

    const newPlayerToken = (
      await manager.save(Player, manager.create(Player, newPlayerObject))
    ).token;

    const newPlayer = await this.getPlayer(
      newPlayerToken,
      [
        ...DEFAULT_PLAYER_RELATIONS,
        'character.characterCards',
        'character.characterCards.card',
      ],
      manager,
    );

    newPlayer.playerCards = await this.assignCharacterCardsToPlayer(
      newPlayer,
      manager,
    );

    newPlayer.playerCards = await this.assignCharacterRandomCardsToPlayer(
      newPlayer,
      manager,
    );

    return PlayerService.createPlayerDtoFromEntity(newPlayer);
  }

  getTranslatedPlayer(player: Player, language: Language): Player {
    const appLanguage = this.configService.get<AppConfig>('app').language;

    if (language === appLanguage) {
      return player;
    }

    const translatedPlayer = { ...player };

    if (player.character) {
      translatedPlayer.character = CharacterService.getTranslatedCharacter(
        player.character,
        language,
      );
    }

    if (player.playerCards) {
      translatedPlayer.playerCards = player.playerCards.map((playerCard) => ({
        ...playerCard,
        card: CardService.getTranslatedCard(playerCard.card, language),
      }));
    }

    return translatedPlayer;
  }

  async getPlayerByToken(token: string): Promise<Player | null> {
    return await this.getPlayer(token, ['game_session']);
  }

  private async getUnusedToken(): Promise<string> {
    const token = crypto.randomUUID();

    const isTokenAlreadyUsed = !!(await this.playerRepository.findOne({
      where: { token },
    }));

    if (isTokenAlreadyUsed) {
      return this.getUnusedToken();
    }

    return token;
  }

  private async getUnusedCharacterInGameSession(
    gameSession: GameSession,
  ): Promise<Character> {
    const characters = await this.characterRepository.find({
      relations: ['translations', 'characterCards', 'characterCards.card'],
    });

    const randomCharacter = ArrayHelper.randomElement(characters);

    const playerWithRandomCharacter = await this.playerRepository.findOne({
      where: {
        character: { id: randomCharacter.id },
        game_session: { id: gameSession.id },
      },
      relations: ['character', 'game_session'],
    });

    const isCharacterAlreadyUsed = !!playerWithRandomCharacter;

    if (isCharacterAlreadyUsed) {
      return this.getUnusedCharacterInGameSession(gameSession);
    }

    return randomCharacter;
  }

  private async getGameSession(
    token: string,
    relations: string[] = DEFAULT_GAME_SESSION_RELATIONS,
    manager?: EntityManager,
  ): Promise<GameSession> {
    const existingGameSession = manager
      ? await manager.findOne(GameSession, {
          where: { token },
          relations,
        })
      : await this.gameSessionRepository.findOne({
          where: { token },
          relations,
        });

    if (!existingGameSession) {
      throw new GameSessionNotFoundException();
    }

    return existingGameSession;
  }

  private async getPlayer(
    token: string,
    relations: string[] = DEFAULT_PLAYER_RELATIONS,
    manager?: EntityManager,
  ): Promise<Player> {
    const uuidRegex = this.configService.get<RegexConfig>('regex').uuid;

    if (!uuidRegex.test(token)) {
      throw new PlayerTokenInvalidException();
    }

    const existingPlayer = manager
      ? await manager.findOne(Player, {
          where: { token },
          relations,
        })
      : await this.playerRepository.findOne({
          where: { token },
          relations,
        });

    if (!existingPlayer) {
      throw new PlayerNotFoundException();
    }

    return existingPlayer;
  }

  private async getUserPlayerInGameSession(
    user: User,
    gameSession: GameSession,
    relations: string[] = [
      'user',
      'character',
      'character.translations',
      'playerCards',
      'playerCards.card',
      'playerCards.card.translations',
    ],
  ): Promise<Player> {
    const existingPlayer = await this.playerRepository.findOne({
      where: { user, game_session: { id: gameSession.id } },
      relations,
    });

    if (!existingPlayer) {
      throw new PlayerNotFoundException();
    }

    return existingPlayer;
  }

  static createPlayerDtoFromEntity(player: Player): PlayerDto {
    return PlayerDto.fromEntity(
      player,
      {
        user: true,
        character: true,
        playerCards: true,
      },
      {
        ...PlayerDto.typeMapping,
        playerCards: (playerCards: PlayerCard[]) =>
          playerCards.map((playerCard) =>
            PlayerCardDto.fromEntity(playerCard, {
              card: true,
            }),
          ),
      },
    );
  }
}
