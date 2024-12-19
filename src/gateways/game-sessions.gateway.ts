import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameSessionService } from '@Services/game-session/game-session.service';
import { WebSocketNamespace } from '@Enums/websocket/websocket-namespace.enum';
import { WebSocketEvent } from '@Enums/websocket/websocket-event.enum';
import { ResponseHelper } from '@Helpers/response/response.helper';
import { forwardRef, Inject } from '@nestjs/common';
import { GameSessionPhase } from '@Enums/game-session/game-session-phase.enum';
import { PlayerDto } from '@Dtos/player.dto';

@WebSocketGateway({
  namespace: new RegExp(WebSocketNamespace.GAME_SESSION),
  cors: true,
})
export class GameSessionsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => GameSessionService))
    private readonly gameSessionService: GameSessionService,
  ) {}

  async handleConnection(client: Socket) {
    const gameSessionToken = client.nsp.name.split('/').pop();

    try {
      await this.gameSessionService.getGameSession(gameSessionToken);
    } catch (e) {
      client.disconnect(true);
      return;
    }
  }

  emitPhaseChangedEvent(
    gameSessionToken: string,
    phase: GameSessionPhase,
  ): void {
    this.emitEvent(WebSocketEvent.GAME_SESSION_PHASE_UPDATED, {
      game_session_token: gameSessionToken,
      phase,
    });
  }

  emitPlayerUpdatedEvent(playerDto: PlayerDto): void {
    this.emitEvent(WebSocketEvent.PLAYER_UPDATED, {
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
