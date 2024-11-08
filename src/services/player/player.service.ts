import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(GameSession)
    private readonly gameSessionRepository: Repository<GameSession>,
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
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
        'cards',
        'cards.translations',
      ],
    });

    return players
      .map((player) => this.getTranslatedPlayer(player, language))
      .map((player) =>
        PlayerDto.fromEntity(player, {
          user: true,
          character: true,
          cards: true,
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
      cards: true,
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

  async generatePlayerObject(
    gameSession: GameSession,
    isHost: boolean = true,
    user: User | null,
  ): Promise<object> {
    const token: string = await this.getUnusedToken();

    return {
      token,
      user: user,
      game_session: gameSession,
      character: await this.getUnusedCharacterInGameSession(gameSession),
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

    if (player.cards) {
      translatedPlayer.cards = player.cards.map((card) =>
        CardService.getTranslatedCard(card, language),
      );
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
      'cards',
      'cards.translations',
    ],
  ): Promise<Player> {
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
      'cards',
      'cards.translations',
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
