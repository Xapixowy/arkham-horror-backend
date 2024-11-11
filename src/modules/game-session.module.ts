import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameSession } from '@Entities/game-session.entity';
import { GameSessionController } from '@Controllers/game-session.controller';
import { GameSessionService } from '@Services/game-session/game-session.service';
import { User } from '@Entities/user.entity';
import { PlayerService } from '@Services/player/player.service';
import { Player } from '@Entities/player.entity';
import { PlayerController } from '@Controllers/player.controller';
import { Character } from '@Entities/character.entity';
import { Card } from '@Entities/card.entity';
import { PlayerCard } from '@Entities/player-card.entity';
import { GameSessionsGateway } from '@Gateways/game-sessions.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GameSession,
      User,
      Player,
      Character,
      Card,
      PlayerCard,
    ]),
  ],
  controllers: [GameSessionController, PlayerController],
  providers: [GameSessionService, PlayerService, GameSessionsGateway],
  exports: [GameSessionService, PlayerService],
})
export class GameSessionModule {}
