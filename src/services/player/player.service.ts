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

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(GameSession)
    private gameSessionRepository: Repository<GameSession>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async findAll(gameSessionToken: string): Promise<PlayerDto[]> {
    const existingGameSession = await this.getGameSession(gameSessionToken);

    const players = await this.playerRepository.find({
      where: { game_session: existingGameSession },
      relations: ['user', 'character'],
    });

    return players.map((player) =>
      PlayerDto.fromEntity(player, {
        user: true,
        character: true,
      }),
    );
  }

  async findOne(
    gameSessionToken: string,
    playerToken: string,
  ): Promise<PlayerDto> {
    await this.getGameSession(gameSessionToken);

    const existingPlayer = await this.getPlayer(playerToken);

    return PlayerDto.fromEntity(existingPlayer, {
      user: true,
      character: true,
    });
  }

  async add(gameSessionToken: string, userId: number): Promise<PlayerDto> {
    const existingGameSession = await this.getGameSession(gameSessionToken);
    const existingUser = await this.getUser(userId);
    let isExistingPlayer = false;

    try {
      isExistingPlayer = !!(await this.getUserPlayerInGameSession(
        userId,
        existingGameSession,
      ));
    } catch (e) {}

    if (isExistingPlayer) {
      throw new PlayerExistsException();
    }

    const playersInGameSessionCount = existingGameSession.players.length;

    return this.dataSource.transaction(async (manager) => {
      const newPlayer = await manager.save(
        Player,
        manager.create(
          Player,
          await this.generatePlayerObject(
            existingGameSession,
            playersInGameSessionCount === 0,
            existingUser,
          ),
        ),
      );

      return PlayerDto.fromEntity(newPlayer, {
        user: true,
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

  async generatePlayerObject(
    gameSession: GameSession,
    isHost: boolean = true,
    user?: User,
  ): Promise<object> {
    const token: string = await this.getUnusedToken();
    return {
      token,
      user: user ?? null,
      game_session: gameSession,
      role: isHost ? PlayerRole.HOST : PlayerRole.PLAYER,
    };
  }

  private async getUnusedToken(): Promise<string> {
    const token = crypto.randomUUID();

    const isTokenAlreadyUsed = await this.playerRepository.findOne({
      where: { token },
    });

    if (isTokenAlreadyUsed) {
      return this.getUnusedToken();
    }

    return token;
  }

  private async getGameSession(token: string): Promise<GameSession> {
    const existingGameSession = await this.gameSessionRepository.findOne({
      where: { token },
      relations: ['players'],
    });

    if (!existingGameSession) {
      throw new NotFoundException();
    }

    return existingGameSession;
  }

  private async getPlayer(
    token: string,
    relations: string[] = ['user', 'character'],
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

  private async getUser(userId: number): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException();
    }

    return existingUser;
  }

  private async getUserPlayerInGameSession(
    userId: number,
    gameSession: GameSession,
  ): Promise<Player> {
    const user = await this.getUser(userId);

    const existingPlayer = await this.playerRepository.findOne({
      where: { user, game_session: gameSession },
    });

    if (!existingPlayer) {
      throw new NotFoundException();
    }

    return existingPlayer;
  }
}
