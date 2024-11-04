import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameSession } from '@entities/game-session.entity';
import { GameSessionController } from '@controllers/game-session.controller';
import { GameSessionService } from '@services/game_session.service';
import { User } from '@entities/user.entity';
import { PlayerService } from '@services/player.service';
import { Player } from '@entities/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameSession, User, Player])],
  controllers: [GameSessionController],
  providers: [GameSessionService, PlayerService],
})
export class GameSessionModule {}
