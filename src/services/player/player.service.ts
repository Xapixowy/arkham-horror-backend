import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { NotFoundException } from '@Exceptions/not-found.exception';
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
  ) {}

  async findAll(
    gameSessionToken: string,
    language: Language,
  ): Promise<PlayerDto[]> {
    const existingGameSession = await this.getGameSession(gameSessionToken);

    const players = await this.playerRepository.find({
      where: { game_session: { id: existingGameSession.id } },
      relations: [
        'user',
        'character',
        'character.translations',
        'playerCards',
        'playerCards.card',
        'playerCards.card.translations',
      ],
    });

    return players
      .map((player) => this.getTranslatedPlayer(player, language))
      .map((player) =>
        PlayerDto.fromEntity(player, {
          user: true,
          character: true,
          playerCards: true,
        }),
      );
  }

  async findOne(
    gameSessionToken: string,
    playerToken: string,
    language: Language,
  ): Promise<PlayerDto> {
    await this.getGameSession(gameSessionToken);

    const existingPlayer = await this.getPlayer(playerToken);
    const translatedPlayer = this.getTranslatedPlayer(existingPlayer, language);

    return PlayerDto.fromEntity(translatedPlayer, {
      user: true,
      character: true,
      playerCards: true,
    });
  }

  async findUserPlayer(
    gameSessionToken: string,
    user: User,
    language: Language,
  ): Promise<PlayerDto> {
    if (!user) {
      throw new NotFoundException();
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
      const newPlayer = await manager.save(
        Player,
        manager.create(
          Player,
          await this.generatePlayerObject(
            existingGameSession,
            !isHostInGameSession,
            user,
          ),
        ),
      );

      return PlayerDto.fromEntity(newPlayer, {
        user: true,
        character: true,
      });
    });
  }

  async remove(playerToken: string): Promise<PlayerDto> {
    const player = await this.getPlayer(playerToken, [
      'user',
      'character',
      'game_session',
      'cards',
    ]);

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
    const existingPlayer = await this.getPlayer(playerToken, ['character']);

    return this.dataSource.transaction(async (manager) => {
      existingPlayer.character =
        await this.getUnusedCharacterInGameSession(existingGameSession);
      existingPlayer.updated_at = new Date();

      const translatedPlayer = this.getTranslatedPlayer(
        await manager.save(Player, existingPlayer),
        language,
      );

      return PlayerDto.fromEntity(translatedPlayer, {
        character: true,
      });
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

      const cardsToAssignWithQuantity = cardsToAssign.map((card) => ({
        card,
        quantity: cardIds.filter((cardId) => cardId === card.id).length,
      }));

      const existingPlayerCardsMap = new Map(
        existingPlayer.playerCards.map((playerCard) => [
          playerCard.card.id,
          playerCard,
        ]),
      );

      const combinedPlayerCardsMap = cardsToAssignWithQuantity.map(
        (cardToAssignWithQuantity) => {
          const existingCard = existingPlayerCardsMap.get(
            cardToAssignWithQuantity.card.id,
          );

          if (existingCard) {
            existingCard.quantity += cardToAssignWithQuantity.quantity;
            return existingCard;
          } else {
            return manager.create(PlayerCard, {
              ...cardToAssignWithQuantity,
              player: existingPlayer,
            });
          }
        },
      );

      const allPlayerCards = [
        ...combinedPlayerCardsMap,
        ...existingPlayer.playerCards.filter(
          (playerCard) =>
            !combinedPlayerCardsMap.some((card) => card.id === playerCard.id),
        ),
      ];

      await manager.save(PlayerCard, allPlayerCards);

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

      for (const cardId of cardIds) {
        const playerCard = existingPlayerCardsMap.get(cardId);

        if (playerCard && playerCard.quantity > 1) {
          playerCard.quantity -= 1;
          await manager.save(PlayerCard, playerCard);
        } else if (playerCard) {
          existingPlayerCardsMap.delete(cardId);
          await manager.remove(PlayerCard, playerCard);
        }
      }

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

    return this.dataSource.transaction(async (manager) => {
      const updatedPlayer = await manager.save(
        Player,
        ObjectHelper.replaceDefinedValues(existingPlayer, updatePlayerRequest),
      );
      return PlayerDto.fromEntity(
        this.getTranslatedPlayer(updatedPlayer, language),
        {
          character: true,
        },
      );
    });
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
      statistics: {
        speed: character.statistics.speed[2],
        sneak: character.statistics.speed[2],
        prowess: character.statistics.speed[2],
        will: character.statistics.speed[2],
        knowledge: character.statistics.speed[2],
        luck: character.statistics.speed[2],
      },
      role: isHost ? PlayerRole.HOST : PlayerRole.PLAYER,
    };
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
      relations: ['translations'],
    });

    const randomCharacter = ArrayHelper.randomElement(characters);

    const isCharacterAlreadyUsed = !!(await this.playerRepository.findOne({
      where: { character: { id: randomCharacter.id } },
    }));

    if (isCharacterAlreadyUsed) {
      return this.getUnusedCharacterInGameSession(gameSession);
    }

    return randomCharacter;
  }

  private async getGameSession(
    token: string,
    relations: string[] = ['players'],
  ): Promise<GameSession> {
    const existingGameSession = await this.gameSessionRepository.findOne({
      where: { token },
      relations,
    });

    if (!existingGameSession) {
      throw new NotFoundException();
    }

    return existingGameSession;
  }

  private async getPlayer(
    token: string,
    relations: string[] = [
      'user',
      'character',
      'character.translations',
      'playerCards',
      'playerCards.card',
      'playerCards.card.translations',
    ],
  ): Promise<Player> {
    const uuidRegex = this.configService.get<RegexConfig>('regex').uuid;

    if (!uuidRegex.test(token)) {
      throw new PlayerTokenInvalidException();
    }

    const existingPlayer = await this.playerRepository.findOne({
      where: { token },
      relations,
    });

    if (!existingPlayer) {
      throw new NotFoundException();
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
      throw new NotFoundException();
    }

    return existingPlayer;
  }
}
