import { PlayerDto } from '@DTOs/player.dto';
import { DTOTypeMapping } from '@Types/DTO/dto-type-mapping.type';
import { Player } from '@Entities/player.entity';
import { DtoHelper } from '@Helpers/dto.helper';
import { GameSession } from '@Entities/game-session.entity';

export class GameSessionDto {
  private static readonly typeMapping: DTOTypeMapping = {
    players: (players: Player[]) =>
      players.map((player) => PlayerDto.fromEntity(player)),
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
