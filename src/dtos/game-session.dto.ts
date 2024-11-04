import { PlayerDto } from '@dtos/player.dto';
import { DTOTypeMapping } from '@custom-types/dto/dto-type-mapping.type';
import { Player } from '@entities/player.entity';
import { DtoHelper } from '@helpers/dto.helper';
import { GameSession } from '@entities/game-session.entity';

export class GameSessionDto {
  private static readonly typeMapping: DTOTypeMapping = {
    players: (players: Player[]) =>
      players.map((player) =>
        PlayerDto.fromEntity(player, {
          user: true,
          character: true,
        }),
      ),
  };

  constructor(
    public id: number,
    public token: string,
    public created_at: Date,
    public updated_at: Date,
    public players?: PlayerDto[],
  ) {}

  static fromEntity(
    gameSession: GameSession,
    properties?: { players?: true },
  ): GameSessionDto {
    return DtoHelper.populateDtoWithOptionalProperties(
      new GameSessionDto(
        gameSession.id,
        gameSession.token,
        gameSession.created_at,
        gameSession.updated_at,
      ),
      gameSession,
      this.typeMapping,
      properties,
    );
  }
}
