import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebSocketNamespace } from '@Enums/websocket/websocket-namespace.enum';
import { WebSocketEvent } from '@Enums/websocket/websocket-event.enum';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { GameSessionPhase } from '@Enums/game-session/game-session-phase.enum';
import { PlayerDto } from '@Dtos/player.dto';

@WebSocketGateway({
  namespace: WebSocketNamespace.GAME_SESSION,
  cors: true,
})
export class GameSessionsGateway {
  @WebSocketServer() server: Server;

  emitPhaseChangedEvent(
    gameSessionToken: string,
    phase: GameSessionPhase,
  ): void {
    this.emitEvent(WebSocketEvent.GAME_SESSION_PHASE_UPDATED, {
      game_session_token: gameSessionToken,
      phase,
    });
  }

  emitPlayerUpdatedEvent(gameSessionToken: string, playerDto: PlayerDto): void {
    this.emitEvent(WebSocketEvent.PLAYER_UPDATED, {
      game_session_token: gameSessionToken,
      player: playerDto,
    });
  }

  emitGameSessionPlayerJoinedEvent(
    gameSessionToken: string,
    playerDto: PlayerDto,
  ): void {
    this.emitEvent(WebSocketEvent.GAME_SESSION_PLAYER_JOINED, {
      game_session_token: gameSessionToken,
      player: playerDto,
    });
  }

  private emitEvent(event: WebSocketEvent, data: any): void {
    this.server.emit(event, ResponseHelper.buildResponse(data));
  }
}
