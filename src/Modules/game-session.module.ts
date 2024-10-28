import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameSession } from '@Entities/game-session.entity';
import { GameSessionController } from '@Controllers/game-session.controller';
import { GameSessionService } from '@Services/game_session.service';
import { User } from '@Entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameSession, User])],
  controllers: [GameSessionController],
  providers: [GameSessionService],
})
export class GameSessionModule {}
