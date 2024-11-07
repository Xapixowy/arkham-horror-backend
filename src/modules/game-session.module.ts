import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameSession } from '@Entities/game-session.entity';
import { GameSessionController } from '@Controllers/game-session.controller';
import { GameSessionService } from '@Services/game-session/game-session.service';
import { User } from '@Entities/user.entity';
import { PlayerService } from '@Services/player/player.service';
import { Player } from '@Entities/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameSession, User, Player])],
  controllers: [GameSessionController],
  providers: [GameSessionService, PlayerService],
})
export class GameSessionModule {}
