import { PlayerDto } from '@Dtos/player.dto';
import { DTOTypeMapping } from '@Types/dto/dto-type-mapping.type';
import { Player } from '@Entities/player.entity';
import { DtoHelper } from '@Helpers/dto/dto.helper';
import { GameSession } from '@Entities/game-session.entity';
import { GameSessionPhase } from '@Enums/game-session/game-session-phase.enum';

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
    public phase: GameSessionPhase,
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
        gameSession.phase,
        gameSession.created_at,
        gameSession.updated_at,
      ),
      gameSession,
      this.typeMapping,
      properties,
    );
  }
}
